#!/usr/bin/env python3
"""
Fetch QC-related data from KakoBuy product pages using Playwright (headless browser).

Extracts: weight, dimensions, delivery days, and QC-style product photos.

Prerequisites:
    pip install playwright beautifulsoup4
    playwright install chromium

Usage:
    python scripts/fetch-qc-data.py
    python scripts/fetch-qc-data.py --test 5
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.parse

# Add user site-packages for Playwright
sys.path.insert(0, os.path.expanduser("~/Library/Python/3.9/lib/python/site-packages"))

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("Playwright not found. Install with:")
    print("  pip install playwright && playwright install chromium")
    sys.exit(1)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
PRODUCTS_PATH = os.path.join(PROJECT_ROOT, "src", "data", "products.json")
PROGRESS_PATH = os.path.join(PROJECT_ROOT, "products-qc-progress.json")

REQUEST_DELAY = 1.5  # seconds between requests
SAVE_EVERY = 25
PAGE_TIMEOUT = 20000  # ms


def load_products():
    with open(PRODUCTS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_products(products, path=PRODUCTS_PATH):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
        f.write("\n")


def build_kakobuy_url(source_link):
    return f"https://www.kakobuy.com/item/details?url={urllib.parse.quote(source_link, safe='')}"


def extract_weight(text):
    """Extract weight from 'Weight(g): 937' pattern."""
    m = re.search(r'Weight\s*\(?g\)?\s*:?\s*(\d+)', text, re.IGNORECASE)
    if m:
        val = int(m.group(1))
        return val if val > 0 else None
    return None


def extract_dimensions(text):
    """Extract dimensions from 'Volume(cm3): 39*38*11' pattern."""
    m = re.search(r'Volume\s*\(?cm[³3]?\)?\s*:?\s*(\d+)\s*\*\s*(\d+)\s*\*\s*(\d+)', text, re.IGNORECASE)
    if m:
        a, b, c = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if a > 0 and b > 0 and c > 0:
            return f"{a}x{b}x{c} cm"
    return None


def extract_delivery_days(text):
    """Extract from 'Average days of arrival: 5days' pattern."""
    m = re.search(r'Average\s+days\s+of\s+arrival\s*:?\s*(\d+)\s*days?', text, re.IGNORECASE)
    if m:
        val = int(m.group(1))
        return val if val > 0 else None
    return None


def is_product_image(src):
    """Check if URL is a real product image (not UI/logo)."""
    if not src:
        return False
    src_lower = src.lower()
    if not any(ext in src_lower for ext in ['.jpg', '.jpeg', '.png', '.webp']):
        return False
    if any(skip in src_lower for skip in ['logo', 'icon', 'favicon', 'avatar', 'banner', 'sprite', 'micro.png', 'nstatic']):
        return False
    if 'geilicdn.com' in src_lower or 'alicdn.com' in src_lower or 'tbcdn.cn' in src_lower:
        return True
    return False


def scrape_product(page, source_link):
    """Scrape a single KakoBuy product page. Returns dict with extracted data."""
    result = {
        "qc_photos": [],
        "weight_g": None,
        "dimensions": None,
        "delivery_days": None,
    }

    url = build_kakobuy_url(source_link)
    try:
        page.goto(url, wait_until="networkidle", timeout=PAGE_TIMEOUT)
    except Exception:
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=PAGE_TIMEOUT)
            page.wait_for_timeout(3000)
        except Exception:
            return result

    try:
        text = page.inner_text("body")
    except Exception:
        return result

    # Extract structured data
    result["weight_g"] = extract_weight(text)
    result["dimensions"] = extract_dimensions(text)
    result["delivery_days"] = extract_delivery_days(text)

    # Extract product images as QC photo sets
    qc_images = []
    try:
        imgs = page.query_selector_all("img")
        for img in imgs:
            src = img.get_attribute("src") or img.get_attribute("data-src") or ""
            if is_product_image(src):
                # Normalize URL
                if src.startswith("//"):
                    src = "https:" + src
                # Get high-res version (remove size constraints)
                src_hires = re.sub(r'\?w=\d+&h=\d+', '', src)
                qc_images.append(src_hires)
    except Exception:
        pass

    # Deduplicate by base URL
    seen = set()
    unique = []
    for img in qc_images:
        base = img.split("?")[0]
        if base not in seen:
            seen.add(base)
            unique.append(img)

    # Group into QC sets (gallery images vs variant/detail images)
    # First ~5 are usually gallery, rest are detail/variant images
    if unique:
        sets = []
        # Gallery images (first batch, usually thumbnails of main product)
        gallery = unique[:min(6, len(unique))]
        if gallery:
            sets.append({
                "set": "Product Gallery",
                "images": gallery,
            })
        # Detail images (remaining, usually from product description)
        detail = unique[6:]
        if detail:
            chunk_size = 5
            for i in range(0, len(detail), chunk_size):
                chunk = detail[i:i + chunk_size]
                sets.append({
                    "set": f"Detail Photos #{len(sets)}",
                    "images": chunk,
                })
        result["qc_photos"] = sets

    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--test", type=int, help="Only process first N products")
    args = parser.parse_args()

    products = load_products()
    total = len(products)

    # Filter to products that need QC data
    to_process = []
    for i, p in enumerate(products):
        if not p.get("source_link"):
            continue
        # Skip if already has weight or QC photos
        if p.get("weight_g") and p.get("qc_photos"):
            continue
        to_process.append(i)

    if args.test:
        to_process = to_process[:args.test]

    print(f"Fetching QC data for {len(to_process)} products (skipping {total - len(to_process)})")
    print()

    processed = 0
    enriched = 0

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 800},
        )
        page = context.new_page()

        for idx in to_process:
            p = products[idx]
            processed += 1
            name = p.get("name", "Unknown")[:40]

            try:
                data = scrape_product(page, p["source_link"])
            except Exception as e:
                print(f"[{processed}/{len(to_process)}] ERROR {name} -- {e}")
                time.sleep(REQUEST_DELAY)
                continue

            # Apply data
            has_data = False
            if data["weight_g"] and not p.get("weight_g"):
                p["weight_g"] = data["weight_g"]
                has_data = True
            if data["dimensions"] and not p.get("dimensions"):
                p["dimensions"] = data["dimensions"]
                has_data = True
            if data["delivery_days"] and not p.get("delivery_days"):
                p["delivery_days"] = data["delivery_days"]
                has_data = True
            if data["qc_photos"] and not p.get("qc_photos"):
                p["qc_photos"] = data["qc_photos"]
                has_data = True

            if has_data:
                enriched += 1

            # Log
            qc_count = len(data["qc_photos"])
            total_imgs = sum(len(s["images"]) for s in data["qc_photos"])
            weight_str = f"{data['weight_g']}g" if data["weight_g"] else "-"
            days_str = f"~{data['delivery_days']}d" if data["delivery_days"] else "-"
            dims_str = data["dimensions"] or "-"
            status = "OK" if has_data else "skip"

            print(f"[{processed}/{len(to_process)}] {status} {name} -- {total_imgs} imgs, {weight_str}, {days_str}, {dims_str}")

            # Save progress
            if processed % SAVE_EVERY == 0:
                save_products(products, PROGRESS_PATH)
                print(f"  Saved progress ({processed} processed, {enriched} enriched)")

            time.sleep(REQUEST_DELAY)

        browser.close()

    # Final save
    save_products(products, PRODUCTS_PATH)
    save_products(products, PROGRESS_PATH)

    print()
    print(f"Done! {processed} checked, {enriched} enriched with QC data.")
    print(f"Results saved to {PRODUCTS_PATH}")


if __name__ == "__main__":
    main()
