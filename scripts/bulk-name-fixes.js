const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const env = {};
for (const line of envContent.split("\n")) {
  const idx = line.indexOf("=");
  if (idx > 0) env[line.substring(0, idx).trim()] = line.substring(idx + 1).trim();
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const BRAND_PATTERNS = [
  "Chrome Hearts", "Louis Vuitton", "Maison Margiela", "Vivienne Westwood",
  "Rick Owens", "Ralph Lauren", "Off-White", "Acne Studios", "The North Face",
  "Calvin Klein", "Stone Island", "Fear of God", "Gallery Dept",
  "Nike", "Adidas", "Gucci", "Prada", "Dior", "Chanel", "Balenciaga",
  "Supreme", "Stussy", "Burberry", "Moncler", "Hermes", "Jordan",
  "New Balance", "Bape", "ASICS", "Carhartt", "Corteiz", "Essentials",
  "Hellstar", "Amiri", "Vetements", "Undercover", "Raf Simons",
];

const BRAND_MAP = {
  NK: "Nike", LV: "Louis Vuitton", CH: "Chrome Hearts",
  CD: "Dior", GG: "Gucci", GC: "Gucci", BB: "Burberry",
  TB: "Thom Browne", RL: "Ralph Lauren", TNF: "The North Face",
  FOG: "Fear of God", RO: "Rick Owens", VW: "Vivienne Westwood",
  BC: "Balenciaga", BLCG: "Balenciaga", Bape: "BAPE",
};

const KEEP_UPPER = new Set(["BAPE", "LV", "CDG", "TNF", "FOG", "NBA", "NFL", "UFC", "NYC", "USA", "EU", "UK", "AF1", "NB", "MM6", "ERD", "ASICS", "AMI", "YSL"]);

async function bulkFix() {
  let all = [];
  let offset = 0;
  while (true) {
    const { data } = await supabase.from("products").select("id, name, brand, category").range(offset, offset + 999);
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < 1000) break;
    offset += 1000;
  }
  console.log(`Scanning ${all.length} products...\n`);

  let catFixes = 0, nameFixes = 0, brandFixes = 0;
  let logCount = 0;

  for (const p of all) {
    const updates = {};
    let name = p.name || "";
    const origName = name;
    const brand = p.brand || "";
    const origBrand = brand;
    const category = p.category || "";

    // ===== CATEGORY FIXES =====
    if (category === "Bags" && /\b(baggy|sweatpant|jogger|jeans|cargo pant|trouser)/i.test(name)) {
      updates.category = "Pants"; catFixes++;
    }
    if (["Shoes"].includes(category) && /\b(birkenstock|crocs|clog|foam runner|yeezy slide)/i.test(name)) {
      updates.category = "Slides & Sandals"; catFixes++;
    }

    // ===== NAME FIXES =====

    // Remove batch codes
    name = name.replace(/\b(TG|DG|BF|OG|PK|LJR|GD|XP|X|H12|S2|GET|KW|M|SK|QY)\s*Batch\b/gi, "").trim();
    name = name.replace(/\bBudget\s*Batch\b/gi, "").trim();
    name = name.replace(/^Budget\s+/i, "").trim();

    // Remove tier labels in parens
    name = name.replace(/\s*\((Budget|Premium|Quality)\)\s*/gi, " ").trim();

    // Remove season codes
    name = name.replace(/\b\d{2}(SS|FW|AW)\b/gi, "").trim();
    name = name.replace(/\b(SS|FW|AW)\d{2}\b/gi, "").trim();

    // Remove seller price codes
    name = name.replace(/^P\d{2,4}\s+/i, "").trim();

    // Remove seller item codes
    name = name.replace(/\b\d{4,5}-\d{1,3}[A-Z]?\b/g, "").trim();

    // Fix all caps → Title Case
    if (name === name.toUpperCase() && name.length > 3 && /[A-Z]{4,}/.test(name)) {
      name = name.replace(/\w\S*/g, (txt) => {
        if (KEEP_UPPER.has(txt)) return txt;
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    }

    // Fix all lowercase → Title Case
    if (name === name.toLowerCase() && name.length > 3) {
      name = name.replace(/\b\w/g, (c) => c.toUpperCase());
    }

    // Standardize terms
    name = name.replace(/\bTee'?s?\b/gi, "T-Shirt");
    name = name.replace(/\bTrainers\b/gi, "Sneakers");

    // Remove prefixes
    name = name.replace(/^More\s+/i, "").trim();
    name = name.replace(/^Bunch\s+(of\s+)?/i, "").trim();

    // Remove trailing solo numbers
    name = name.replace(/\s+\d$/, "").trim();

    // Fix common typos
    name = name.replace(/\bBalencuaga\b/gi, "Balenciaga");
    name = name.replace(/\bRalp Lauren\b/gi, "Ralph Lauren");
    name = name.replace(/\bMasion Margiela\b/gi, "Maison Margiela");
    name = name.replace(/\bCourdoroy\b/gi, "Corduroy");
    name = name.replace(/\bYezzy\b/gi, "Yeezy");
    name = name.replace(/\bAirfoce\b/gi, "Air Force");
    name = name.replace(/\bUnderarmour\b/gi, "Under Armour");
    name = name.replace(/\bShirtt\b/gi, "Shirt");

    // Clean special chars and double spaces
    name = name.replace(/^[\s/\-–]+|[\s/\-–]+$/g, "").trim();
    name = name.replace(/\s{2,}/g, " ").trim();

    if (name !== origName && name.length > 0) {
      updates.name = name;
      nameFixes++;
    }

    // ===== BRAND FIXES =====
    if (BRAND_MAP[brand]) {
      updates.brand = BRAND_MAP[brand];
      brandFixes++;
    }

    // Extract brand from name if missing
    if (!brand || brand === "Unknown" || brand === "Various" || brand === "?") {
      for (const bp of BRAND_PATTERNS) {
        if (name.toLowerCase().includes(bp.toLowerCase())) {
          updates.brand = bp;
          brandFixes++;
          break;
        }
      }
    }

    // ===== APPLY =====
    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from("products").update(updates).eq("id", p.id);
      if (error) {
        console.error(`Error ${p.id}:`, error.message);
      } else if (logCount < 50) {
        const changes = [];
        if (updates.category) changes.push(`cat: ${category} → ${updates.category}`);
        if (updates.name) changes.push(`name: "${origName}" → "${updates.name}"`);
        if (updates.brand) changes.push(`brand: "${origBrand}" → "${updates.brand}"`);
        console.log(`  ${changes.join(" | ")}`);
        logCount++;
      }
    }
  }

  if (logCount >= 50) console.log(`  ... and more`);

  console.log("\n========== SUMMARY ==========");
  console.log(`Products scanned: ${all.length}`);
  console.log(`Category fixes: ${catFixes}`);
  console.log(`Name fixes: ${nameFixes}`);
  console.log(`Brand fixes: ${brandFixes}`);
  console.log(`Total changes: ${catFixes + nameFixes + brandFixes}`);
}

bulkFix().catch(console.error);
