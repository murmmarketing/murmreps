#!/usr/bin/env python3
"""
Fetch product images and variant data for all products.

Strategy per platform:
  - Weidian: Scrape SSR HTML for gallery images + thor API for SKU/variant data
  - Taobao: Attempt mobile API (rate-limited, may fail)
  - 1688: Attempt page scrape (may fail)
  - Fallback: Scrape KakoBuy/CnFans HTML pages (SPAs, limited data)

Reads src/data/products.json, enriches each product with:
  - "images": list of all image URLs (deduplicated)
  - "variants": list of {name, image?, price?} dicts

Usage:
    python scripts/fetch-kakobuy-images.py
    python scripts/fetch-kakobuy-images.py --test 3
"""

import argparse
import html as html_module
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
    print("  pip install beautifulsoup4")
    sys.exit(1)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
PRODUCTS_PATH = os.path.join(PROJECT_ROOT, "src", "data", "products.json")
PROGRESS_PATH = os.path.join(PROJECT_ROOT, "products-progress.json")

REQUEST_DELAY = 1
SAVE_EVERY = 25
REQUEST_TIMEOUT = 15

HEADERS_BROWSER = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "en-US,en;q=0.9",
}

HEADERS_MOBILE = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

IMAGE_DOMAINS = [
    "geilicdn.com", "alicdn.com", "tbcdn.cn", "taobaocdn.com",
    "cbu01.alicdn.com", "img.alicdn.com", "si.geilicdn.com",
]

_printed_raw_html = False


def load_products():
    with open(PRODUCTS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_products(products, path=PRODUCTS_PATH):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
        f.write("\n")


def normalize_url(url):
    if not url:
        return url
    if url.startswith("//"):
        return "https:" + url
    return url


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


def build_cnfans_url(source_link):
    platform, item_id = parse_source_link(source_link)
    if platform and item_id:
        return f"https://cnfans.com/product?platform={platform}&id={item_id}&ref=17439797"
    return f"https://cnfans.com/product?url={urllib.parse.quote(source_link, safe='')}&ref=17439797"


def fetch_url(url, headers=None, timeout=REQUEST_TIMEOUT):
    hdrs = headers or HEADERS_BROWSER
    req = urllib.request.Request(url, headers=hdrs)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8", errors="replace")


def is_product_image(src):
    if not src:
        return False
    src_lower = src.lower()
    return any(domain in src_lower for domain in IMAGE_DOMAINS)


def dedupe_images(images):
    """Deduplicate images, preferring non-.webp versions, removing query-param variants."""
    seen_bases = {}
    unique = []
    for img in images:
        if not img:
            continue
        # Normalize: strip .webp suffix and query params for dedup purposes
        base = re.sub(r'\.webp$', '', img.split('?')[0])
        if base not in seen_bases:
            seen_bases[base] = img
            unique.append(img)
    return unique


# ---------------------------------------------------------------------------
# Weidian fetchers
# ---------------------------------------------------------------------------

def fetch_weidian_images(item_id):
    """
    Fetch product gallery images from Weidian's SSR HTML page.
    The page embeds product data as HTML-escaped JSON in the initial HTML.
    """
    url = f"https://weidian.com/item.html?itemID={item_id}"
    try:
        raw = fetch_url(url, headers=HEADERS_MOBILE)
    except Exception:
        return []

    # Double-unescape HTML entities to get clean URLs
    decoded = html_module.unescape(html_module.unescape(raw))

    # Extract product images: URLs matching the "open" image pattern from geilicdn
    # These are the product gallery images (not UI/logo images)
    all_imgs = set(re.findall(
        r'https://si\.geilicdn\.com/open[^\s"\'<>&;]+\.(?:png|jpg|jpeg)',
        decoded
    ))

    # Sort for consistent ordering - the main image tends to come first in the HTML
    images = sorted(all_imgs)
    return images


def fetch_weidian_variants(item_id):
    """Fetch variant/SKU data from Weidian's Thor API."""
    api_url = (
        f"https://thor.weidian.com/detail/getItemSkuInfo/1.0"
        f"?param=%7B%22itemId%22%3A%22{item_id}%22%7D"
    )
    headers = {
        "User-Agent": HEADERS_MOBILE["User-Agent"],
        "Referer": "https://weidian.com/",
        "Accept": "application/json",
    }
    try:
        text = fetch_url(api_url, headers=headers)
        data = json.loads(text)
    except Exception:
        return [], None

    result = data.get("result", {})
    if not result:
        return [], None

    main_pic = result.get("itemMainPic", "")
    variants = []
    seen_names = set()

    # Extract from attrList (color/size selectors with images)
    attr_list = result.get("attrList", [])
    for attr in attr_list:
        if not isinstance(attr, dict):
            continue
        attr_values = attr.get("attrValues", [])
        for val in attr_values:
            if not isinstance(val, dict):
                continue
            name = val.get("attrValue", "").strip()
            if not name or name in seen_names:
                continue
            seen_names.add(name)
            v = {"name": name}
            img = val.get("img", "")
            if img:
                v["image"] = normalize_url(img)
            variants.append(v)

    # If no variants from attrList, try skuInfos
    if not variants:
        sku_infos = result.get("skuInfos", [])
        for sku_entry in sku_infos:
            if not isinstance(sku_entry, dict):
                continue
            sku_info = sku_entry.get("skuInfo", {})
            if not isinstance(sku_info, dict):
                continue
            title = sku_info.get("title", "").strip()
            if not title or title in seen_names:
                continue
            seen_names.add(title)
            v = {"name": title}
            img = sku_info.get("img", "")
            if img:
                v["image"] = normalize_url(img)
            price = sku_info.get("discountPrice") or sku_info.get("originalPrice")
            if price is not None:
                try:
                    price_val = float(price)
                    # Weidian prices are in fen (cents)
                    if price_val > 10000:
                        price_val = price_val / 100
                    v["price"] = round(price_val, 2)
                except (ValueError, TypeError):
                    pass
            variants.append(v)

    return variants, normalize_url(main_pic) if main_pic else None


def fetch_weidian_product(item_id):
    """Fetch images and variants for a Weidian product."""
    images = fetch_weidian_images(item_id)
    variants, main_pic = fetch_weidian_variants(item_id)

    # Also gather variant images
    variant_imgs = [v.get("image") for v in variants if v.get("image")]
    for vi in variant_imgs:
        if vi and vi not in images:
            images.append(vi)

    # Ensure main_pic is at the front
    if main_pic and main_pic in images and images[0] != main_pic:
        images.remove(main_pic)
        images.insert(0, main_pic)
    elif main_pic and main_pic not in images:
        images.insert(0, main_pic)

    return dedupe_images(images), variants


# ---------------------------------------------------------------------------
# Taobao fetcher (best effort - heavily rate-limited)
# ---------------------------------------------------------------------------

def fetch_taobao_product(item_id):
    """Try to fetch product data from Taobao's mobile API."""
    api_url = (
        f"https://h5api.m.taobao.com/h5/mtop.taobao.detail.getdetail/6.0/"
        f"?data=%7B%22itemNumId%22%3A%22{item_id}%22%7D"
    )
    headers = {
        "User-Agent": HEADERS_MOBILE["User-Agent"],
        "Referer": "https://m.taobao.com/",
    }
    try:
        text = fetch_url(api_url, headers=headers)
        data = json.loads(text)
    except Exception:
        return [], []

    images = []
    item_data = data.get("data", {})
    item_info = item_data.get("item", {}) or item_data.get("itemInfoModel", {})

    for key in ("images", "picsPath", "smallImages"):
        img_list = item_info.get(key, [])
        if isinstance(img_list, list):
            for img in img_list:
                if isinstance(img, str):
                    url = normalize_url(img.strip())
                    if url and url not in images:
                        images.append(url)

    # Try apiStack
    api_stack = item_data.get("apiStack", [])
    if isinstance(api_stack, list):
        for entry in api_stack:
            if isinstance(entry, dict) and "value" in entry:
                try:
                    val = json.loads(entry["value"])
                    nested_item = val.get("data", {}).get("item", {})
                    for key in ("images", "picsPath"):
                        for img in nested_item.get(key, []):
                            url = normalize_url(img.strip()) if isinstance(img, str) else ""
                            if url and url not in images:
                                images.append(url)
                except (json.JSONDecodeError, TypeError):
                    pass

    return images, []


# ---------------------------------------------------------------------------
# HTML scraping fallback (KakoBuy / CnFans)
# ---------------------------------------------------------------------------

def extract_images_from_html(html, soup):
    """Extract product image URLs from an agent page's HTML."""
    images = []

    # JSON-LD
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string or "")
            if isinstance(data, dict) and "image" in data:
                img = data["image"]
                if isinstance(img, str):
                    images.append(normalize_url(img))
                elif isinstance(img, list):
                    images.extend(normalize_url(u) for u in img if isinstance(u, str))
        except (json.JSONDecodeError, TypeError):
            pass

    # og:image
    for meta in soup.find_all("meta", property="og:image"):
        content = meta.get("content")
        if content:
            images.append(normalize_url(content))

    # Image arrays in scripts
    for script in soup.find_all("script"):
        text = script.string or ""
        for pattern in [r'"images"\s*:\s*\[(.*?)\]', r'"imageList"\s*:\s*\[(.*?)\]',
                        r'"gallery"\s*:\s*\[(.*?)\]', r'"imgList"\s*:\s*\[(.*?)\]']:
            for match in re.finditer(pattern, text, re.DOTALL):
                urls = re.findall(r'"(https?://[^"]+)"', match.group(1))
                images.extend(normalize_url(u) for u in urls)

    # Gallery sections
    for selector in [".goods-gallery", ".product-gallery", ".swiper-wrapper",
                     ".carousel", "[class*='gallery']", "[class*='carousel']"]:
        for container in soup.select(selector):
            for img in container.find_all("img"):
                src = img.get("src") or img.get("data-src") or img.get("data-lazy")
                if src:
                    images.append(normalize_url(src))

    # Product domain images
    for img in soup.find_all("img"):
        src = img.get("src") or img.get("data-src") or img.get("data-lazy")
        if src and is_product_image(src):
            images.append(normalize_url(src))

    # URLs in scripts
    for script in soup.find_all("script"):
        text = script.string or ""
        urls = re.findall(r'https?://[^\s"\'<>]+\.(?:jpg|jpeg|png|webp)', text)
        for u in urls:
            if is_product_image(u):
                images.append(normalize_url(u))

    return dedupe_images(images)


def extract_variants_from_html(html, soup):
    """Extract variant data from HTML."""
    variants = []
    for script in soup.find_all("script"):
        text = script.string or ""
        for pattern in [r'"skuList"\s*:\s*(\[.*?\])', r'"variants"\s*:\s*(\[.*?\])',
                        r'"colorList"\s*:\s*(\[.*?\])']:
            for match in re.finditer(pattern, text, re.DOTALL):
                try:
                    data = json.loads(match.group(1))
                    for item in data:
                        if isinstance(item, dict):
                            name = (item.get("name") or item.get("title") or
                                    item.get("color") or "")
                            if name:
                                v = {"name": str(name)}
                                image = item.get("image") or item.get("img") or ""
                                if image:
                                    v["image"] = normalize_url(str(image))
                                variants.append(v)
                except (json.JSONDecodeError, TypeError):
                    pass

    # Dedupe by name
    seen = set()
    unique = []
    for v in variants:
        if v["name"] not in seen:
            seen.add(v["name"])
            unique.append(v)
    return unique


# ---------------------------------------------------------------------------
# Main processing
# ---------------------------------------------------------------------------

def process_product(product, index, total, print_html=False):
    """Fetch images and variants for a single product."""
    global _printed_raw_html

    source_link = product.get("source_link", "")
    name = product.get("name", "Unknown")

    if not source_link:
        print(f"[{index}/{total}] \u26a0\ufe0f {name} \u2014 skipped: no source_link")
        return False

    # Skip if already has 2+ images
    existing_images = product.get("images", [])
    if isinstance(existing_images, list) and len(existing_images) >= 2:
        print(f"[{index}/{total}] \u23ed\ufe0f {name} \u2014 skipped: already has {len(existing_images)} images")
        return False

    platform, item_id = parse_source_link(source_link)
    images = []
    variants = []
    source_used = "none"

    # ---- Strategy 1: Direct platform API ----
    try:
        if platform == "WEIDIAN" and item_id:
            images, variants = fetch_weidian_product(item_id)
            if images:
                source_used = "Weidian API"

        elif platform == "TAOBAO" and item_id:
            images, variants = fetch_taobao_product(item_id)
            if images:
                source_used = "Taobao API"
    except Exception as e:
        pass  # Fall through to HTML scraping

    # ---- Strategy 2: Scrape KakoBuy HTML ----
    if not images:
        try:
            kakobuy_url = build_kakobuy_url(source_link)
            html = fetch_url(kakobuy_url)
            if print_html and not _printed_raw_html:
                _printed_raw_html = True
                print(f"\n{'='*80}")
                print(f"RAW HTML from KakoBuy (first 2000 chars):")
                print(f"URL: {kakobuy_url}")
                print(f"{'='*80}")
                print(html[:2000])
                print(f"{'='*80}\n")
            soup = BeautifulSoup(html, "html.parser")
            images = extract_images_from_html(html, soup)
            if not variants:
                variants = extract_variants_from_html(html, soup)
            if images:
                source_used = "KakoBuy HTML"
        except Exception:
            pass

    # ---- Strategy 3: Scrape CnFans HTML ----
    if not images:
        try:
            cnfans_url = build_cnfans_url(source_link)
            html = fetch_url(cnfans_url)
            soup = BeautifulSoup(html, "html.parser")
            images = extract_images_from_html(html, soup)
            if not variants:
                variants = extract_variants_from_html(html, soup)
            if images:
                source_used = "CnFans HTML"
        except Exception as e:
            pass

    # Update product data
    if images:
        existing_main = product.get("image", "")
        if existing_main and existing_main not in images:
            images.insert(0, existing_main)
        elif existing_main and existing_main in images and images[0] != existing_main:
            images.remove(existing_main)
            images.insert(0, existing_main)

        product["images"] = images
        if not product.get("image"):
            product["image"] = images[0]

    if variants:
        product["variants"] = variants

    img_count = len(images)
    var_count = len(variants)

    if img_count > 0 or var_count > 0:
        print(f"[{index}/{total}] \u2705 {name} \u2014 {img_count} images, {var_count} variants ({source_used})")
    else:
        print(f"[{index}/{total}] \u26a0\ufe0f {name} \u2014 no data found")

    return img_count > 0


def main():
    parser = argparse.ArgumentParser(description="Fetch product images from KakoBuy / source platforms")
    parser.add_argument("--test", type=int, default=0,
                        help="Limit processing to first N products (for testing)")
    args = parser.parse_args()

    products = load_products()
    total_all = len(products)
    limit = args.test if args.test > 0 else total_all
    print_html = args.test > 0

    print(f"Loaded {total_all} products. Processing up to {min(limit, total_all)}...")
    print()

    success_count = 0
    processed = 0

    for i, product in enumerate(products[:limit], start=1):
        try:
            ok = process_product(product, i, min(limit, total_all), print_html=print_html)
            if ok:
                success_count += 1
            processed += 1
        except Exception as e:
            pname = product.get("name", "Unknown")
            print(f"[{i}/{min(limit, total_all)}] \u26a0\ufe0f {pname} \u2014 error: {e}")

        # Save progress periodically
        if processed > 0 and processed % SAVE_EVERY == 0:
            save_products(products, PROGRESS_PATH)
            print(f"  Saved progress ({processed} processed)")

        # Delay between requests
        if i < limit:
            time.sleep(REQUEST_DELAY)

    # Save final results
    save_products(products, PRODUCTS_PATH)
    save_products(products, PROGRESS_PATH)

    print()
    print(f"Done! {success_count}/{processed} products enriched.")
    print(f"Results saved to {PRODUCTS_PATH}")


if __name__ == "__main__":
    main()
