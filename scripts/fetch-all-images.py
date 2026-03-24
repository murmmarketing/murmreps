#!/usr/bin/env python3
"""Fetch images and prices for ALL products missing them via KakoBuy scraping."""

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

def supabase_patch(table, id, data):
    body = json.dumps(data).encode()
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/{table}?id=eq.{id}",
        data=body,
        method='PATCH',
        headers={
            'apikey': SERVICE_KEY,
            'Authorization': f'Bearer {SERVICE_KEY}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        }
    )
    urllib.request.urlopen(req)

def scrape_kakobuy(page, source_link):
    """Scrape a KakoBuy product page for images, name, price, variants."""
    encoded = urllib.parse.quote(source_link, safe='')
    url = f"https://www.kakobuy.com/item/details?url={encoded}"

    try:
        page.goto(url, wait_until='networkidle', timeout=20000)
    except Exception:
        try:
            page.goto(url, wait_until='domcontentloaded', timeout=15000)
            time.sleep(3)
        except Exception:
            return None

    result = {}

    try:
        text = page.inner_text('body')
        lines = text.split('\n')
    except Exception:
        return None

    # Extract name from the page title area
    try:
        title_el = page.query_selector('.goods-info-title, .product-title, h1')
        if title_el:
            name = title_el.inner_text().strip()
            if name and len(name) > 2 and name != 'KakoBuy':
                result['name'] = name[:200]
    except Exception:
        pass

    # Extract price
    for line in lines:
        line = line.strip()
        m = re.search(r'[¥￥]\s*(\d+(?:\.\d+)?)', line)
        if m:
            price = float(m.group(1))
            if 1 < price < 50000:
                result['price_cny'] = price
                result['price_usd'] = round(price * 0.14, 2)
                result['price_eur'] = round(price * 0.13, 2)
                break

    # Extract images
    imgs = page.query_selector_all('img')
    image_urls = []
    for img in imgs:
        src = img.get_attribute('src') or img.get_attribute('data-src') or ''
        if src and 'geilicdn.com' in src and 'logo' not in src.lower() and 'icon' not in src.lower():
            # Get high-res version
            clean = re.sub(r'\?w=\d+&h=\d+', '', src)
            if clean not in image_urls:
                image_urls.append(clean)

    if image_urls:
        result['image'] = image_urls[0]
        if len(image_urls) > 1:
            result['images'] = image_urls[:10]

    # Extract variants
    variants = []
    try:
        variant_els = page.query_selector_all('.sku-item, .color-item, [class*=variant], [class*=sku]')
        for el in variant_els[:20]:
            vname = el.inner_text().strip()
            vimg = ''
            img_el = el.query_selector('img')
            if img_el:
                vimg = img_el.get_attribute('src') or ''
            if vname and len(vname) < 100:
                variants.append({'name': vname, 'image': vimg})
    except Exception:
        pass
    if variants:
        result['variants'] = variants

    return result if result else None

def main():
    # Fetch products needing images (prioritize those with source_links)
    print("Fetching products needing images...")

    # Get products with no image but have source_link, ordered by id
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

    # Also get products with images but no price
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

    # Combine: image-less first, then price-less
    seen_ids = set()
    all_products = []
    for p in products:
        if p['id'] not in seen_ids:
            all_products.append(p)
            seen_ids.add(p['id'])
    for p in no_price:
        if p['id'] not in seen_ids:
            all_products.append(p)
            seen_ids.add(p['id'])

    total = len(all_products)
    print(f"Found {total} products to enrich ({len(products)} need images, {len(no_price)} need prices)")

    if total == 0:
        print("Nothing to do!")
        return

    enriched = 0
    failed = 0

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')

        for i, product in enumerate(all_products):
            pid = product['id']
            name = (product.get('name') or 'Unknown')[:50]
            source = product.get('source_link', '')

            if not source or ('weidian.com' not in source and 'taobao.com' not in source and '1688.com' not in source):
                print(f"[{i+1}/{total}] SKIP {name} (no valid source)")
                failed += 1
                continue

            print(f"[{i+1}/{total}] Scraping ID {pid}...", end=' ', flush=True)

            try:
                data = scrape_kakobuy(page, source)
            except Exception as e:
                print(f"ERROR: {str(e)[:60]}")
                failed += 1
                time.sleep(1)
                continue

            if not data or (not data.get('image') and not data.get('price_cny')):
                print(f"no data found")
                failed += 1
                time.sleep(1)
                continue

            # Build update
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
            if data.get('name') and product.get('name', '').startswith('Product '):
                update['name'] = data['name']

            if update:
                try:
                    supabase_patch('products', pid, update)
                    parts = []
                    if 'image' in update:
                        parts.append('img')
                    if 'price_cny' in update:
                        parts.append(f"Y{update['price_cny']}")
                    if 'variants' in update:
                        parts.append(f"{len(update['variants'])}var")
                    if 'name' in update:
                        parts.append('renamed')
                    print(f"OK {name} -- {', '.join(parts)}")
                    enriched += 1
                except Exception as e:
                    print(f"UPDATE ERROR: {str(e)[:60]}")
                    failed += 1
            else:
                print(f"nothing new")
                failed += 1

            time.sleep(1.2)

            # Progress checkpoint
            if (i + 1) % 50 == 0:
                print(f"\n--- Checkpoint: {enriched} enriched, {failed} failed out of {i+1} ---\n")

        browser.close()

    print(f"\nDone! {enriched} enriched, {failed} failed out of {total}")

if __name__ == '__main__':
    main()
