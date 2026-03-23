#!/usr/bin/env python3
"""
Batch-process product images into premium studio photos:
  1. Download original image
  2. Remove background with rembg
  3. Composite onto studio backdrop (warm gray gradient + shadow)
  4. Upload to Supabase Storage
  5. Update product image URL in the database

Usage:
  python scripts/premium-photos.py              # process 50 premium/popular products
  python scripts/premium-photos.py --limit 10   # process 10
  python scripts/premium-photos.py --product-id 42  # process one product
  python scripts/premium-photos.py --dry-run    # show what would be processed
"""

import argparse
import json
import logging
import os
import sys
import time
from io import BytesIO
from pathlib import Path

import requests
from PIL import Image, ImageDraw, ImageFilter
from rembg import remove

# ── Config ──────────────────────────────────────────────────────────────────

ROOT = Path(__file__).resolve().parent.parent
ENV_PATH = ROOT / ".env.local"
LOG_PATH = ROOT / "scripts" / "premium-photos.log"

CANVAS_W, CANVAS_H = 800, 1000  # 3:4 ratio
JPEG_QUALITY = 92
UPLOAD_DELAY = 0.5
DOWNLOAD_TIMEOUT = 10

# Studio backdrop colours
GRAD_TOP = (242, 240, 237)       # #F2F0ED
GRAD_BOTTOM = (232, 229, 224)    # #E8E5E0
SHADOW_ALPHA = 15                # ~6% opacity

# ── Helpers ─────────────────────────────────────────────────────────────────

def load_env():
    """Read .env.local and return dict of key=value pairs."""
    env = {}
    if ENV_PATH.exists():
        for line in ENV_PATH.read_text().splitlines():
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip("[]")
    return env


def supabase_headers(service_key):
    return {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def supabase_get(base_url, service_key, table, params=""):
    """GET from Supabase REST API."""
    url = f"{base_url}/rest/v1/{table}?{params}"
    r = requests.get(url, headers=supabase_headers(service_key), timeout=15)
    r.raise_for_status()
    return r.json()


def supabase_patch(base_url, service_key, table, match_col, match_val, data):
    """PATCH (update) a row in Supabase."""
    url = f"{base_url}/rest/v1/{table}?{match_col}=eq.{match_val}"
    r = requests.patch(url, headers=supabase_headers(service_key), json=data, timeout=15)
    r.raise_for_status()
    return r.json()


def ensure_bucket(base_url, service_key, bucket_name="product-images"):
    """Create a public storage bucket if it doesn't exist."""
    url = f"{base_url}/storage/v1/bucket"
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
    }
    # Check if bucket exists
    r = requests.get(f"{url}/{bucket_name}", headers=headers, timeout=10)
    if r.status_code == 200:
        return True
    # Create it
    r = requests.post(url, headers=headers, json={
        "id": bucket_name,
        "name": bucket_name,
        "public": True,
    }, timeout=10)
    if r.status_code in (200, 201):
        logging.info(f"Created storage bucket '{bucket_name}'")
        return True
    # Might already exist with different casing
    if r.status_code == 409:
        return True
    logging.error(f"Failed to create bucket: {r.status_code} {r.text}")
    return False


def upload_to_storage(base_url, service_key, bucket, path, image_bytes, content_type="image/jpeg"):
    """Upload (upsert) a file to Supabase Storage with retries for SSL errors."""
    url = f"{base_url}/storage/v1/object/{bucket}/{path}"
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": content_type,
        "x-upsert": "true",
    }
    for attempt in range(3):
        try:
            r = requests.post(url, headers=headers, data=image_bytes, timeout=30)
            if r.status_code in (200, 201):
                public_url = f"{base_url}/storage/v1/object/public/{bucket}/{path}"
                return public_url
            logging.error(f"Upload failed: {r.status_code} {r.text[:200]}")
            return None
        except (requests.exceptions.SSLError, requests.exceptions.ConnectionError) as e:
            if attempt < 2:
                time.sleep(2)
                continue
            logging.error(f"Upload failed after 3 retries: {e}")
            return None


# ── Image processing ────────────────────────────────────────────────────────

def create_studio_backdrop(w=CANVAS_W, h=CANVAS_H):
    """Create a warm gray gradient backdrop with subtle floor shadow."""
    img = Image.new("RGB", (w, h))
    draw = ImageDraw.Draw(img)

    # Vertical gradient
    for y in range(h):
        t = y / h
        r = int(GRAD_TOP[0] + (GRAD_BOTTOM[0] - GRAD_TOP[0]) * t)
        g = int(GRAD_TOP[1] + (GRAD_BOTTOM[1] - GRAD_TOP[1]) * t)
        b = int(GRAD_TOP[2] + (GRAD_BOTTOM[2] - GRAD_TOP[2]) * t)
        draw.line([(0, y), (w, y)], fill=(r, g, b))

    # Floor shadow — soft elliptical gradient in bottom third
    shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    cx, cy = w // 2, int(h * 0.82)
    rx, ry = int(w * 0.35), int(h * 0.08)
    for i in range(ry, 0, -1):
        alpha = int(SHADOW_ALPHA * (1 - i / ry))
        scale_x = int(rx * (i / ry))
        shadow_draw.ellipse(
            [cx - scale_x, cy - i, cx + scale_x, cy + i],
            fill=(0, 0, 0, alpha),
        )
    # Blur the shadow for softness
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=15))
    img.paste(Image.alpha_composite(Image.new("RGBA", (w, h), (0, 0, 0, 0)), shadow).convert("RGB"),
              mask=shadow.split()[3])

    # Subtle vignette — darken edges by ~4%
    vignette = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    vig_draw = ImageDraw.Draw(vignette)
    max_dist = ((w / 2) ** 2 + (h / 2) ** 2) ** 0.5
    for y in range(0, h, 4):  # step by 4 for speed
        for x in range(0, w, 4):
            dist = ((x - w / 2) ** 2 + (y - h / 2) ** 2) ** 0.5
            alpha = int(10 * (dist / max_dist))  # max ~10/255 = 4%
            vig_draw.rectangle([x, y, x + 3, y + 3], fill=(0, 0, 0, alpha))
    img = Image.alpha_composite(img.convert("RGBA"), vignette).convert("RGB")

    return img


def process_image(image_bytes):
    """Remove background and composite onto studio backdrop. Returns JPEG bytes or None."""
    # Remove background
    result_bytes = remove(image_bytes)
    fg = Image.open(BytesIO(result_bytes)).convert("RGBA")

    # Check if removal was successful (not >90% transparent)
    alpha = fg.split()[3]
    total_pixels = alpha.size[0] * alpha.size[1]
    transparent_pixels = sum(1 for p in alpha.getdata() if p < 10)
    if transparent_pixels / total_pixels > 0.90:
        return None  # bg removal failed

    # Scale product to fit within 75% width, 80% height of canvas
    max_w = int(CANVAS_W * 0.75)
    max_h = int(CANVAS_H * 0.80)
    fg.thumbnail((max_w, max_h), Image.LANCZOS)

    # Create backdrop
    backdrop = create_studio_backdrop()

    # Create drop shadow
    shadow_layer = Image.new("RGBA", backdrop.size, (0, 0, 0, 0))
    # Create a shadow from the fg alpha channel
    shadow_img = Image.new("RGBA", fg.size, (0, 0, 0, 20))  # ~8% opacity
    shadow_img.putalpha(fg.split()[3])
    # Position: centered horizontally, lower 70% vertically, offset shadow down 4px
    paste_x = (CANVAS_W - fg.width) // 2
    paste_y = int(CANVAS_H * 0.30) + (int(CANVAS_H * 0.70) - fg.height) // 2
    shadow_layer.paste(shadow_img, (paste_x, paste_y + 4))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=10))

    # Composite: backdrop + shadow + product
    canvas = backdrop.convert("RGBA")
    canvas = Image.alpha_composite(canvas, shadow_layer)
    product_layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    product_layer.paste(fg, (paste_x, paste_y))
    canvas = Image.alpha_composite(canvas, product_layer)

    # Convert to RGB JPEG
    final = canvas.convert("RGB")
    buf = BytesIO()
    final.save(buf, format="JPEG", quality=JPEG_QUALITY, optimize=True)
    return buf.getvalue()


# ── Main ────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Premium product photo processor")
    parser.add_argument("--limit", type=int, default=50, help="Max products to process (default: 50)")
    parser.add_argument("--product-id", type=int, help="Process a single product by ID")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be processed without doing it")
    args = parser.parse_args()

    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(LOG_PATH, mode="a"),
        ],
    )

    env = load_env()
    base_url = env.get("NEXT_PUBLIC_SUPABASE_URL", "")
    service_key = env.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not base_url or not service_key:
        logging.error("Missing Supabase credentials in .env.local")
        sys.exit(1)

    # Fetch products to process
    if args.product_id:
        params = f"id=eq.{args.product_id}&select=id,name,image,images,tier,views"
    else:
        # Premium tier OR views > 400, with non-null image, not already supabase URLs
        params = (
            "or=(tier.eq.premium,views.gt.400)"
            "&image=not.is.null"
            "&image=not.eq."
            "&image=not.like.*supabase*"
            f"&select=id,name,image,images,tier,views"
            f"&order=views.desc"
            f"&limit={args.limit}"
        )

    products = supabase_get(base_url, service_key, "products", params)
    # Filter out already-processed (supabase URLs) client-side too
    products = [p for p in products if p.get("image") and "supabase" not in p["image"]]

    if not products:
        logging.info("No products to process.")
        return

    logging.info(f"Found {len(products)} products to process")

    if args.dry_run:
        logging.info("\n=== DRY RUN — would process these products ===")
        for i, p in enumerate(products, 1):
            logging.info(f"  [{i}] {p['name'][:50]} (id: {p['id']}, views: {p.get('views', 0)}, tier: {p.get('tier', '?')})")
        logging.info(f"\nTotal: {len(products)} products")
        return

    # Ensure storage bucket exists
    if not ensure_bucket(base_url, service_key):
        logging.error("Could not create/find storage bucket. Aborting.")
        sys.exit(1)

    processed = 0
    skipped = 0

    for i, product in enumerate(products, 1):
        pid = product["id"]
        name = product.get("name", "Unknown")[:50]
        image_url = product["image"]

        logging.info(f"[{i}/{len(products)}] Processing: {name} (id: {pid})...")

        # Download original image
        try:
            r = requests.get(image_url, timeout=DOWNLOAD_TIMEOUT, headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
            })
            r.raise_for_status()
            original_bytes = r.content
        except Exception as e:
            logging.info(f"  x Skipped: download failed ({e})")
            skipped += 1
            continue

        # Process image (remove bg + studio composite)
        try:
            result_bytes = process_image(original_bytes)
            if result_bytes is None:
                logging.info(f"  x Skipped: bg removal produced mostly transparent image")
                skipped += 1
                continue
        except Exception as e:
            logging.info(f"  x Skipped: processing error ({e})")
            skipped += 1
            continue

        size_kb = len(result_bytes) / 1024

        # Upload to Supabase Storage
        storage_path = f"premium/{pid}.jpg"
        public_url = upload_to_storage(base_url, service_key, "product-images", storage_path, result_bytes)
        if not public_url:
            logging.info(f"  x Skipped: upload failed")
            skipped += 1
            continue

        # Update product in database — store old URL in images array
        old_images = product.get("images") or []
        if isinstance(old_images, str):
            try:
                old_images = json.loads(old_images)
            except Exception:
                old_images = []
        # Prepend original URL if not already there
        if image_url and image_url not in old_images:
            old_images = [image_url] + old_images

        try:
            supabase_patch(base_url, service_key, "products", "id", pid, {
                "image": public_url,
                "images": old_images,
            })
        except Exception as e:
            logging.info(f"  x Skipped: database update failed ({e})")
            skipped += 1
            continue

        processed += 1
        logging.info(f"  > Uploaded premium/{pid}.jpg ({size_kb:.0f}KB)")

        time.sleep(UPLOAD_DELAY)

    logging.info(f"\nDone: {processed}/{len(products)} processed, {skipped} skipped")


if __name__ == "__main__":
    main()
