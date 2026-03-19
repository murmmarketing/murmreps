#!/usr/bin/env python3
"""Batch remove backgrounds from product images and replace with #0a0a0a black."""

import json
import os
import shutil
import time
from io import BytesIO
from pathlib import Path

import requests
from PIL import Image
from rembg import remove

ROOT = Path(__file__).resolve().parent.parent
PRODUCTS_JSON = ROOT / "src" / "data" / "products.json"
PROGRESS_JSON = ROOT / "products-progress.json"
OUTPUT_DIR = ROOT / "public" / "products"
WEBP_QUALITY = 85
BG_COLOR = (10, 10, 10)  # #0a0a0a
BATCH_SAVE = 25
DELAY = 0.2

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Resume from progress if it exists
    if PROGRESS_JSON.exists():
        print("Resuming from products-progress.json...")
        products = json.loads(PROGRESS_JSON.read_text())
    else:
        products = json.loads(PRODUCTS_JSON.read_text())

    total = sum(1 for p in products if p.get("image") and not p["image"].startswith("/products/"))
    done = 0

    for i, product in enumerate(products):
        image_url = product.get("image", "")

        # Skip if no image or already processed
        if not image_url or image_url.startswith("/products/"):
            continue

        pid = product["id"]
        out_path = OUTPUT_DIR / f"{pid}.webp"

        # Skip if file already exists (crash recovery)
        if out_path.exists():
            product["image"] = f"/products/{pid}.webp"
            done += 1
            print(f"[{done}/{total}] ⏭️  {product['name'][:50]} — already exists")
            continue

        try:
            # Download
            resp = requests.get(image_url, timeout=15)
            resp.raise_for_status()
            input_img = Image.open(BytesIO(resp.content)).convert("RGBA")

            # Remove background
            output_bytes = remove(resp.content)
            fg = Image.open(BytesIO(output_bytes)).convert("RGBA")

            # Create black background and composite
            bg = Image.new("RGBA", fg.size, (*BG_COLOR, 255))
            result = Image.alpha_composite(bg, fg).convert("RGB")

            # Save as webp
            result.save(str(out_path), "WEBP", quality=WEBP_QUALITY)

            product["image"] = f"/products/{pid}.webp"
            done += 1
            print(f"[{done}/{total}] ✅ {product['name'][:50]} — saved as {pid}.webp")

        except Exception as e:
            done += 1
            print(f"[{done}/{total}] ❌ {product['name'][:50]} — {e}")

        # Save progress periodically
        if done % BATCH_SAVE == 0:
            PROGRESS_JSON.write_text(json.dumps(products, indent=2))
            print(f"    💾 Progress saved ({done}/{total})")

        time.sleep(DELAY)

    # Final save
    PROGRESS_JSON.write_text(json.dumps(products, indent=2))
    shutil.copy2(PROGRESS_JSON, PRODUCTS_JSON)
    print(f"\n🎉 Done! Processed {done} images.")
    print(f"   Updated {PRODUCTS_JSON}")

if __name__ == "__main__":
    main()
