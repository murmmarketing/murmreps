const fs = require("fs");
const path = require("path");

const PRODUCTS_PATH = path.join(__dirname, "../src/data/products.json");
const SAVE_EVERY = 50;
const REQUEST_DELAY = 500;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function extractWeidianId(url) {
  const m = url.match(/itemID=(\d+)/i);
  return m ? m[1] : null;
}

function extractTaobaoId(url) {
  const m = url.match(/[?&]id=(\d+)/);
  return m ? m[1] : null;
}

async function fetchWeidianImage(itemId) {
  // Use the thor API which returns structured JSON with itemMainPic
  const apiUrl = `https://thor.weidian.com/detail/getItemSkuInfo/1.0?param=${encodeURIComponent(JSON.stringify({ itemId: String(itemId) }))}`;
  try {
    const res = await fetch(apiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
        Referer: "https://weidian.com/",
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.result && data.result.itemMainPic) {
        let img = data.result.itemMainPic;
        if (img.startsWith("//")) img = "https:" + img;
        return img;
      }
    }
  } catch (e) {
    // API failed, try HTML fallback
  }

  // Fallback: scrape the HTML page for embedded image data
  try {
    const res = await fetch(
      `https://weidian.com/item.html?itemID=${itemId}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    );
    if (res.ok) {
      const html = await res.text();
      const decoded = html.replace(/&#34;/g, '"').replace(/&amp;/g, "&");
      // Match any geilicdn product image (not tiny icons)
      const m = decoded.match(
        /"(https:\/\/si\.geilicdn\.com\/(?:open|pcset|img-)[^"]+unadjust_\d+_\d+\.(?:png|jpg|jpeg|webp))"/
      );
      if (m) return m[1];
    }
  } catch (e) {
    // Both methods failed
  }
  return null;
}

async function fetchTaobaoImage(itemId) {
  const url = `https://item.taobao.com/item.htm?id=${itemId}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    if (res.ok) {
      const html = await res.text();
      const ogMatch = html.match(
        /<meta\s+property="og:image"\s+content="([^"]+)"/i
      );
      if (ogMatch) return ogMatch[1];
      const imgMatch = html.match(
        /https?:\/\/img\.alicdn\.com\/[^"'\s]+\.(?:jpg|png|webp)/i
      );
      if (imgMatch) return imgMatch[0];
    }
  } catch (e) {
    // Failed
  }
  return null;
}

function saveProducts(products) {
  fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2) + "\n");
}

async function main() {
  const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, "utf8"));
  const toFetch = products.filter(
    (p) =>
      (p.image === "" || p.image === null || p.image === undefined) &&
      p.source_link &&
      (p.source_link.includes("weidian.com") ||
        p.source_link.includes("taobao.com"))
  );

  console.log(`Total products: ${products.length}`);
  console.log(`Already have image: ${products.filter((p) => p.image).length}`);
  console.log(`To fetch: ${toFetch.length}`);
  console.log("");

  let fetched = 0;
  let found = 0;
  let failed = 0;

  for (const product of toFetch) {
    fetched++;
    const idx = products.findIndex((p) => p.id === product.id);
    console.log(
      `Fetching image ${fetched}/${toFetch.length}... ${product.name}`
    );

    let imageUrl = null;

    if (product.source_link.includes("weidian.com")) {
      const itemId = extractWeidianId(product.source_link);
      if (itemId) {
        imageUrl = await fetchWeidianImage(itemId);
      } else {
        console.log("    Could not extract weidian itemID");
      }
    } else if (product.source_link.includes("taobao.com")) {
      const itemId = extractTaobaoId(product.source_link);
      if (itemId) {
        imageUrl = await fetchTaobaoImage(itemId);
      } else {
        console.log("    Could not extract taobao id");
      }
    }

    if (imageUrl) {
      if (imageUrl.startsWith("//")) imageUrl = "https:" + imageUrl;
      products[idx].image = imageUrl;
      found++;
      console.log(`    OK: ${imageUrl.substring(0, 80)}...`);
    } else {
      failed++;
      console.log("    MISS: no image found");
    }

    // Save progress periodically
    if (fetched % SAVE_EVERY === 0) {
      saveProducts(products);
      console.log(
        `\n--- Saved progress (${fetched}/${toFetch.length}, ${found} found, ${failed} missed) ---\n`
      );
    }

    await sleep(REQUEST_DELAY);
  }

  // Final save
  saveProducts(products);
  console.log(`\nDone!`);
  console.log(`Found: ${found}/${toFetch.length}`);
  console.log(`Failed: ${failed}/${toFetch.length}`);
}

main().catch(console.error);
