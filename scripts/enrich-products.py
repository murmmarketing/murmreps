#!/usr/bin/env python3
"""
Enrich products with missing prices and images by scraping KakoBuy pages.
Usage:
  python3 scripts/enrich-products.py --dry-run
  python3 scripts/enrich-products.py --limit 50
  python3 scripts/enrich-products.py --prices-only
  python3 scripts/enrich-products.py --images-only
  python3 scripts/enrich-products.py --collection girls
"""

import sys, os, json, time, re, argparse, urllib.parse, urllib.request

sys.path.insert(0, os.path.expanduser("~/Library/Python/3.9/lib/python/site-packages"))
from playwright.sync_api import sync_playwright

# Load .env.local
env = {}
env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")
with open(env_path) as f:
    for line in f:
        line = line.strip()
        if "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip("[]")

SUPABASE_URL = env["NEXT_PUBLIC_SUPABASE_URL"]
SERVICE_KEY = env["SUPABASE_SERVICE_ROLE_KEY"]
HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}

def supabase_get(endpoint, params=""):
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}?{params}"
    req = urllib.request.Request(url, headers=HEADERS)
    resp = urllib.request.urlopen(req, timeout=15)
    return json.loads(resp.read())

def supabase_patch(table, id, data):
    url = f"{SUPABASE_URL}/rest/v1/{table}?id=eq.{id}"
    body = json.dumps(data).encode()
    req = urllib.request.Request(url, data=body, headers=HEADERS, method="PATCH")
    urllib.request.urlopen(req, timeout=15)

def extract_item_id(source_link):
    if not source_link:
        return None
    m = re.search(r"itemID=(\d+)", source_link, re.I)
    if m:
        return m.group(1)
    m = re.search(r"[?&]id=(\d+)", source_link)
    if m:
        return m.group(1)
    m = re.search(r"offer/(\d+)", source_link)
    if m:
        return m.group(1)
    return None

def build_kakobuy_url(source_link):
    encoded = urllib.parse.quote(source_link, safe="")
    return f"https://www.kakobuy.com/item/details?url={encoded}"

def scrape_kakobuy(page, source_link):
    """Scrape price and image from KakoBuy product page."""
    url = build_kakobuy_url(source_link)
    try:
        page.goto(url, wait_until="networkidle", timeout=20000)
    except Exception:
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=15000)
            time.sleep(2)
        except Exception:
            return None, None

    price = None
    image = None

    try:
        text = page.inner_text("body")
        # Extract price — look for CNY price pattern
        price_m = re.search(r"[¥￥]\s*(\d+(?:\.\d+)?)", text)
        if price_m:
            p_val = float(price_m.group(1))
            if p_val > 0:
                price = p_val
        # Try USD pattern (KakoBuy shows USD prices like $22.91)
        if not price:
            usd_m = re.search(r"\$\s*(\d+(?:\.\d+)?)", text)
            if usd_m:
                usd = float(usd_m.group(1))
                if 0 < usd < 5000:
                    price = round(usd / 0.14, 2)
        # Try bare number after "Price" text
        if not price:
            bare_m = re.search(r"(?:price|Price)[:\s]*(\d+(?:\.\d+)?)", text)
            if bare_m:
                val = float(bare_m.group(1))
                if val > 1:
                    price = val if val > 10 else round(val / 0.14, 2)
    except Exception:
        pass

    try:
        # Extract main product image
        imgs = page.query_selector_all("img")
        for img in imgs:
            src = img.get_attribute("src") or img.get_attribute("data-src") or ""
            if src and "geilicdn.com" in src and "logo" not in src.lower() and "icon" not in src.lower() and "banner" not in src.lower():
                # Get the high-res version
                if "w=90" in src or "w=200" in src:
                    src = re.sub(r"\?w=\d+&h=\d+", "?w=640&h=640", src)
                image = src
                break
    except Exception:
        pass

    return price, image

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--prices-only", action="store_true")
    parser.add_argument("--images-only", action="store_true")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--collection", type=str, default="")
    args = parser.parse_args()

    # Fetch products needing enrichment
    print("Fetching products needing enrichment...")

    needs_price = []
    needs_image = []
    offset = 0

    while True:
        params = "select=id,name,source_link,price_cny,image,collection&order=id"
        params += f"&offset={offset}&limit=1000"
        if args.collection:
            params += f"&collection=eq.{args.collection}"

        data = supabase_get("products", params)
        if not data:
            break

        for p in data:
            sl = p.get("source_link") or ""
            if not sl or ("weidian.com" not in sl and "taobao.com" not in sl and "1688.com" not in sl):
                continue
            if p.get("price_cny") is None or p["price_cny"] == 0:
                needs_price.append(p)
            if not p.get("image"):
                needs_image.append(p)

        if len(data) < 1000:
            break
        offset += 1000

    print(f"Need price: {len(needs_price)}")
    print(f"Need image: {len(needs_image)}")

    if args.dry_run:
        print("Dry run — exiting.")
        return

    # Determine what to process
    if args.prices_only:
        to_process = {p["id"]: p for p in needs_price}
    elif args.images_only:
        to_process = {p["id"]: p for p in needs_image}
    else:
        to_process = {}
        for p in needs_price + needs_image:
            to_process[p["id"]] = p

    items = list(to_process.values())
    if args.limit:
        items = items[:args.limit]

    print(f"\nProcessing {len(items)} products...")

    prices_updated = 0
    images_updated = 0
    failed = 0

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        page = browser.new_page()

        for i, product in enumerate(items):
            pid = product["id"]
            name = (product.get("name") or "")[:50]
            sl = product.get("source_link", "")

            print(f"[{i+1}/{len(items)}] {name} (id:{pid})...", end=" ", flush=True)

            try:
                price, image = scrape_kakobuy(page, sl)
            except Exception as e:
                print(f"ERROR: {e}")
                failed += 1
                time.sleep(1)
                continue

            update = {}
            need_price = product.get("price_cny") is None or product["price_cny"] == 0
            need_image = not product.get("image")

            if price and need_price and not args.images_only:
                update["price_cny"] = price
                update["price_usd"] = round(price * 0.14, 2)
                update["price_eur"] = round(price * 0.13, 2)
                # Auto-tier
                if price < 50:
                    update["tier"] = "budget"
                elif price < 150:
                    update["tier"] = "mid"
                else:
                    update["tier"] = "premium"

            if image and need_image and not args.prices_only:
                update["image"] = image

            if update:
                try:
                    supabase_patch("products", pid, update)
                    parts = []
                    if "price_cny" in update:
                        parts.append(f"Y{update['price_cny']}")
                        prices_updated += 1
                    if "image" in update:
                        parts.append("img")
                        images_updated += 1
                    print(f"OK {' + '.join(parts)}")
                except Exception as e:
                    print(f"UPDATE ERROR: {e}")
                    failed += 1
            else:
                reason = []
                if need_price and not price:
                    reason.append("no price")
                if need_image and not image:
                    reason.append("no image")
                print(f"SKIP ({', '.join(reason) or 'nothing needed'})")

            time.sleep(1.2)  # Rate limit

        browser.close()

    print(f"\nDone! Prices: {prices_updated}, Images: {images_updated}, Failed: {failed}")

    # Save log
    log = f"Prices updated: {prices_updated}/{len(needs_price)}. Images updated: {images_updated}/{len(needs_image)}. Failed: {failed}.\n"
    with open(os.path.join(os.path.dirname(__file__), "enrich-products.log"), "w") as f:
        f.write(log)
    print(f"Log saved to scripts/enrich-products.log")

if __name__ == "__main__":
    main()
