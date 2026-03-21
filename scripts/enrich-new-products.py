#!/usr/bin/env python3
"""Enrich placeholder products in Supabase by scraping KakoBuy pages via Playwright."""

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

# Category detection (same as recategorize.js)
CATEGORY_RULES = [
    # Check specific before general
    ('Jeans', ['jeans', 'denim pants']),
    ('T-Shirts', ['tee ', 't-shirt', 'tshirt', 'short sleeve']),
    ('Hoodies', ['hoodie', 'hooded', 'zip-up', 'zip up']),
    ('Boots', ['boot', 'martin', 'chelsea', 'combat', 'desert boot', 'texan']),
    ('Slides & Sandals', ['slide', 'sandal', 'slipper', 'crocs', 'foam runner', 'yeezy slide', 'clog']),
    ('Sneakers', ['sneaker', 'jordan', ' aj1', ' aj4', ' aj11', 'dunk', 'air force', ' af1', 'yeezy 350', 'yeezy 500', 'yeezy 700', 'new balance', 'converse', 'vans ', 'trainer', 'runner']),
    ('Shoes', ['shoe', 'loafer', 'derby', 'oxford', 'mule', 'espadrille', 'heel', 'pump']),
    ('Coats & Puffers', ['coat', 'puffer', 'down jacket', 'parka', 'quilted', 'moncler', 'canada goose']),
    ('Jackets', ['jacket', 'bomber', 'windbreaker', 'varsity', 'harrington']),
    ('Vests', ['vest', 'gilet', 'sleeveless jacket']),
    ('Sweaters', ['sweater', 'knit', 'cardigan', 'pullover', 'knitwear']),
    ('Crewnecks', ['crewneck', 'sweatshirt']),
    ('Shirts', ['shirt', 'button', 'polo', 'flannel']),
    ('Jerseys', ['jersey', 'football shirt', 'soccer shirt', 'basketball shirt']),
    ('Pants', ['pants', 'trousers', 'cargo', 'jogger', 'sweatpants', 'track pants']),
    ('Shorts', ['short', 'swim trunk']),
    ('Tracksuits', ['tracksuit', 'track suit']),
    ('Watches', ['watch', 'rolex', 'datejust', 'submariner', 'daytona']),
    ('Necklaces', ['necklace', 'chain', 'pendant', 'choker']),
    ('Bracelets', ['bracelet', 'bangle', 'cuff', 'wristband']),
    ('Earrings', ['earring', 'stud', 'hoop', 'ear cuff']),
    ('Rings', ['ring']),
    ('Bags', ['bag', 'backpack', 'duffle', 'tote', 'crossbody', 'shoulder', 'satchel', 'keepall', 'messenger']),
    ('Wallets', ['wallet', 'card holder', 'purse', 'money clip']),
    ('Belts', ['belt']),
    ('Hats & Caps', ['hat', 'cap', 'beanie', 'bucket hat', 'balaclava']),
    ('Scarves & Gloves', ['scarf', 'glove', 'shawl']),
    ('Sunglasses', ['sunglasses', 'glasses', 'eyewear', 'goggles']),
    ('Phone Cases', ['phone case', 'iphone', 'airpod case']),
    ('Socks & Underwear', ['sock', 'underwear', 'boxer', 'brief']),
    ('Electronics', ['airpod', 'headphone', 'speaker', 'earbud', 'electronic']),
    ('Perfumes', ['perfume', 'fragrance', 'cologne', 'scent']),
    ('Home & Decor', ['ornament', 'figure', 'figurine', 'pillow', 'blanket', 'candle', 'ashtray', 'lego', 'kaws', 'bearbrick']),
    ('Keychains & Accessories', ['keychain', 'key ring', 'lighter', 'pin', 'badge', 'lanyard']),
]

def categorize(name):
    lower = name.lower()
    # Avoid matching "earring" when checking "ring"
    for cat, keywords in CATEGORY_RULES:
        for kw in keywords:
            if cat == 'Rings' and 'earring' in lower:
                continue
            if kw in lower:
                return cat
    return 'T-Shirts'

def get_tier(price):
    if price is None:
        return 'mid'
    if price < 50:
        return 'budget'
    if price < 150:
        return 'mid'
    return 'premium'

def scrape_kakobuy(page, source_link):
    """Scrape product info from KakoBuy page."""
    encoded = urllib.parse.quote(source_link, safe='')
    url = f'https://www.kakobuy.com/item/details?url={encoded}'

    try:
        page.goto(url, wait_until='networkidle', timeout=20000)
    except Exception:
        try:
            page.goto(url, wait_until='domcontentloaded', timeout=15000)
            time.sleep(3)
        except Exception:
            return None

    result = {}

    # Check if product exists on KakoBuy
    try:
        text = page.inner_text('body')
        if 'may not exist' in text or 'page not found' in text.lower():
            return None
    except Exception:
        pass

    # Get product name - look for the line before "Refresh" which contains the Chinese/English product name
    try:
        text = page.inner_text('body')
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        for i, line in enumerate(lines):
            if 'Refresh' in line or 'refresh' in line:
                # The product name is this line minus " Refresh"
                name = line.replace(' Refresh', '').replace(' refresh', '').strip()
                if name and len(name) > 2:
                    result['name'] = name[:200]
                    break
            # Also check for line right before "CNY"
            if i + 1 < len(lines) and 'CNY' in lines[i + 1] and len(line) > 5:
                if 'Enter shop' not in line and 'kakobuy' not in line.lower():
                    result['name'] = line[:200]
                    break
    except Exception:
        pass

    # Fallback: try CSS selectors
    if 'name' not in result:
        try:
            for sel in ['.goods-info-item-name', '.product-title', 'h1']:
                el = page.query_selector(sel)
                if el:
                    name = el.inner_text().strip()
                    if name and len(name) > 2 and 'kakobuy' not in name.lower():
                        result['name'] = name[:200]
                        break
        except Exception:
            pass

    # Get price - look for "CNY ￥XXX" pattern
    try:
        price_match = re.search(r'CNY\s*[¥￥]\s*(\d+(?:\.\d+)?)', text)
        if not price_match:
            price_match = re.search(r'[¥￥]\s*(\d+(?:\.\d+)?)', text)
        if price_match:
            price = float(price_match.group(1))
            if 0.5 < price < 50000:
                result['price_cny'] = price
                result['price_usd'] = round(price * 0.14, 2)
                result['price_eur'] = round(price * 0.13, 2)
    except Exception:
        pass

    # Get images
    try:
        imgs = page.query_selector_all('img')
        images = []
        for img in imgs:
            src = img.get_attribute('src') or img.get_attribute('data-src') or ''
            if src and 'geilicdn.com' in src and src not in images:
                # Get high-res version
                clean = re.sub(r'\?w=\d+&h=\d+', '', src)
                if clean not in images:
                    images.append(clean)
        if images:
            result['image'] = images[0]
            result['images'] = images[:10]
    except Exception:
        pass

    # Get variants
    try:
        variant_imgs = page.query_selector_all('img[src*="geilicdn"]')
        variants = []
        seen = set()
        for img in variant_imgs:
            src = img.get_attribute('src') or ''
            alt = img.get_attribute('alt') or ''
            parent = img.evaluate('el => el.closest("[class*=sku], [class*=variant], [class*=color]")')
            if parent and src and src not in seen:
                seen.add(src)
                clean_src = re.sub(r'\?w=\d+&h=\d+', '', src)
                variants.append({'name': alt or f'Variant {len(variants)+1}', 'image': clean_src})
        if variants:
            result['variants'] = variants[:20]
    except Exception:
        pass

    # Get weight/delivery
    try:
        text = page.inner_text('body')
        weight_match = re.search(r'Weight\(g\):\s*(\d+)', text)
        if weight_match and int(weight_match.group(1)) > 0:
            result['weight_g'] = int(weight_match.group(1))

        delivery_match = re.search(r'Average days of arrival:\s*(\d+)', text)
        if delivery_match and int(delivery_match.group(1)) > 0:
            result['delivery_days'] = int(delivery_match.group(1))

        dims_match = re.search(r'Volume\(cm.\):\s*(\d+)\*(\d+)\*(\d+)', text)
        if dims_match and int(dims_match.group(1)) > 0:
            result['dimensions'] = f"{dims_match.group(1)}x{dims_match.group(2)}x{dims_match.group(3)} cm"
    except Exception:
        pass

    return result if result else None


def main():
    # Fetch placeholder products
    products = supabase_get('products?name=like.New%20Product*&select=id,name,source_link&order=id')
    total = len(products)
    print(f"Found {total} products to enrich\n")

    if total == 0:
        print("Nothing to do!")
        return

    enriched = 0
    failed = 0

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )

        for i, product in enumerate(products):
            pid = product['id']
            source = product['source_link']

            print(f"[{i+1}/{total}] Scraping ID {pid}...", end=' ', flush=True)

            data = scrape_kakobuy(page, source)

            if data and 'name' in data:
                name = data['name']
                price = data.get('price_cny')
                category = categorize(name)
                tier = get_tier(price)

                update = {
                    'name': name,
                    'category': category,
                    'tier': tier,
                }
                if price:
                    update['price_cny'] = price
                    update['price_usd'] = data.get('price_usd')
                    update['price_eur'] = data.get('price_eur')
                if data.get('image'):
                    update['image'] = data['image']
                if data.get('images'):
                    update['images'] = data['images']
                if data.get('variants'):
                    update['variants'] = data['variants']
                if data.get('weight_g'):
                    update['weight_g'] = data['weight_g']
                if data.get('delivery_days'):
                    update['delivery_days'] = data['delivery_days']
                if data.get('dimensions'):
                    update['dimensions'] = data['dimensions']

                supabase_patch('products', pid, update)
                enriched += 1
                print(f"OK {name[:50]} -- {category} -- {'Y'+str(int(price)) if price else 'no price'}")
            else:
                failed += 1
                print("no data found")

            time.sleep(1.5)

        browser.close()

    print(f"\nDone! {enriched} enriched, {failed} failed out of {total}")


if __name__ == '__main__':
    main()
