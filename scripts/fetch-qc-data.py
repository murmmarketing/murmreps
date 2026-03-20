#!/usr/bin/env python3
"""
Fetch QC photos, delivery time, weight, and dimensions from KakoBuy product pages.

For each product with a source_link:
  1. Build KakoBuy URL
  2. Scrape the page for QC data, weight, dimensions, delivery estimates
  3. Save enriched data back to products.json

Usage:
    python scripts/fetch-qc-data.py
    python scripts/fetch-qc-data.py --test 3
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
import urllib.error

try:
    from bs4 import BeautifulSoup
except ImportError:
    print("BeautifulSoup not found. Install with:")
    print("  pip install beautifulsoup4 --break-system-packages")
    sys.exit(1)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
PRODUCTS_PATH = os.path.join(PROJECT_ROOT, "src", "data", "products.json")
PROGRESS_PATH = os.path.join(PROJECT_ROOT, "products-qc-progress.json")

REQUEST_DELAY = 1
SAVE_EVERY = 25
REQUEST_TIMEOUT = 15

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

HEADERS_MOBILE = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

QC_IMAGE_DOMAINS = [
    "geilicdn.com", "alicdn.com", "tbcdn.cn", "taobaocdn.com",
    "kakobuy.com", "img.kakobuy.com", "cnfans.com",
]


def load_products():
    with open(PRODUCTS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_products(products, path=PRODUCTS_PATH):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
        f.write("\n")


def fetch_url(url, headers=None, timeout=REQUEST_TIMEOUT):
    hdrs = headers or HEADERS
    req = urllib.request.Request(url, headers=hdrs)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8", errors="replace")


def parse_source_link(link):
    """Detect platform and extract item ID from a source link."""
    if not link:
        return None, None
    try:
        parsed = urllib.parse.urlparse(link)
        host = (parsed.hostname or "").lower()
        params = urllib.parse.parse_qs(parsed.query)

        if "weidian.com" in host:
            item_id = (params.get("itemID") or params.get("itemId") or [None])[0]
            return "WEIDIAN", item_id

        if "taobao.com" in host or "tmall.com" in host:
            item_id = (params.get("id") or [None])[0]
            return "TAOBAO", item_id

        if "1688.com" in host:
            m = re.search(r"(\d+)\.html", parsed.path)
            return "ALI_1688", m.group(1) if m else None
    except Exception:
        pass
    return None, None


def build_kakobuy_url(source_link):
    return f"https://www.kakobuy.com/item/details?url={urllib.parse.quote(source_link, safe='')}"


def extract_weight(text):
    """Extract weight in grams from text."""
    # Match patterns like "937g", "1.2kg", "0.5 kg"
    m = re.search(r'(\d+(?:\.\d+)?)\s*kg', text, re.IGNORECASE)
    if m:
        return int(float(m.group(1)) * 1000)
    m = re.search(r'(\d+)\s*g(?:ram)?', text, re.IGNORECASE)
    if m:
        return int(m.group(1))
    return None


def extract_dimensions(text):
    """Extract dimensions like '39x38x11 cm'."""
    m = re.search(r'(\d+)\s*[xX*]\s*(\d+)\s*[xX*]\s*(\d+)\s*(?:cm|CM)?', text)
    if m:
        return f"{m.group(1)}x{m.group(2)}x{m.group(3)} cm"
    return None


def extract_delivery_days(text):
    """Extract delivery estimate in days."""
    # Match "~5 days", "3-5 days", "5 working days", etc.
    m = re.search(r'~?\s*(\d+)\s*(?:-\s*\d+\s*)?(?:working\s+)?days?', text, re.IGNORECASE)
    if m:
        return int(m.group(1))
    return None


def is_qc_image(src):
    """Check if URL looks like a QC/product image."""
    if not src:
        return False
    src_lower = src.lower()
    # Must be a real image URL
    if not any(ext in src_lower for ext in ['.jpg', '.jpeg', '.png', '.webp']):
        return False
    # Filter out tiny icons, logos, UI elements
    if any(skip in src_lower for skip in ['logo', 'icon', 'favicon', 'avatar', 'banner', 'sprite']):
        return False
    return True


def scrape_kakobuy_qc(source_link):
    """
    Scrape KakoBuy product page for QC data.
    Returns dict with qc_photos, weight_g, dimensions, delivery_days.
    """
    result = {
        "qc_photos": [],
        "weight_g": None,
        "dimensions": None,
        "delivery_days": None,
    }

    url = build_kakobuy_url(source_link)
    try:
        html = fetch_url(url)
    except Exception as e:
        return result

    soup = BeautifulSoup(html, "html.parser")
    page_text = soup.get_text(" ", strip=True)

    # --- Extract weight ---
    result["weight_g"] = extract_weight(page_text)

    # --- Extract dimensions ---
    result["dimensions"] = extract_dimensions(page_text)

    # --- Extract delivery days ---
    result["delivery_days"] = extract_delivery_days(page_text)

    # --- Extract QC photos ---
    # Look for QC-related sections in the page
    qc_images = []

    # Strategy 1: Find images in QC/review sections
    for section in soup.find_all(['div', 'section'], class_=re.compile(r'qc|quality|review|check|photo', re.I)):
        imgs = section.find_all('img')
        for img in imgs:
            src = img.get('src') or img.get('data-src') or img.get('data-lazy')
            if src and is_qc_image(src):
                if src.startswith('//'):
                    src = 'https:' + src
                qc_images.append(src)

    # Strategy 2: Look for embedded JSON data with QC info
    for script in soup.find_all('script'):
        text = script.string or ""
        # Look for JSON objects with QC/review image arrays
        for match in re.finditer(r'"(?:qc|review|check)(?:_?(?:images?|photos?))"\s*:\s*\[([^\]]+)\]', text, re.I):
            urls = re.findall(r'"(https?://[^"]+\.(?:jpg|jpeg|png|webp))"', match.group(1))
            qc_images.extend(urls)

        # Look for any image arrays in embedded data
        for match in re.finditer(r'"(?:images?|photos?|pics?)"\s*:\s*\[([^\]]{50,})\]', text, re.I):
            urls = re.findall(r'"(https?://[^"]+\.(?:jpg|jpeg|png|webp))"', match.group(1))
            # Only add if they look like product/QC images (not UI)
            for u in urls:
                if is_qc_image(u):
                    qc_images.append(u)

    # Strategy 3: Look for image galleries/carousels
    for gallery in soup.find_all(['div', 'ul'], class_=re.compile(r'gallery|carousel|swiper|slider|photo', re.I)):
        imgs = gallery.find_all('img')
        for img in imgs:
            src = img.get('src') or img.get('data-src') or img.get('data-lazy')
            if src and is_qc_image(src):
                if src.startswith('//'):
                    src = 'https:' + src
                qc_images.append(src)

    # Deduplicate
    seen = set()
    unique_qc = []
    for img in qc_images:
        base = img.split('?')[0]
        if base not in seen:
            seen.add(base)
            unique_qc.append(img)

    # Group into sets of ~5 images each (simulating QC photo sets)
    if unique_qc:
        sets = []
        chunk_size = 5
        for i in range(0, len(unique_qc), chunk_size):
            chunk = unique_qc[i:i + chunk_size]
            sets.append({
                "set": f"KakoBuy QC Set #{len(sets) + 1}",
                "images": chunk,
            })
        result["qc_photos"] = sets

    return result


def scrape_weidian_qc(item_id):
    """
    Attempt to get product specs from Weidian's page.
    Returns dict with weight_g, dimensions, delivery_days.
    """
    result = {
        "qc_photos": [],
        "weight_g": None,
        "dimensions": None,
        "delivery_days": None,
    }

    url = f"https://weidian.com/item.html?itemID={item_id}"
    try:
        html = fetch_url(url, headers=HEADERS_MOBILE)
    except Exception:
        return result

    # Extract weight from page text
    page_text = html  # raw HTML often has specs in text

    result["weight_g"] = extract_weight(page_text)
    result["dimensions"] = extract_dimensions(page_text)

    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--test", type=int, help="Only process first N products")
    args = parser.parse_args()

    products = load_products()
    total = len(products)

    # Filter to products with source links that don't have QC data yet
    to_process = []
    for i, p in enumerate(products):
        if not p.get("source_link"):
            continue
        if p.get("qc_photos") and len(p.get("qc_photos", [])) > 0:
            continue  # Already has QC data
        to_process.append(i)

    if args.test:
        to_process = to_process[:args.test]

    print(f"Fetching QC data for {len(to_process)} products (skipping {total - len(to_process)} already done or no link)")
    print()

    processed = 0
    enriched = 0

    for idx in to_process:
        p = products[idx]
        processed += 1
        source_link = p["source_link"]
        platform, item_id = parse_source_link(source_link)

        qc_data = {
            "qc_photos": [],
            "weight_g": None,
            "dimensions": None,
            "delivery_days": None,
        }

        # Try KakoBuy first
        try:
            kakobuy_data = scrape_kakobuy_qc(source_link)
            qc_data["qc_photos"] = kakobuy_data.get("qc_photos", [])
            qc_data["weight_g"] = kakobuy_data.get("weight_g")
            qc_data["dimensions"] = kakobuy_data.get("dimensions")
            qc_data["delivery_days"] = kakobuy_data.get("delivery_days")
        except Exception as e:
            pass

        # If no weight from KakoBuy and it's Weidian, try Weidian directly
        if not qc_data["weight_g"] and platform == "WEIDIAN" and item_id:
            try:
                wd_data = scrape_weidian_qc(item_id)
                if wd_data.get("weight_g"):
                    qc_data["weight_g"] = wd_data["weight_g"]
                if wd_data.get("dimensions"):
                    qc_data["dimensions"] = wd_data["dimensions"]
            except Exception:
                pass

        # Apply data to product
        has_data = False
        if qc_data["qc_photos"]:
            p["qc_photos"] = qc_data["qc_photos"]
            has_data = True
        if qc_data["weight_g"]:
            p["weight_g"] = qc_data["weight_g"]
            has_data = True
        if qc_data["dimensions"]:
            p["dimensions"] = qc_data["dimensions"]
            has_data = True
        if qc_data["delivery_days"]:
            p["delivery_days"] = qc_data["delivery_days"]
            has_data = True

        if has_data:
            enriched += 1

        # Build log line
        qc_count = len(qc_data["qc_photos"])
        weight_str = f"{qc_data['weight_g']}g" if qc_data["weight_g"] else "no weight"
        days_str = f"~{qc_data['delivery_days']} days" if qc_data["delivery_days"] else "no ETA"
        dims_str = qc_data["dimensions"] or "no dims"
        status = "OK" if has_data else "no data"

        name = p.get("name", "Unknown")[:40]
        print(f"[{processed}/{len(to_process)}] {status} {name} -- {qc_count} QC sets, {weight_str}, {days_str}, {dims_str}")

        # Save progress periodically
        if processed % SAVE_EVERY == 0:
            save_products(products, PROGRESS_PATH)
            print(f"  Saved progress ({processed} processed, {enriched} enriched)")

        time.sleep(REQUEST_DELAY)

    # Final save
    save_products(products, PRODUCTS_PATH)
    save_products(products, PROGRESS_PATH)

    print()
    print(f"Done! {processed} products checked, {enriched} enriched with QC data.")
    print(f"Results saved to {PRODUCTS_PATH}")


if __name__ == "__main__":
    main()
