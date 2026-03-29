#!/usr/bin/env python3
"""Fast image fetcher: uses multiple browser tabs to scrape KakoBuy in parallel."""

import sys
sys.path.insert(0, '/Users/mariuskerkvliet/Library/Python/3.9/lib/python/site-packages')

import json
import re
import time
import urllib.parse
import urllib.request
from playwright.sync_api import sync_playwright

# Read .env.local
env = {}
with open('.env.local') as f:
    for line in f:
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k] = v.strip('[]')

SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
SERVICE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']

def supabase_get(path):
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/{path}",
        headers={'apikey': SERVICE_KEY, 'Authorization': f'Bearer {SERVICE_KEY}'}
    )
    return json.loads(urllib.request.urlopen(req).read())

def supabase_patch(table, pid, data):
    body = json.dumps(data).encode()
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/{table}?id=eq.{pid}",
        data=body, method='PATCH',
        headers={
            'apikey': SERVICE_KEY,
            'Authorization': f'Bearer {SERVICE_KEY}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        }
    )
    urllib.request.urlopen(req)

def scrape_kakobuy(page, source_link):
    """Scrape a KakoBuy product page for images and price."""
    encoded = urllib.parse.quote(source_link, safe='')
    url = f"https://www.kakobuy.com/item/details?url={encoded}"

    try:
        page.goto(url, wait_until='networkidle', timeout=15000)
    except Exception:
        try:
            page.goto(url, wait_until='domcontentloaded', timeout=10000)
            time.sleep(3)
        except Exception:
            return None

    result = {}

    # Extract price from body text
    try:
        text = page.inner_text('body')
        for line in text.split('\n'):
            m = re.search(r'[¥￥]\s*(\d+(?:\.\d+)?)', line.strip())
            if m:
                price = float(m.group(1))
                if 1 < price < 50000:
                    result['price_cny'] = price
                    result['price_usd'] = round(price * 0.14, 2)
                    result['price_eur'] = round(price * 0.13, 2)
                    break
    except Exception:
        pass

    # Extract images from geilicdn
    try:
        imgs = page.query_selector_all('img')
        image_urls = []
        seen = set()
        for img in imgs:
            src = img.get_attribute('src') or img.get_attribute('data-src') or ''
            if src and 'geilicdn.com' in src and 'logo' not in src.lower():
                clean = re.sub(r'\?w=\d+&h=\d+', '', src)
                if clean not in seen:
                    seen.add(clean)
                    image_urls.append(clean)
        if image_urls:
            result['image'] = image_urls[0]
            if len(image_urls) > 1:
                result['images'] = image_urls[:10]
    except Exception:
        pass

    # Extract variants
    try:
        variant_els = page.query_selector_all('.sku-item, .color-item, [class*=variant], [class*=sku]')
        variants = []
        for el in variant_els[:20]:
            vname = el.inner_text().strip()
            vimg = ''
            img_el = el.query_selector('img')
            if img_el:
                vimg = img_el.get_attribute('src') or ''
            if vname and len(vname) < 100:
                variants.append({'name': vname, 'image': vimg})
        if variants:
            result['variants'] = variants
    except Exception:
        pass

    return result if result else None


def main():
    # Load progress
    progress_file = 'scripts/fetch-images-progress.json'
    done_ids = set()
    try:
        with open(progress_file) as f:
            done_ids = set(json.load(f))
    except Exception:
        pass

    print("Fetching products needing images...")
    products = []
    offset = 0
    while True:
        batch = supabase_get(
            f"products?select=id,name,source_link,image,price_cny"
            f"&or=(image.is.null,image.eq.)"
            f"&source_link=neq."
            f"&order=id.asc"
            f"&offset={offset}&limit=1000"
        )
        if not batch:
            break
        products.extend(batch)
        offset += len(batch)
        if len(batch) < 1000:
            break

    # Also get products needing prices
    no_price = []
    offset = 0
    while True:
        batch = supabase_get(
            f"products?select=id,name,source_link,image,price_cny"
            f"&price_cny=is.null"
            f"&source_link=neq."
            f"&image=neq."
            f"&order=id.asc"
            f"&offset={offset}&limit=1000"
        )
        if not batch:
            break
        no_price.extend(batch)
        offset += len(batch)
        if len(batch) < 1000:
            break

    seen = set()
    all_products = []
    for p in products + no_price:
        if p['id'] not in seen and p['id'] not in done_ids:
            all_products.append(p)
            seen.add(p['id'])

    total = len(all_products)
    print(f"Found {total} products to process ({len(products)} need images, {len(no_price)} need prices, {len(done_ids)} already done)")

    if total == 0:
        print("Nothing to do!")
        return

    enriched = 0
    failed = 0
    img_found = 0

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')

        for i, product in enumerate(all_products):
            pid = product['id']
            name = (product.get('name') or 'Unknown')[:40]
            source = product.get('source_link', '')

            if not source or not any(d in source for d in ['weidian.com', 'taobao.com', '1688.com']):
                failed += 1
                continue

            print(f"[{i+1}/{total}] ID {pid}...", end=' ', flush=True)

            try:
                data = scrape_kakobuy(page, source)
            except Exception as e:
                print(f"ERR: {str(e)[:40]}")
                failed += 1
                done_ids.add(pid)
                time.sleep(0.5)
                # Restart browser on error
                try:
                    page.close()
                    browser.close()
                except Exception:
                    pass
                browser = p.chromium.launch(headless=True)
                page = browser.new_page(user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
                continue

            if not data or (not data.get('image') and not data.get('price_cny')):
                print(f"no data - {name}")
                failed += 1
                done_ids.add(pid)
                time.sleep(0.5)
                continue

            update = {}
            if data.get('image') and not product.get('image'):
                update['image'] = data['image']
            if data.get('images'):
                update['images'] = data['images']
            if data.get('price_cny') and not product.get('price_cny'):
                update['price_cny'] = data['price_cny']
                update['price_usd'] = data['price_usd']
                update['price_eur'] = data['price_eur']
            if data.get('variants'):
                update['variants'] = data['variants']

            if update:
                try:
                    supabase_patch('products', pid, update)
                    parts = []
                    if 'image' in update:
                        parts.append('img')
                        img_found += 1
                    if 'price_cny' in update:
                        parts.append(f"¥{update['price_cny']}")
                    if 'variants' in update:
                        parts.append(f"{len(update['variants'])}var")
                    print(f"OK {name} -- {', '.join(parts)}")
                    enriched += 1
                except Exception as e:
                    print(f"DB ERR: {str(e)[:40]}")
                    failed += 1
            else:
                print(f"nothing new - {name}")

            done_ids.add(pid)
            time.sleep(0.8)

            # Save progress every 25 products
            if (i + 1) % 25 == 0:
                with open(progress_file, 'w') as f:
                    json.dump(list(done_ids), f)
                print(f"\n--- [{i+1}/{total}] {enriched} enriched ({img_found} images), {failed} failed ---\n")

        browser.close()

    # Final save
    with open(progress_file, 'w') as f:
        json.dump(list(done_ids), f)

    print(f"\n{'='*60}")
    print(f"DONE: {enriched} enriched ({img_found} new images), {failed} failed out of {total}")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
