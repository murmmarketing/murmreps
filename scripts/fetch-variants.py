#!/usr/bin/env python3
"""
Fetch variant/SKU data and all product images from Weidian for each product.

Reads src/data/products.json, queries the Weidian API for each product with a
weidian.com source_link, and enriches the product with:
  - "images": list of all image URLs
  - "variants": list of {name, image?, price?} dicts

Usage:
    python scripts/fetch-variants.py
"""

import json
import os
import re
import sys
import time
import urllib.request
import urllib.error
import urllib.parse

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
PRODUCTS_PATH = os.path.join(PROJECT_ROOT, "src", "data", "products.json")
PROGRESS_PATH = os.path.join(PROJECT_ROOT, "products-progress.json")

REQUEST_DELAY = 0.5  # 500ms between requests
SAVE_EVERY = 25
USER_AGENT = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15"


def load_products():
    with open(PRODUCTS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_products(products, path=PRODUCTS_PATH):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
        f.write("\n")


def extract_weidian_id(url):
    """Extract itemID parameter from a Weidian URL."""
    m = re.search(r"itemID=(\d+)", url, re.IGNORECASE)
    return m.group(1) if m else None


def normalize_url(url):
    """Ensure URL starts with https://."""
    if not url:
        return url
    if url.startswith("//"):
        return "https:" + url
    return url


def fetch_weidian_detail(item_id):
    """
    Fetch product detail from Weidian API.
    Returns the parsed JSON response or None on failure.
    """
    api_url = (
        f"https://weidian.com/ajax/queryItemDetail-v2.ashx?itemId={item_id}"
    )
    req = urllib.request.Request(
        api_url,
        headers={
            "User-Agent": USER_AGENT,
            "Referer": "https://weidian.com/",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data
    except (urllib.error.URLError, json.JSONDecodeError, OSError) as e:
        print(f"    [WARN] API request failed: {e}")
        return None


def extract_images(data):
    """
    Extract all product image URLs from the Weidian API response.
    Tries multiple known paths in the response structure.
    """
    images = []

    result = data.get("result", {})
    if not result:
        return images

    item_detail = result.get("itemDetail", result)

    # Primary: itemDetail.images (list of image URLs)
    raw_images = item_detail.get("images", [])
    if isinstance(raw_images, list):
        for img in raw_images:
            if isinstance(img, str) and img.strip():
                images.append(normalize_url(img.strip()))
            elif isinstance(img, dict):
                url = img.get("url") or img.get("src") or img.get("image") or ""
                if url.strip():
                    images.append(normalize_url(url.strip()))

    # Also try itemDetail.itemMainPic as fallback for main image
    main_pic = item_detail.get("itemMainPic", "")
    if main_pic and isinstance(main_pic, str):
        main_pic = normalize_url(main_pic.strip())
        if main_pic and main_pic not in images:
            images.insert(0, main_pic)

    # Also check itemDetail.itemGalleryPics
    gallery = item_detail.get("itemGalleryPics", [])
    if isinstance(gallery, list):
        for img in gallery:
            url = img if isinstance(img, str) else (img.get("url", "") if isinstance(img, dict) else "")
            url = normalize_url(url.strip()) if url else ""
            if url and url not in images:
                images.append(url)

    # Also try itemDetail.bannerImages
    banner = item_detail.get("bannerImages", [])
    if isinstance(banner, list):
        for img in banner:
            url = img if isinstance(img, str) else (img.get("url", "") if isinstance(img, dict) else "")
            url = normalize_url(url.strip()) if url else ""
            if url and url not in images:
                images.append(url)

    return images


def extract_variants(data):
    """
    Extract variant/SKU data from the Weidian API response.
    Returns a list of dicts: [{name, image?, price?}, ...]
    """
    variants = []
    seen_names = set()

    result = data.get("result", {})
    if not result:
        return variants

    item_detail = result.get("itemDetail", result)

    # Try multiple known paths for SKU data
    sku_sources = [
        item_detail.get("skuList", []),
        item_detail.get("skus", []),
        item_detail.get("skuInfoList", []),
    ]

    for sku_list in sku_sources:
        if not isinstance(sku_list, list) or not sku_list:
            continue

        for sku in sku_list:
            if not isinstance(sku, dict):
                continue

            # Extract name from various possible keys
            name = (
                sku.get("title")
                or sku.get("name")
                or sku.get("skuTitle")
                or sku.get("attrName")
                or sku.get("skuName")
                or ""
            ).strip()

            if not name or name in seen_names:
                continue
            seen_names.add(name)

            variant = {"name": name}

            # Extract image
            img = (
                sku.get("img")
                or sku.get("image")
                or sku.get("skuImg")
                or sku.get("pic")
                or ""
            )
            if isinstance(img, str) and img.strip():
                variant["image"] = normalize_url(img.strip())

            # Extract price (if it differs from main)
            price = sku.get("price") or sku.get("skuPrice") or sku.get("salePrice")
            if price is not None:
                try:
                    price_val = float(price) if not isinstance(price, (int, float)) else price
                    # Weidian sometimes returns price in fen (cents), convert if > 10000
                    if price_val > 100000:
                        price_val = price_val / 100
                    variant["price"] = round(price_val, 2)
                except (ValueError, TypeError):
                    pass

            variants.append(variant)

        # If we found variants from one source, don't check others
        if variants:
            break

    # Also check for attrList / attributes style
    if not variants:
        attr_list = item_detail.get("attrList", [])
        if isinstance(attr_list, list):
            for attr in attr_list:
                if not isinstance(attr, dict):
                    continue
                attr_values = attr.get("attrValues", []) or attr.get("values", [])
                if not isinstance(attr_values, list):
                    continue
                for val in attr_values:
                    if isinstance(val, str):
                        name = val.strip()
                    elif isinstance(val, dict):
                        name = (val.get("name") or val.get("attrValue") or "").strip()
                    else:
                        continue
                    if name and name not in seen_names:
                        seen_names.add(name)
                        v = {"name": name}
                        if isinstance(val, dict):
                            img = val.get("img") or val.get("image") or ""
                            if isinstance(img, str) and img.strip():
                                v["image"] = normalize_url(img.strip())
                        variants.append(v)

    return variants


def main():
    products = load_products()

    # Filter to Weidian products that don't already have 2+ images
    to_fetch = []
    for i, p in enumerate(products):
        source = p.get("source_link", "")
        if "weidian.com" not in source:
            continue
        existing_images = p.get("images", [])
        if isinstance(existing_images, list) and len(existing_images) >= 2:
            continue
        to_fetch.append((i, p))

    total = len(to_fetch)
    print(f"Total products: {len(products)}")
    print(f"Weidian products to fetch: {total}")
    print()

    if total == 0:
        print("Nothing to do.")
        return

    success = 0
    skipped = 0

    for count, (idx, product) in enumerate(to_fetch, start=1):
        item_id = extract_weidian_id(product.get("source_link", ""))
        if not item_id:
            print(f"[{count}/{total}] [SKIP] {product.get('name', '?')} -- no itemID in URL")
            skipped += 1
            continue

        data = fetch_weidian_detail(item_id)
        if not data:
            print(f"[{count}/{total}] [WARN] {product.get('name', '?')} -- API returned nothing")
            skipped += 1
            time.sleep(REQUEST_DELAY)
            continue

        images = extract_images(data)
        variants = extract_variants(data)

        # If we got images, store them. Keep existing "image" field as first for backwards compat.
        if images:
            # Ensure the existing main image is first if present
            existing_main = product.get("image", "")
            if existing_main and existing_main not in images:
                images.insert(0, existing_main)
            elif existing_main and existing_main in images and images[0] != existing_main:
                images.remove(existing_main)
                images.insert(0, existing_main)

            products[idx]["images"] = images
            # Keep "image" as the first image for backwards compatibility
            if not products[idx].get("image"):
                products[idx]["image"] = images[0]

        if variants:
            products[idx]["variants"] = variants

        img_count = len(images)
        var_count = len(variants)
        print(f"[{count}/{total}] \u2705 {product.get('name', '?')} \u2014 {img_count} images, {var_count} variants")
        success += 1

        # Save progress periodically
        if count % SAVE_EVERY == 0:
            save_products(products, PROGRESS_PATH)
            print(f"\n--- Saved progress to products-progress.json ({count}/{total}) ---\n")

        time.sleep(REQUEST_DELAY)

    # Final save
    save_products(products, PRODUCTS_PATH)
    print()
    print(f"Done! Enriched {success}/{total} products ({skipped} skipped)")
    print(f"Saved to {PRODUCTS_PATH}")


if __name__ == "__main__":
    main()
