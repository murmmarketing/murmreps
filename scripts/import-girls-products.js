const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load env from .env.local
const envPath = path.join(__dirname, "..", ".env.local");
fs.readFileSync(envPath, "utf8").split("\n").forEach((line) => {
  const [key, ...vals] = line.split("=");
  if (key && vals.length) process.env[key.trim()] = vals.join("=").trim();
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE env vars in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

// ── Tier logic ──
function getTier(price) {
  if (price == null) return null;
  if (price < 150) return "budget";
  if (price < 400) return "value";
  if (price < 800) return "quality";
  return "premium";
}

// ── All products ──
const RAW_PRODUCTS = [
  // ═══════════════════════════════════════
  // BAGS — default category: "Bags"
  // ═══════════════════════════════════════
  { name: "Louis Vuitton Crossbody Bag", brand: "Louis Vuitton", price: 559, source_link: "https://weidian.com/item.html?itemID=7705784412", category: "Bags" },
  { name: "Louis Vuitton Briefcase", brand: "Louis Vuitton", price: 980, source_link: "https://weidian.com/item.html?itemID=7705764646", category: "Bags" },
  { name: "Louis Vuitton Crossbody Bag", brand: "Louis Vuitton", price: 629, source_link: "https://weidian.com/item.html?itemID=7705782416", category: "Bags" },
  { name: "Louis Vuitton Bum Bag", brand: "Louis Vuitton", price: 599, source_link: "https://weidian.com/item.html?itemID=7705210502", category: "Bags" },
  { name: "Louis Vuitton Keepall Duffle Bag", brand: "Louis Vuitton", price: 1080, source_link: "https://weidian.com/item.html?itemID=7702200779", category: "Bags" },
  { name: "Louis Vuitton Backpack", brand: "Louis Vuitton", price: 969, source_link: "https://weidian.com/item.html?itemID=7705192724", category: "Bags" },
  { name: "Louis Vuitton Crossbody Bag", brand: "Louis Vuitton", price: 559, source_link: "https://weidian.com/item.html?itemID=7705108852", category: "Bags" },
  { name: "Louis Vuitton Bum Bag", brand: "Louis Vuitton", price: 559, source_link: "https://weidian.com/item.html?itemID=7702204681", category: "Bags" },
  { name: "Louis Vuitton Backpack", brand: "Louis Vuitton", price: 669, source_link: "https://weidian.com/item.html?itemID=7702723469", category: "Bags" },
  { name: "Prada Crossbody Bag", brand: "Prada", price: 329, source_link: "https://item.taobao.com/item.htm?id=1005490008779", category: "Bags" },
  { name: "Prada Backpack", brand: "Prada", price: 439, source_link: "https://item.taobao.com/item.htm?id=1003940846419", category: "Bags" },
  { name: "Louis Vuitton Handbag", brand: "Louis Vuitton", price: 759, source_link: "https://weidian.com/item.html?itemID=7623332895", category: "Bags" },
  { name: "Louis Vuitton Wallet", brand: "Louis Vuitton", price: 299, source_link: "https://weidian.com/item.html?itemID=7623281339", category: "Wallets" },
  { name: "Louis Vuitton Wallet", brand: "Louis Vuitton", price: 299, source_link: "https://weidian.com/item.html?itemID=7626301020", category: "Wallets" },
  { name: "Louis Vuitton Crossbody Bag", brand: "Louis Vuitton", price: 729, source_link: "https://weidian.com/item.html?itemID=7567875794", category: "Bags" },
  { name: "Louis Vuitton Crossbody Bag", brand: "Louis Vuitton", price: 599, source_link: "https://weidian.com/item.html?itemID=7565042509", category: "Bags" },
  { name: "Louis Vuitton Crossbody Bag", brand: "Louis Vuitton", price: 629, source_link: "https://weidian.com/item.html?itemID=7566938580", category: "Bags" },
  { name: "Louis Vuitton Crossbody Bag", brand: "Louis Vuitton", price: 599, source_link: "https://weidian.com/item.html?itemID=7563539519", category: "Bags" },
  { name: "Louis Vuitton Keepall Duffle Bag", brand: "Louis Vuitton", price: 1150, source_link: "https://weidian.com/item.html?itemID=7566993900", category: "Bags" },
  { name: "Louis Vuitton Keepall Duffle Bag", brand: "Louis Vuitton", price: 950, source_link: "https://weidian.com/item.html?itemID=7566938710", category: "Bags" },
  { name: "Louis Vuitton Keepall Duffle Bag", brand: "Louis Vuitton", price: 629, source_link: "https://weidian.com/item.html?itemID=7566948530", category: "Bags" },
  { name: "Louis Vuitton Crossbody Bag", brand: "Louis Vuitton", price: 499, source_link: "https://weidian.com/item.html?itemID=7564997579", category: "Bags" },
  { name: "Louis Vuitton Sling Bag", brand: "Louis Vuitton", price: 669, source_link: "https://weidian.com/item.html?itemID=7566903510", category: "Bags" },
  { name: "Louis Vuitton Bum Bag", brand: "Louis Vuitton", price: 659, source_link: "https://weidian.com/item.html?itemID=7566913304", category: "Bags" },
  { name: "Louis Vuitton Tote Bag", brand: "Louis Vuitton", price: 850, source_link: "https://weidian.com/item.html?itemID=7566415174", category: "Bags" },
  { name: "Louis Vuitton Messenger Bag", brand: "Louis Vuitton", price: 880, source_link: "https://weidian.com/item.html?itemID=7564609861", category: "Bags" },
  { name: "Louis Vuitton Wallet", brand: "Louis Vuitton", price: 249, source_link: "https://weidian.com/item.html?itemID=7566480466", category: "Wallets" },
  { name: "Louis Vuitton Keepall Duffle Bag", brand: "Louis Vuitton", price: 699, source_link: "https://weidian.com/item.html?itemID=7566450830", category: "Bags" },
  { name: "Dior Wallet", brand: "Dior", price: 229, source_link: "https://weidian.com/item.html?itemID=7686747728", category: "Wallets" },
  { name: "Dior Wallet", brand: "Dior", price: 229, source_link: "https://weidian.com/item.html?itemID=7683720221", category: "Wallets" },
  { name: "Dior Wallet", brand: "Dior", price: 229, source_link: "https://weidian.com/item.html?itemID=7683718219", category: "Wallets" },
  { name: "Dior Wallet", brand: "Dior", price: 299, source_link: "https://weidian.com/item.html?itemID=7683669013", category: "Wallets" },
  { name: "Dior Card Holder", brand: "Dior", price: 199, source_link: "https://weidian.com/item.html?itemID=7686733816", category: "Wallets" },
  { name: "Louis Vuitton Wallet", brand: "Louis Vuitton", price: 229, source_link: "https://weidian.com/item.html?itemID=7526834437", category: "Wallets" },
  { name: "Louis Vuitton Wallet", brand: "Louis Vuitton", price: 269, source_link: "https://weidian.com/item.html?itemID=7526872685", category: "Wallets" },
  { name: "Louis Vuitton Wallet", brand: "Louis Vuitton", price: 259, source_link: "https://weidian.com/item.html?itemID=7528820540", category: "Wallets" },
  { name: "Louis Vuitton Wallet", brand: "Louis Vuitton", price: 259, source_link: "https://weidian.com/item.html?itemID=7526862603", category: "Wallets" },
  { name: "Dior Briefcase", brand: "Dior", price: 799, source_link: "https://weidian.com/item.html?itemID=7683838837", category: "Bags" },
  { name: "Dior Wallet", brand: "Dior", price: 229, source_link: "https://weidian.com/item.html?itemID=7686896374", category: "Wallets" },
  { name: "Dior Wallet", brand: "Dior", price: 199, source_link: "https://weidian.com/item.html?itemID=7683953769", category: "Wallets" },
  { name: "Dior Messenger Bag", brand: "Dior", price: 559, source_link: "https://weidian.com/item.html?itemID=7683922165", category: "Bags" },
  { name: "Dior Crossbody Bag", brand: "Dior", price: 499, source_link: "https://weidian.com/item.html?itemID=7687243482", category: "Bags" },
  { name: "Dior Crossbody Bag", brand: "Dior", price: 569, source_link: "https://weidian.com/item.html?itemID=7687257870", category: "Bags" },
  { name: "Dior Crossbody Bag", brand: "Dior", price: 469, source_link: "https://weidian.com/item.html?itemID=7684272067", category: "Bags" },
  { name: "Dior Crossbody Bag", brand: "Dior", price: 499, source_link: "https://weidian.com/item.html?itemID=7684261515", category: "Bags" },
  { name: "Dior Crossbody Bag", brand: "Dior", price: 399, source_link: "https://weidian.com/item.html?itemID=7687256134", category: "Bags" },
  { name: "Goyard Tote Bag", brand: "Goyard", price: 499, source_link: "https://weidian.com/item.html?itemID=7684265363", category: "Bags" },
  { name: "Louis Vuitton Keepall Duffle Bag", brand: "Louis Vuitton", price: 1150, source_link: "https://weidian.com/item.html?itemID=7432743324", category: "Bags" },
  { name: "Louis Vuitton Keepall Duffle Bag", brand: "Louis Vuitton", price: 1050, source_link: "https://weidian.com/item.html?itemID=7426341836", category: "Bags" },
  { name: "Dior Messenger Bag", brand: "Dior", price: 569, source_link: "https://weidian.com/item.html?itemID=7689057732", category: "Bags" },
  { name: "Dior Messenger Bag", brand: "Dior", price: 780, source_link: "https://weidian.com/item.html?itemID=7688992496", category: "Bags" },
  { name: "Dior Messenger Bag", brand: "Dior", price: 459, source_link: "https://weidian.com/item.html?itemID=7689057730", category: "Bags" },
  { name: "Dior Crossbody Bag", brand: "Dior", price: 479, source_link: "https://weidian.com/item.html?itemID=7686087609", category: "Bags" },
  { name: "Dior Backpack", brand: "Dior", price: 860, source_link: "https://weidian.com/item.html?itemID=7425242286", category: "Bags" },
  { name: "Dior Backpack", brand: "Dior", price: 869, source_link: "https://weidian.com/item.html?itemID=7686010495", category: "Bags" },
  { name: "Louis Vuitton Wallet", brand: "Louis Vuitton", price: 249, source_link: "https://weidian.com/item.html?itemID=7425212476", category: "Wallets" },
  { name: "Louis Vuitton Messenger Bag", brand: "Louis Vuitton", price: 700, source_link: "https://weidian.com/item.html?itemID=7423368183", category: "Bags" },
  { name: "Dior Bum Bag", brand: "Dior", price: 499, source_link: "https://weidian.com/item.html?itemID=7686343875", category: "Bags" },
  { name: "Dior Crossbody Bag", brand: "Dior", price: 499, source_link: "https://weidian.com/item.html?itemID=7686347797", category: "Bags" },
  { name: "Louis Vuitton Hobo Bag", brand: "Louis Vuitton", price: 650, source_link: "https://weidian.com/item.html?itemID=7393321074", category: "Bags" },
  { name: "Louis Vuitton Hobo Bag", brand: "Louis Vuitton", price: 760, source_link: "https://weidian.com/item.html?itemID=7393303404", category: "Bags" },
  { name: "Louis Vuitton Hobo Bag", brand: "Louis Vuitton", price: 960, source_link: "https://weidian.com/item.html?itemID=7393299596", category: "Bags" },
  { name: "Louis Vuitton Sling Bag", brand: "Louis Vuitton", price: 650, source_link: "https://weidian.com/item.html?itemID=7390995213", category: "Bags" },
  { name: "Louis Vuitton Wallet", brand: "Louis Vuitton", price: 199, source_link: "https://weidian.com/item.html?itemID=7383131650", category: "Wallets" },
  { name: "Louis Vuitton Wallet", brand: "Louis Vuitton", price: 329, source_link: "https://weidian.com/item.html?itemID=7383076430", category: "Wallets" },
  { name: "Louis Vuitton Tote Bag", brand: "Louis Vuitton", price: 750, source_link: "https://weidian.com/item.html?itemID=7383094022", category: "Bags" },
  { name: "Louis Vuitton Backpack", brand: "Louis Vuitton", price: 599, source_link: "https://weidian.com/item.html?itemID=7328671486", category: "Bags" },
  { name: "Louis Vuitton Backpack", brand: "Louis Vuitton", price: 850, source_link: "https://weidian.com/item.html?itemID=7327673319", category: "Bags" },
  { name: "Louis Vuitton Crossbody Bag", brand: "Louis Vuitton", price: 720, source_link: "https://weidian.com/item.html?itemID=7328665068", category: "Bags" },
  { name: "Louis Vuitton Keepall Duffle Bag", brand: "Louis Vuitton", price: 750, source_link: "https://weidian.com/item.html?itemID=7328713286", category: "Bags" },
  { name: "Louis Vuitton Sling Bag", brand: "Louis Vuitton", price: 580, source_link: "https://weidian.com/item.html?itemID=7328558494", category: "Bags" },
  { name: "Louis Vuitton Bum Bag", brand: "Louis Vuitton", price: 580, source_link: "https://weidian.com/item.html?itemID=7328770700", category: "Bags" },
  { name: "Louis Vuitton Keepall Duffle Bag", brand: "Louis Vuitton", price: 950, source_link: "https://weidian.com/item.html?itemID=7322168423", category: "Bags" },
  { name: "Louis Vuitton Wallet", brand: "Louis Vuitton", price: 199, source_link: "https://weidian.com/item.html?itemID=7319176646", category: "Wallets" },
  { name: "Louis Vuitton Crossbody Bag", brand: "Louis Vuitton", price: 299, source_link: "https://weidian.com/item.html?itemID=7319127934", category: "Bags" },
  { name: "Louis Vuitton Crossbody Bag", brand: "Louis Vuitton", price: 660, source_link: "https://weidian.com/item.html?itemID=7319214352", category: "Bags" },
  { name: "Louis Vuitton Wallet", brand: "Louis Vuitton", price: 259, source_link: "https://weidian.com/item.html?itemID=7318204851", category: "Wallets" },
  { name: "Louis Vuitton Backpack", brand: "Louis Vuitton", price: 750, source_link: "https://weidian.com/item.html?itemID=7318048991", category: "Bags" },
  { name: "Louis Vuitton Crossbody Bag", brand: "Louis Vuitton", price: 690, source_link: "https://weidian.com/item.html?itemID=7319092456", category: "Bags" },
  { name: "Louis Vuitton Crossbody Bag", brand: "Louis Vuitton", price: 750, source_link: "https://weidian.com/item.html?itemID=7318058973", category: "Bags" },
  { name: "Louis Vuitton Crossbody Bag", brand: "Louis Vuitton", price: 650, source_link: "https://weidian.com/item.html?itemID=7318060981", category: "Bags" },
  { name: "Louis Vuitton Trunk Bag", brand: "Louis Vuitton", price: 1150, source_link: "https://weidian.com/item.html?itemID=7318986322", category: "Bags" },
  { name: "Louis Vuitton Tote Bag", brand: "Louis Vuitton", price: 1150, source_link: "https://weidian.com/item.html?itemID=7317956393", category: "Bags" },
  { name: "Goyard Crossbody Bag", brand: "Goyard", price: 559, source_link: "https://weidian.com/item.html?itemID=7689326258", category: "Bags" },
  { name: "Goyard Card Holder", brand: "Goyard", price: 99, source_link: "https://weidian.com/item.html?itemID=7689285166", category: "Wallets" },
  { name: "Goyard Tote Bag", brand: "Goyard", price: 499, source_link: "https://weidian.com/item.html?itemID=7686348173", category: "Bags" },
  { name: "Goyard Card Holder", brand: "Goyard", price: 188, source_link: "https://weidian.com/item.html?itemID=7689304644", category: "Wallets" },
  { name: "Goyard Tote Bag", brand: "Goyard", price: 569, source_link: "https://weidian.com/item.html?itemID=7689320236", category: "Bags" },
  { name: "Goyard Tote Bag", brand: "Goyard", price: 479, source_link: "https://weidian.com/item.html?itemID=7686344263", category: "Bags" },
  { name: "Dior Tote Bag", brand: "Dior", price: 650, source_link: "https://weidian.com/item.html?itemID=7689689992", category: "Bags" },
  { name: "Dior Sling Bag", brand: "Dior", price: 699, source_link: "https://weidian.com/item.html?itemID=7689565146", category: "Bags" },
  { name: "Dior Clutch", brand: "Dior", price: 680, source_link: "https://weidian.com/item.html?itemID=7686694397", category: "Bags" },
  { name: "Dior Crossbody Bag", brand: "Dior", price: 369, source_link: "https://weidian.com/item.html?itemID=7689567174", category: "Bags" },
  { name: "Dior Backpack", brand: "Dior", price: 780, source_link: "https://weidian.com/item.html?itemID=7689689930", category: "Bags" },
  { name: "Dior Backpack", brand: "Dior", price: 539, source_link: "https://weidian.com/item.html?itemID=7686712083", category: "Bags" },
  { name: "Dior Messenger Bag", brand: "Dior", price: 539, source_link: "https://weidian.com/item.html?itemID=7689694066", category: "Bags" },
  { name: "Dior Book Tote", brand: "Dior", price: 399, source_link: "https://weidian.com/item.html?itemID=7689650446", category: "Bags" },
  { name: "Dior Clutch", brand: "Dior", price: 369, source_link: "https://weidian.com/item.html?itemID=7686711889", category: "Bags" },
  { name: "Dior Backpack", brand: "Dior", price: 899, source_link: "https://weidian.com/item.html?itemID=7686583183", category: "Bags" },
  { name: "Dior Backpack", brand: "Dior", price: 599, source_link: "https://weidian.com/item.html?itemID=7686606799", category: "Bags" },
  { name: "Dior Messenger Bag", brand: "Dior", price: 599, source_link: "https://weidian.com/item.html?itemID=7686603203", category: "Bags" },
  { name: "Dior Crossbody Bag", brand: "Dior", price: 459, source_link: "https://weidian.com/item.html?itemID=7689566952", category: "Bags" },
  { name: "Dior Briefcase", brand: "Dior", price: 820, source_link: "https://weidian.com/item.html?itemID=7689565208", category: "Bags" },
  { name: "Dior Clutch", brand: "Dior", price: 459, source_link: "https://weidian.com/item.html?itemID=7686706299", category: "Bags" },
  // #105 is a T-shirt in the bags list
  { name: "Louis Vuitton T-shirt", brand: "Louis Vuitton", price: 990, source_link: "https://weidian.com/item.html?itemID=7565020525", category: "Tops" },

  // ═══════════════════════════════════════
  // CAPS — default category: "Accessories"
  // ═══════════════════════════════════════
  { name: "Brunello Cucinelli Baseball Cap", brand: "Brunello Cucinelli", price: 99, source_link: "https://item.taobao.com/item.htm?ft=t&id=1025576078679", image_url: "https://photo.yupoo.com/tophotfashion/0a3b8c3e/medium.jpeg", category: "Accessories" },
  { name: "Louis Vuitton Baseball Cap", brand: "Louis Vuitton", price: 109, source_link: "https://item.taobao.com/item.htm?ft=t&id=1026484089675", image_url: "https://photo.yupoo.com/tophotfashion/56d7b2d7/medium.jpeg", category: "Accessories" },
  { name: "Loro Piana Baseball Cap", brand: "Loro Piana", price: 129, source_link: "https://item.taobao.com/item.htm?ft=t&id=1007990982334", image_url: "https://photo.yupoo.com/tophotfashion/f8dd3262/medium.jpeg", category: "Accessories" },
  { name: "Louis Vuitton Beanie", brand: "Louis Vuitton", price: 99, source_link: "https://item.taobao.com/item.htm?ft=t&id=1005527341395", image_url: "https://photo.yupoo.com/tophotfashion/03f144c5/medium.jpeg", category: "Accessories" },
  { name: "Balenciaga x GAP Baseball Cap", brand: "Balenciaga", price: 119, source_link: "https://item.taobao.com/item.htm?ft=t&id=1006270428832", image_url: "https://photo.yupoo.com/tophotfashion/d436a823/medium.jpeg", category: "Accessories" },
  { name: "Louis Vuitton Beanie", brand: "Louis Vuitton", price: 99, source_link: "https://item.taobao.com/item.htm?ft=t&id=1004714066146", image_url: "https://photo.yupoo.com/tophotfashion/5c0ee77e/medium.jpeg", category: "Accessories" },
  { name: "Miu Miu Baseball Cap", brand: "Miu Miu", price: 129, source_link: "https://weidian.com/item.html?itemID=7686158682", image_url: "https://photo.yupoo.com/tophotfashion/ab4922de/medium.jpeg", category: "Accessories" },
  { name: "Prada Baseball Cap", brand: "Prada", price: 129, source_link: "https://weidian.com/item.html?itemID=7682796949", image_url: "https://photo.yupoo.com/tophotfashion/615d955f/medium.jpeg", category: "Accessories" },
  { name: "Prada Baseball Cap", brand: "Prada", price: 129, source_link: "https://weidian.com/item.html?itemID=7683147305", image_url: "https://photo.yupoo.com/tophotfashion/d041c8cf/medium.jpeg", category: "Accessories" },
  { name: "Louis Vuitton Beanie", brand: "Louis Vuitton", price: 169, source_link: "https://item.taobao.com/item.htm?ft=t&id=1001126305239", image_url: "https://photo.yupoo.com/tophotfashion/41399b45/medium.jpeg", category: "Accessories" },
  { name: "Louis Vuitton Beanie", brand: "Louis Vuitton", price: 119, source_link: "https://item.taobao.com/item.htm?ft=t&id=999232423708", image_url: "https://photo.yupoo.com/tophotfashion/17404e12/medium.jpeg", category: "Accessories" },
  { name: "Chanel Beanie", brand: "Chanel", price: 119, source_link: "https://item.taobao.com/item.htm?ft=t&id=1001358868533", image_url: "https://photo.yupoo.com/tophotfashion/0c4803ea/medium.jpeg", category: "Accessories" },
  { name: "Louis Vuitton Beanie", brand: "Louis Vuitton", price: 119, source_link: "https://item.taobao.com/item.htm?ft=t&id=1000630113089", image_url: "https://photo.yupoo.com/tophotfashion/1ca6ec0d/medium.jpeg", category: "Accessories" },
  { name: "Louis Vuitton Beanie", brand: "Louis Vuitton", price: 119, source_link: "https://item.taobao.com/item.htm?ft=t&id=1000629617090", image_url: "https://photo.yupoo.com/tophotfashion/2cb1dd1f/medium.jpeg", category: "Accessories" },
  { name: "Balenciaga Beanie", brand: "Balenciaga", price: 149, source_link: "https://weidian.com/item.html?itemID=7597861657", image_url: "https://photo.yupoo.com/tophotfashion/1714f617/medium.jpeg", category: "Accessories" },
  { name: "Chanel Beanie Scarf Set", brand: "Chanel", price: 189, source_link: "https://item.taobao.com/item.htm?ft=t&id=979437298681", image_url: "https://photo.yupoo.com/tophotfashion/77aed174/medium.jpeg", category: "Accessories" },
  { name: "Loro Piana Baseball Cap", brand: "Loro Piana", price: 139, source_link: "https://weidian.com/item.html?itemID=7686182364", image_url: "https://photo.yupoo.com/tophotfashion/aec3bad6/medium.jpeg", category: "Accessories" },
  { name: "Celine Baseball Cap", brand: "Celine", price: 129, source_link: "https://weidian.com/item.html?itemID=7686139324", image_url: "https://photo.yupoo.com/tophotfashion/723295c8/medium.jpeg", category: "Accessories" },
  { name: "Loro Piana Beanie", brand: "Loro Piana", price: 99, source_link: "https://item.taobao.com/item.htm?ft=t&id=975858874032", image_url: "https://photo.yupoo.com/tophotfashion/43f78e48/medium.jpeg", category: "Accessories" },
  { name: "Loewe Beanie", brand: "Loewe", price: 99, source_link: "https://item.taobao.com/item.htm?ft=t&id=977214460910", image_url: "https://photo.yupoo.com/tophotfashion/eb3c1e34/medium.jpeg", category: "Accessories" },
  { name: "Louis Vuitton Beanie", brand: "Louis Vuitton", price: 119, source_link: "https://item.taobao.com/item.htm?ft=t&id=972583672882", image_url: "https://photo.yupoo.com/tophotfashion/4e6d0490/medium.jpeg", category: "Accessories" },
  { name: "Louis Vuitton Beanie", brand: "Louis Vuitton", price: 119, source_link: "https://item.taobao.com/item.htm?ft=t&id=972583940177", image_url: "https://photo.yupoo.com/tophotfashion/b1928735/medium.jpeg", category: "Accessories" },
  { name: "Louis Vuitton Beanie", brand: "Louis Vuitton", price: 119, source_link: "https://item.taobao.com/item.htm?ft=t&id=971247718173", image_url: "https://photo.yupoo.com/tophotfashion/3cdcbf20/medium.jpeg", category: "Accessories" },
  { name: "Hermes Baseball Cap", brand: "Hermes", price: 129, source_link: "https://item.taobao.com/item.htm?ft=t&id=971247306105", image_url: "https://photo.yupoo.com/tophotfashion/22d58d10/medium.jpeg", category: "Accessories" },
  { name: "Louis Vuitton Beanie Scarf", brand: "Louis Vuitton", price: 119, source_link: "https://item.taobao.com/item.htm?ft=t&id=971247530268", image_url: "https://photo.yupoo.com/tophotfashion/e58b3e81/medium.jpeg", category: "Accessories" },
  { name: "Balenciaga Baseball Cap", brand: "Balenciaga", price: 139, source_link: "https://weidian.com/item.html?itemID=7683676989", image_url: "https://photo.yupoo.com/tophotfashion/6123b3cd/medium.jpeg", category: "Accessories" },
  { name: "Chrome Hearts Beanie", brand: "Chrome Hearts", price: 119, source_link: "https://weidian.com/item.html?itemID=7390002365", image_url: "https://photo.yupoo.com/tophotfashion/718d1f7c/medium.jpeg", category: "Accessories" },
  { name: "New Era Snapback", brand: "New Era", price: 159, source_link: "https://weidian.com/item.html?itemID=7499772909", image_url: "https://photo.yupoo.com/tophotfashion/85905c5f/medium.jpeg", category: "Accessories" },
  { name: "New Era Snapback", brand: "New Era", price: 159, source_link: "https://weidian.com/item.html?itemID=7501759788", image_url: "https://photo.yupoo.com/tophotfashion/588e6789/medium.jpeg", category: "Accessories" },
  { name: "BAPE Beanie", brand: "BAPE", price: 99, source_link: "https://weidian.com/item.html?itemID=7500280124", image_url: "https://photo.yupoo.com/tophotfashion/d33c024e/medium.jpeg", category: "Accessories" },
  { name: "New Era Fitted Cap", brand: "New Era", price: 149, source_link: "https://weidian.com/item.html?itemID=7498408019", image_url: "https://photo.yupoo.com/tophotfashion/dcdc6e22/medium.jpeg", category: "Accessories" },
  { name: "Chrome Hearts Beanie", brand: "Chrome Hearts", price: 119, source_link: "https://weidian.com/item.html?itemID=7317516701", image_url: "https://photo.yupoo.com/tophotfashion/40ed6912/medium.jpeg", category: "Accessories" },
  { name: "Hellstar Beanie", brand: "Hellstar", price: 115, source_link: "https://weidian.com/item.html?itemID=7318568002", image_url: "https://photo.yupoo.com/tophotfashion/0da10b07/medium.jpeg", category: "Accessories" },
  { name: "Hellstar Snapback", brand: "Hellstar", price: 159, source_link: "https://weidian.com/item.html?itemID=7318617598", image_url: "https://photo.yupoo.com/tophotfashion/87cd11fc/medium.jpeg", category: "Accessories" },
  { name: "Gucci Baseball Cap", brand: "Gucci", price: 129, source_link: "https://weidian.com/item.html?itemID=7686858424", image_url: "https://photo.yupoo.com/tophotfashion/75afaf85/medium.jpeg", category: "Accessories" },
  { name: "Loewe Baseball Cap", brand: "Loewe", price: 129, source_link: "https://weidian.com/item.html?itemID=7686868394", image_url: "https://photo.yupoo.com/tophotfashion/3f37bd7b/medium.jpeg", category: "Accessories" },
  { name: "Loro Piana Baseball Cap", brand: "Loro Piana", price: 129, source_link: "https://weidian.com/item.html?itemID=7683876493", image_url: "https://photo.yupoo.com/tophotfashion/14dc7bbd/medium.jpeg", category: "Accessories" },
  { name: "Brunello Cucinelli Baseball Cap", brand: "Brunello Cucinelli", price: 139, source_link: "https://weidian.com/item.html?itemID=7683912097", image_url: "https://photo.yupoo.com/tophotfashion/7b99ee0b/medium.jpeg", category: "Accessories" },
  { name: "Brunello Cucinelli Baseball Cap", brand: "Brunello Cucinelli", price: 139, source_link: "https://weidian.com/item.html?itemID=7686903838", image_url: "https://photo.yupoo.com/tophotfashion/bff65f3f/medium.jpeg", category: "Accessories" },
  { name: "Loewe Baseball Cap", brand: "Loewe", price: 139, source_link: "https://weidian.com/item.html?itemID=7687238305", image_url: "https://photo.yupoo.com/tophotfashion/43f8b01d/medium.jpeg", category: "Accessories" },
  { name: "Gucci Baseball Cap", brand: "Gucci", price: 119, source_link: "https://weidian.com/item.html?itemID=7687252011", image_url: "https://photo.yupoo.com/tophotfashion/3e2b5c9c/medium.jpeg", category: "Accessories" },
  { name: "Louis Vuitton Beanie", brand: "Louis Vuitton", price: 129, source_link: "https://weidian.com/item.html?itemID=7490842745", image_url: "https://photo.yupoo.com/tophotfashion/c33c070f/medium.jpeg", category: "Accessories" },
  { name: "Loro Piana Baseball Cap", brand: "Loro Piana", price: 139, source_link: "https://weidian.com/item.html?itemID=7683785589", image_url: "https://photo.yupoo.com/tophotfashion/1cee39b9/medium.jpeg", category: "Accessories" },
  { name: "Prada Baseball Cap", brand: "Prada", price: 159, source_link: "https://weidian.com/item.html?itemID=7683862763", image_url: "https://photo.yupoo.com/tophotfashion/e3c6045f/medium.jpeg", category: "Accessories" },
  { name: "Miu Miu Bucket Hat", brand: "Miu Miu", price: 119, source_link: "https://weidian.com/item.html?itemID=7683902497", image_url: "https://photo.yupoo.com/tophotfashion/5cbf4df6/medium.jpeg", category: "Accessories" },
  { name: "Miu Miu Baseball Cap", brand: "Miu Miu", price: 119, source_link: "https://weidian.com/item.html?itemID=7489681199", image_url: "https://photo.yupoo.com/tophotfashion/de344cc9/medium.jpeg", category: "Accessories" },
  { name: "Gucci Baseball Cap", brand: "Gucci", price: 135, source_link: "https://weidian.com/item.html?itemID=7683862767", image_url: "https://photo.yupoo.com/tophotfashion/39dab218/medium.jpeg", category: "Accessories" },
  { name: "Burberry Baseball Cap", brand: "Burberry", price: 149, source_link: "https://weidian.com/item.html?itemID=7686904166", image_url: "https://photo.yupoo.com/tophotfashion/6f83fb66/medium.jpeg", category: "Accessories" },
  { name: "Various Baseball Cap", brand: "Various", price: 99, source_link: "https://weidian.com/item.html?itemID=7483170802", image_url: "https://photo.yupoo.com/tophotfashion/5ff4bbcf/medium.jpeg", category: "Accessories" },
  { name: "Loro Piana Baseball Cap", brand: "Loro Piana", price: 129, source_link: "https://weidian.com/item.html?itemID=7686877538", image_url: "https://photo.yupoo.com/tophotfashion/d1b3f07e/medium.jpeg", category: "Accessories" },
  { name: "Prada Baseball Cap", brand: "Prada", price: 139, source_link: "https://weidian.com/item.html?itemID=7686858432", image_url: "https://photo.yupoo.com/tophotfashion/e8b2b01b/medium.jpeg", category: "Accessories" },
  { name: "Louis Vuitton Baseball Cap", brand: "Louis Vuitton", price: 149, source_link: "https://weidian.com/item.html?itemID=7687218727", image_url: "https://photo.yupoo.com/tophotfashion/a7f2fe98/medium.jpeg", category: "Accessories" },
  { name: "Louis Vuitton Baseball Cap", brand: "Louis Vuitton", price: 139, source_link: "https://weidian.com/item.html?itemID=7686877534", image_url: "https://photo.yupoo.com/tophotfashion/2b4c52e8/medium.jpeg", category: "Accessories" },
  { name: "Loro Piana Baseball Cap", brand: "Loro Piana", price: 139, source_link: "https://weidian.com/item.html?itemID=7684464793", image_url: "https://photo.yupoo.com/tophotfashion/20fa2b4b/medium.jpeg", category: "Accessories" },
  { name: "Louis Vuitton Baseball Cap", brand: "Louis Vuitton", price: 139, source_link: "https://weidian.com/item.html?itemID=7684464789", image_url: "https://photo.yupoo.com/tophotfashion/f3c6aa36/medium.jpeg", category: "Accessories" },
  { name: "Gucci Baseball Cap", brand: "Gucci", price: 159, source_link: "https://weidian.com/item.html?itemID=7684469427", image_url: "https://photo.yupoo.com/tophotfashion/e9af7ea4/medium.jpeg", category: "Accessories" },
  { name: "Balenciaga Baseball Cap", brand: "Balenciaga", price: 129, source_link: "https://weidian.com/item.html?itemID=7685975295", image_url: "https://photo.yupoo.com/tophotfashion/22336d05/medium.jpeg", category: "Accessories" },
  { name: "Louis Vuitton Beanie", brand: "Louis Vuitton", price: 55, source_link: "https://weidian.com/item.html?itemID=7688967558", image_url: "https://photo.yupoo.com/tophotfashion/e4531da1/medium.jpeg", category: "Accessories" },
  { name: "Gucci Beanie", brand: "Gucci", price: 55, source_link: "https://weidian.com/item.html?itemID=7686075745", image_url: "https://photo.yupoo.com/tophotfashion/ef422ee4/medium.jpeg", category: "Accessories" },
  { name: "Dior Beanie", brand: "Dior", price: 55, source_link: "https://weidian.com/item.html?itemID=7686071759", image_url: "https://photo.yupoo.com/tophotfashion/b3496a04/medium.jpeg", category: "Accessories" },
  { name: "Celine Baseball Cap", brand: "Celine", price: 129, source_link: "https://weidian.com/item.html?itemID=7686347849", image_url: "https://photo.yupoo.com/tophotfashion/5dc3102f/medium.jpeg", category: "Accessories" },
  { name: "Celine Baseball Cap", brand: "Celine", price: 129, source_link: "https://weidian.com/item.html?itemID=7686347851", image_url: "https://photo.yupoo.com/tophotfashion/6a8c479d/medium.jpeg", category: "Accessories" },
  { name: "Ami Baseball Cap", brand: "Ami", price: 139, source_link: "https://weidian.com/item.html?itemID=7689290638", image_url: "https://photo.yupoo.com/tophotfashion/be5a6ce4/medium.jpeg", category: "Accessories" },
  { name: "Dior Baseball Cap", brand: "Dior", price: 119, source_link: "https://weidian.com/item.html?itemID=7686308637", image_url: "https://photo.yupoo.com/tophotfashion/032ceb1b/medium.jpeg", category: "Accessories" },
  { name: "Dior Baseball Cap", brand: "Dior", price: 139, source_link: "https://weidian.com/item.html?itemID=7689330094", image_url: "https://photo.yupoo.com/tophotfashion/77821590/medium.jpeg", category: "Accessories" },
  { name: "Fendi Baseball Cap", brand: "Fendi", price: 139, source_link: "https://weidian.com/item.html?itemID=7686338189", image_url: "https://photo.yupoo.com/tophotfashion/cfae03b4/medium.jpeg", category: "Accessories" },
  { name: "Celine Baseball Cap", brand: "Celine", price: 139, source_link: "https://weidian.com/item.html?itemID=7689326268", image_url: "https://photo.yupoo.com/tophotfashion/0327c9d2/medium.jpeg", category: "Accessories" },
  { name: "Miu Miu Baseball Cap", brand: "Miu Miu", price: 129, source_link: "https://weidian.com/item.html?itemID=7686705931", image_url: "https://photo.yupoo.com/tophotfashion/900bdbc7/medium.jpeg", category: "Accessories" },
  { name: "Celine Corduroy Baseball Cap", brand: "Celine", price: 129, source_link: "https://weidian.com/item.html?itemID=7686668379", image_url: "https://photo.yupoo.com/tophotfashion/cbf9614e/medium.jpeg", category: "Accessories" },
  { name: "Celine Corduroy Baseball Cap", brand: "Celine", price: 129, source_link: "https://weidian.com/item.html?itemID=7689596950", image_url: "https://photo.yupoo.com/tophotfashion/16d58ae5/medium.jpeg", category: "Accessories" },
  { name: "Chrome Hearts Baseball Cap", brand: "Chrome Hearts", price: 179, source_link: "https://weidian.com/item.html?itemID=7689778040", image_url: "https://photo.yupoo.com/tophotfashion/1bb9bfb9/medium.jpeg", category: "Accessories" },
  { name: "Celine Baseball Cap", brand: "Celine", price: 129, source_link: "https://weidian.com/item.html?itemID=7686765413", image_url: "https://photo.yupoo.com/tophotfashion/208abaf5/medium.jpeg", category: "Accessories" },
  { name: "Gucci Baseball Cap", brand: "Gucci", price: 129, source_link: "https://weidian.com/item.html?itemID=7686765401", image_url: "https://photo.yupoo.com/tophotfashion/92c72de1/medium.jpeg", category: "Accessories" },
  { name: "Celine Baseball Cap", brand: "Celine", price: 119, source_link: "https://weidian.com/item.html?itemID=7690200680", image_url: "https://photo.yupoo.com/tophotfashion/ff876b63/medium.jpeg", category: "Accessories" },
  { name: "Loewe Baseball Cap", brand: "Loewe", price: 135, source_link: "https://weidian.com/item.html?itemID=7687199189", image_url: "https://photo.yupoo.com/tophotfashion/a717b9ba/medium.jpeg", category: "Accessories" },
  { name: "Gucci Baseball Cap", brand: "Gucci", price: 135, source_link: "https://weidian.com/item.html?itemID=7687204873", image_url: "https://photo.yupoo.com/tophotfashion/4f2aec7c/medium.jpeg", category: "Accessories" },
  { name: "Celine Baseball Cap", brand: "Celine", price: 135, source_link: "https://weidian.com/item.html?itemID=7690188874", image_url: "https://photo.yupoo.com/tophotfashion/bb1b7c61/medium.jpeg", category: "Accessories" },
  { name: "Celine Baseball Cap", brand: "Celine", price: 129, source_link: "https://weidian.com/item.html?itemID=7690223844", image_url: "https://photo.yupoo.com/tophotfashion/48f9701b/medium.jpeg", category: "Accessories" },
  { name: "Balenciaga Baseball Cap", brand: "Balenciaga", price: 129, source_link: "https://weidian.com/item.html?itemID=7690200732", image_url: "https://photo.yupoo.com/tophotfashion/43d4f8af/medium.jpeg", category: "Accessories" },
  { name: "Loewe Baseball Cap", brand: "Loewe", price: 139, source_link: "https://weidian.com/item.html?itemID=7690216008", image_url: "https://photo.yupoo.com/tophotfashion/a2427ec5/medium.jpeg", category: "Accessories" },
  { name: "Gucci Trucker Cap", brand: "Gucci", price: 135, source_link: "https://weidian.com/item.html?itemID=7687218727", image_url: "https://photo.yupoo.com/tophotfashion/abc3fb11/medium.jpeg", category: "Accessories" },
  { name: "Celine Baseball Cap", brand: "Celine", price: 129, source_link: "https://weidian.com/item.html?itemID=7690233668", image_url: "https://photo.yupoo.com/tophotfashion/132d548e/medium.jpeg", category: "Accessories" },
  { name: "Celine Baseball Cap", brand: "Celine", price: 129, source_link: "https://weidian.com/item.html?itemID=7690223836", image_url: "https://photo.yupoo.com/tophotfashion/a10d947b/medium.jpeg", category: "Accessories" },
  { name: "Louis Vuitton Baseball Cap", brand: "Louis Vuitton", price: 149, source_link: "https://weidian.com/item.html?itemID=7687218719", image_url: "https://photo.yupoo.com/tophotfashion/a7f2fe98/medium.jpeg", category: "Accessories" },
  { name: "Amiri Baseball Cap", brand: "Amiri", price: 99, source_link: "https://weidian.com/item.html?itemID=7269195615", image_url: "https://photo.yupoo.com/tophotfashion/5b9f4cf0/medium.jpeg", category: "Accessories" },
  { name: "Amiri Baseball Cap", brand: "Amiri", price: 99, source_link: "https://weidian.com/item.html?itemID=7269110873", image_url: "https://photo.yupoo.com/tophotfashion/20604302/medium.jpeg", category: "Accessories" },
  { name: "Amiri Baseball Cap", brand: "Amiri", price: 119, source_link: "https://weidian.com/item.html?itemID=7269043427", image_url: "https://photo.yupoo.com/tophotfashion/ffc1d91e/medium.jpeg", category: "Accessories" },
  { name: "Prada Baseball Cap", brand: "Prada", price: 119, source_link: "https://weidian.com/item.html?itemID=7690188916", image_url: "https://photo.yupoo.com/tophotfashion/a9ff678e/medium.jpeg", category: "Accessories" },
  { name: "Dior Baseball Cap", brand: "Dior", price: 139, source_link: "https://weidian.com/item.html?itemID=7687237967", image_url: "https://photo.yupoo.com/tophotfashion/e8f8a812/medium.jpeg", category: "Accessories" },
  { name: "Miu Miu Baseball Cap", brand: "Miu Miu", price: 139, source_link: "https://weidian.com/item.html?itemID=7690219968", image_url: "https://photo.yupoo.com/tophotfashion/2316b59f/medium.jpeg", category: "Accessories" },
  { name: "Burberry Baseball Cap", brand: "Burberry", price: 149, source_link: "https://weidian.com/item.html?itemID=7687289727", image_url: "https://photo.yupoo.com/tophotfashion/68883ab9/medium.jpeg", category: "Accessories" },
  { name: "Miu Miu Bucket Hat", brand: "Miu Miu", price: 115, source_link: "https://weidian.com/item.html?itemID=7690234022", image_url: "https://photo.yupoo.com/tophotfashion/b6b85889/medium.jpeg", category: "Accessories" },
  { name: "Miu Miu Baseball Cap", brand: "Miu Miu", price: 129, source_link: "https://weidian.com/item.html?itemID=7687238317", image_url: "https://photo.yupoo.com/tophotfashion/1d2cbae7/medium.jpeg", category: "Accessories" },
  { name: "Prada Baseball Cap", brand: "Prada", price: 129, source_link: "https://weidian.com/item.html?itemID=7690224160", image_url: "https://photo.yupoo.com/tophotfashion/de574057/medium.jpeg", category: "Accessories" },
  { name: "Prada Baseball Cap", brand: "Prada", price: 139, source_link: "https://weidian.com/item.html?itemID=7690191184", image_url: "https://photo.yupoo.com/tophotfashion/977a2d97/medium.jpeg", category: "Accessories" },
  { name: "Burberry Baseball Cap", brand: "Burberry", price: 149, source_link: "https://weidian.com/item.html?itemID=7690234016", image_url: "https://photo.yupoo.com/tophotfashion/8f6ce861/medium.jpeg", category: "Accessories" },
  { name: "Burberry Baseball Cap", brand: "Burberry", price: 149, source_link: "https://weidian.com/item.html?itemID=7690220310", image_url: "https://photo.yupoo.com/tophotfashion/97672e2d/medium.jpeg", category: "Accessories" },
  { name: "Burberry Baseball Cap", brand: "Burberry", price: 129, source_link: "https://weidian.com/item.html?itemID=7690197126", image_url: "https://photo.yupoo.com/tophotfashion/b7ba4039/medium.jpeg", category: "Accessories" },
  { name: "Burberry Baseball Cap", brand: "Burberry", price: 149, source_link: "https://weidian.com/item.html?itemID=7690179398", image_url: "https://photo.yupoo.com/tophotfashion/0d2f12da/medium.jpeg", category: "Accessories" },
  { name: "Gucci Baseball Cap", brand: "Gucci", price: 169, source_link: "https://weidian.com/item.html?itemID=7687199221", image_url: "https://photo.yupoo.com/tophotfashion/871e5c9d/medium.jpeg", category: "Accessories" },
  { name: "Gallery Dept Trucker Cap", brand: "Gallery Dept", price: 159, source_link: "https://weidian.com/item.html?itemID=7687218715", image_url: "https://photo.yupoo.com/tophotfashion/94112429/medium.jpeg", category: "Accessories" },
  { name: "Chrome Hearts Snapback", brand: "Chrome Hearts", price: 119, source_link: "https://weidian.com/item.html?itemID=7270110880", image_url: "https://photo.yupoo.com/tophotfashion/9cd32043/medium.jpeg", category: "Accessories" },
  { name: "Chrome Hearts Trucker Cap", brand: "Chrome Hearts", price: 149, source_link: "https://weidian.com/item.html?itemID=7254330489", image_url: "https://photo.yupoo.com/tophotfashion/3bdb5599/medium.jpeg", category: "Accessories" },

  // ═══════════════════════════════════════
  // SCARVES / BELTS — category: "Accessories"
  // ═══════════════════════════════════════
  { name: "Gucci Belt", brand: "Gucci", price: 219, source_link: "https://item.taobao.com/item.htm?ft=t&id=1024456718841", image_url: "https://photo.yupoo.com/tophotfashion/2a293c31/medium.jpeg", category: "Accessories" },
  { name: "Balenciaga Scarf", brand: "Balenciaga", price: 269, source_link: "https://item.taobao.com/item.htm?ft=t&id=1013725162199", image_url: "https://photo.yupoo.com/tophotfashion/89b47f65/medium.jpeg", category: "Accessories" },
  { name: "Chanel Scarf Cap Glove Set", brand: "Chanel", price: 459, source_link: "https://item.taobao.com/item.htm?ft=t&id=1011383919528", category: "Accessories" },
  { name: "Fendi Scarf", brand: "Fendi", price: 379, source_link: "https://item.taobao.com/item.htm?ft=t&id=1011384899683", category: "Accessories" },
  { name: "Hermes Scarf", brand: "Hermes", price: 329, source_link: "https://item.taobao.com/item.htm?ft=t&id=1013634552857", category: "Accessories" },
  { name: "Hermes Scarf", brand: "Hermes", price: 329, source_link: "https://item.taobao.com/item.htm?ft=t&id=1012877301319", category: "Accessories" },
  { name: "Gucci Scarf", brand: "Gucci", price: 299, source_link: "https://item.taobao.com/item.htm?ft=t&id=1013635408436", category: "Accessories" },
  { name: "Louis Vuitton Scarf", brand: "Louis Vuitton", price: 339, source_link: "https://item.taobao.com/item.htm?ft=t&id=1012877561224", category: "Accessories" },
  { name: "Loro Piana Scarf", brand: "Loro Piana", price: 429, source_link: "https://item.taobao.com/item.htm?ft=t&id=1005058992544", category: "Accessories" },
  { name: "Loro Piana Scarf", brand: "Loro Piana", price: 499, source_link: "https://item.taobao.com/item.htm?ft=t&id=1005056200192", category: "Accessories" },
  { name: "Loewe Scarf", brand: "Loewe", price: 319, source_link: "https://item.taobao.com/item.htm?ft=t&id=1005055892054", category: "Accessories" },
  { name: "Fendi Scarf", brand: "Fendi", price: 299, source_link: "https://item.taobao.com/item.htm?ft=t&id=1004309253132", category: "Accessories" },
  { name: "Louis Vuitton Scarf", brand: "Louis Vuitton", price: 299, source_link: "https://item.taobao.com/item.htm?ft=t&id=1005049064299", category: "Accessories" },
  { name: "Burberry Scarf", brand: "Burberry", price: 299, source_link: "https://item.taobao.com/item.htm?ft=t&id=1002882419640", category: "Accessories" },
  { name: "Louis Vuitton Shawl", brand: "Louis Vuitton", price: 319, source_link: "https://item.taobao.com/item.htm?ft=t&id=1005048084023", category: "Accessories" },
  { name: "Fendi Scarf", brand: "Fendi", price: 299, source_link: "https://item.taobao.com/item.htm?ft=t&id=1005048196247", category: "Accessories" },
  { name: "Burberry Scarf", brand: "Burberry", price: 239, source_link: "https://weidian.com/item.html?itemID=7647624781", image_url: "https://photo.yupoo.com/tophotfashion/medium.jpeg", category: "Accessories" },
  { name: "Burberry Scarf", brand: "Burberry", price: 299, source_link: "https://weidian.com/item.html?itemID=7647770207", category: "Accessories" },
  { name: "Burberry Scarf", brand: "Burberry", price: 299, source_link: "https://weidian.com/item.html?itemID=7647720797", category: "Accessories" },
  { name: "Burberry Scarf", brand: "Burberry", price: 339, source_link: "https://weidian.com/item.html?itemID=7647746715", category: "Accessories" },
  { name: "Hermes Belt", brand: "Hermes", price: 329, source_link: "https://weidian.com/item.html?itemID=7528795546", category: "Accessories" },

  // ═══════════════════════════════════════
  // JEWELRY — category: "Jewelry"
  // ═══════════════════════════════════════
  { name: "Louis Vuitton Necklace", brand: "Louis Vuitton", price: 169, source_link: "https://weidian.com/item.html?itemID=7694629040", image_url: "https://photo.yupoo.com/tophotfashion/d04dba16/medium.jpeg", category: "Jewelry" },
  { name: "Louis Vuitton Necklace", brand: "Louis Vuitton", price: 199, source_link: "https://weidian.com/item.html?itemID=7691824049", image_url: "https://photo.yupoo.com/tophotfashion/2ebdcf09/medium.jpeg", category: "Jewelry" },
  { name: "Louis Vuitton Necklace", brand: "Louis Vuitton", price: 199, source_link: "https://weidian.com/item.html?itemID=7694681068", image_url: "https://photo.yupoo.com/tophotfashion/f6b5cc43/medium.jpeg", category: "Jewelry" },
  { name: "Louis Vuitton Necklace", brand: "Louis Vuitton", price: 199, source_link: "https://weidian.com/item.html?itemID=7691085141", image_url: "https://photo.yupoo.com/tophotfashion/1d6cd03e/medium.jpeg", category: "Jewelry" },
  { name: "Louis Vuitton Bracelet", brand: "Louis Vuitton", price: 179, source_link: "https://weidian.com/item.html?itemID=7686147154", category: "Jewelry" },
  { name: "Louis Vuitton Bracelet", brand: "Louis Vuitton", price: 179, source_link: "https://weidian.com/item.html?itemID=7683252049", category: "Jewelry" },
  { name: "Louis Vuitton Bracelet", brand: "Louis Vuitton", price: 179, source_link: "https://weidian.com/item.html?itemID=7686717964", category: "Jewelry" },
  { name: "Louis Vuitton Necklace", brand: "Louis Vuitton", price: 179, source_link: "https://weidian.com/item.html?itemID=7686759652", category: "Jewelry" },
  { name: "Louis Vuitton Necklace", brand: "Louis Vuitton", price: 169, source_link: "https://weidian.com/item.html?itemID=7683704525", category: "Jewelry" },
  { name: "Louis Vuitton Necklace", brand: "Louis Vuitton", price: 169, source_link: "https://weidian.com/item.html?itemID=7684117569", category: "Jewelry" },

  // LV Accessories (non-jewelry)
  { name: "Louis Vuitton Accessory", brand: "Louis Vuitton", price: 279, source_link: "https://weidian.com/item.html?itemID=7683238183", category: "Accessories" },
  { name: "Louis Vuitton Accessory", brand: "Louis Vuitton", price: 229, source_link: "https://weidian.com/item.html?itemID=7683222319", category: "Accessories" },
  { name: "Louis Vuitton Accessory", brand: "Louis Vuitton", price: 249, source_link: "https://weidian.com/item.html?itemID=7686166782", category: "Accessories" },
];

// ── Build insert rows ──
function buildRow(p) {
  return {
    name: p.name,
    brand: p.brand,
    category: p.category,
    price_cny: p.price,
    tier: getTier(p.price),
    quality: null,
    source_link: p.source_link,
    image: p.image_url || "",
    images: [],
    variants: [],
    qc_photos: [],
    verified: false,
    views: 0,
    likes: 0,
    dislikes: 0,
    collection: "girls",
  };
}

// ── Main ──
async function main() {
  console.log("═══════════════════════════════════════════════");
  console.log("  MurmReps Girls Collection — Bulk Import");
  console.log("═══════════════════════════════════════════════\n");

  // Get existing source_links to avoid duplicates
  console.log("Fetching existing products to check for duplicates...");
  const { data: existing, error: fetchErr } = await supabase
    .from("products")
    .select("source_link")
    .eq("collection", "girls");

  if (fetchErr) {
    console.error("Error fetching existing products:", fetchErr.message);
    process.exit(1);
  }

  const existingLinks = new Set((existing || []).map((p) => p.source_link));
  console.log(`Found ${existingLinks.size} existing girls products\n`);

  // Filter out duplicates
  const newProducts = RAW_PRODUCTS.filter((p) => !existingLinks.has(p.source_link));
  const duplicateCount = RAW_PRODUCTS.length - newProducts.length;

  console.log(`Total products in script: ${RAW_PRODUCTS.length}`);
  console.log(`Duplicates (skipped):     ${duplicateCount}`);
  console.log(`New products to insert:   ${newProducts.length}\n`);

  if (newProducts.length === 0) {
    console.log("Nothing to insert — all products already exist.");
    await logTotalCount();
    return;
  }

  // Build rows
  const rows = newProducts.map(buildRow);

  // Insert in batches of 50
  const BATCH_SIZE = 50;
  let totalInserted = 0;
  let totalErrors = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(rows.length / BATCH_SIZE);

    process.stdout.write(`Batch ${batchNum}/${totalBatches} (${batch.length} products)... `);

    const { data, error } = await supabase
      .from("products")
      .insert(batch)
      .select("id");

    if (error) {
      console.log(`ERROR: ${error.message}`);
      totalErrors += batch.length;
    } else {
      console.log(`OK — inserted ${data.length} rows`);
      totalInserted += data.length;
    }
  }

  // Summary
  console.log("\n═══════════════════════════════════════════════");
  console.log("  Import Summary");
  console.log("═══════════════════════════════════════════════");
  console.log(`  Total in script:   ${RAW_PRODUCTS.length}`);
  console.log(`  Duplicates:        ${duplicateCount}`);
  console.log(`  Inserted:          ${totalInserted}`);
  console.log(`  Errors:            ${totalErrors}`);
  console.log("═══════════════════════════════════════════════\n");

  await logTotalCount();
}

async function logTotalCount() {
  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.log("Could not fetch total count:", error.message);
  } else {
    console.log(`Total products in database: ${count}`);
  }

  // Also count girls collection
  const { count: girlsCount, error: girlsErr } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("collection", "girls");

  if (!girlsErr) {
    console.log(`Total girls collection:    ${girlsCount}`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
