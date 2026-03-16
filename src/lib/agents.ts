export type Platform = "weidian" | "taobao" | "1688" | null;

export interface ParsedLink {
  platform: Platform;
  itemId: string | null;
}

/** Detect platform and extract item ID from a source link */
export function parseSourceLink(link: string): ParsedLink {
  if (!link) return { platform: null, itemId: null };

  try {
    const url = new URL(link);
    const host = url.hostname.toLowerCase();

    if (host.includes("weidian.com")) {
      const itemId = url.searchParams.get("itemID") || url.searchParams.get("itemId");
      return { platform: "weidian", itemId };
    }

    if (host.includes("taobao.com") || host.includes("tmall.com")) {
      const itemId = url.searchParams.get("id");
      return { platform: "taobao", itemId };
    }

    if (host.includes("1688.com")) {
      // 1688 URLs: https://detail.1688.com/offer/XXXXXXX.html
      const match = url.pathname.match(/(\d+)\.html/);
      return { platform: "1688", itemId: match ? match[1] : null };
    }
  } catch {
    // Malformed URL — fall through
  }

  return { platform: null, itemId: null };
}

export interface Agent {
  name: string;
  buildUrl: (sourceLink: string) => string;
  referralUrl: string;
}

export const agents: Agent[] = [
  {
    name: "KakoBuy",
    buildUrl: (link) =>
      `https://www.kakobuy.com/item/detail?url=${encodeURIComponent(link)}`,
    referralUrl: "https://ikako.vip/r/6gkjt",
  },
  {
    name: "Superbuy",
    buildUrl: (link) =>
      `https://www.superbuy.com/en/page/buy?url=${encodeURIComponent(link)}`,
    referralUrl:
      "https://www.superbuy.com/en/page/login?partnercode=Eg87dv&type=register",
  },
  {
    name: "CnFans",
    buildUrl: (link) => {
      const { platform, itemId } = parseSourceLink(link);
      if (platform && itemId) {
        const p =
          platform === "weidian" ? "WEIDIAN" :
          platform === "taobao" ? "TAOBAO" : "ALI_1688";
        return `https://cnfans.com/product/?platform=${p}&id=${itemId}&ref=17439797`;
      }
      return `https://cnfans.com/product/?url=${encodeURIComponent(link)}&ref=17439797`;
    },
    referralUrl: "https://cnfans.com/register?ref=17439797",
  },
  {
    name: "MuleBuy",
    buildUrl: (link) => {
      const { platform, itemId } = parseSourceLink(link);
      if (platform && itemId) {
        const p =
          platform === "weidian" ? "WEIDIAN" :
          platform === "taobao" ? "TAOBAO" : "ALI_1688";
        return `https://mulebuy.com/product/?id=${itemId}&platform=${p}&ref=201054809`;
      }
      return `https://mulebuy.com/product/?url=${encodeURIComponent(link)}&ref=201054809`;
    },
    referralUrl: "https://mulebuy.com/register?ref=201054809",
  },
  {
    name: "ACBuy",
    buildUrl: (link) => {
      const { platform, itemId } = parseSourceLink(link);
      if (platform && itemId) {
        const s =
          platform === "weidian" ? "WD" :
          platform === "taobao" ? "TB" : "AL";
        return `https://www.acbuy.com/product?id=${itemId}&source=${s}&code=RJLAUE`;
      }
      return `https://www.acbuy.com/product?url=${encodeURIComponent(link)}&code=RJLAUE`;
    },
    referralUrl:
      "https://www.acbuy.com/login?loginStatus=register&code=RJLAUE",
  },
  {
    name: "LoveGoBuy",
    buildUrl: (link) => {
      const { platform, itemId } = parseSourceLink(link);
      if (platform && itemId) {
        const st =
          platform === "weidian" ? "weidian" :
          platform === "taobao" ? "taobao" : "ali_1688";
        return `https://www.lovegobuy.com/product?id=${itemId}&shop_type=${st}&invite_code=5C3H94`;
      }
      return `https://www.lovegobuy.com/product?url=${encodeURIComponent(link)}&invite_code=5C3H94`;
    },
    referralUrl: "https://www.lovegobuy.com/?invite_code=5C3H94",
  },
  {
    name: "JoyaGoo",
    buildUrl: (link) => {
      const { platform, itemId } = parseSourceLink(link);
      if (platform && itemId) {
        const p =
          platform === "weidian" ? "WEIDIAN" :
          platform === "taobao" ? "TAOBAO" : "ALI_1688";
        return `https://joyagoo.com/product?platform=${p}&id=${itemId}&ref=300914828`;
      }
      return `https://joyagoo.com/product?url=${encodeURIComponent(link)}&ref=300914828`;
    },
    referralUrl: "https://joyagoo.com/register?ref=300914828",
  },
  {
    name: "SugarGoo",
    buildUrl: (link) =>
      `https://www.sugargoo.com/#/home/productDetail?productLink=${encodeURIComponent(link)}`,
    referralUrl: "https://sugargoo.com",
  },
];

/** Build all 8 agent URLs for a given source link. Falls back to referral signup URLs if unparseable. */
export function buildAllAgentUrls(sourceLink: string): Record<string, string> {
  const result: Record<string, string> = {};
  const hasLink = !!sourceLink;

  for (const agent of agents) {
    result[agent.name] = hasLink ? agent.buildUrl(sourceLink) : agent.referralUrl;
  }

  return result;
}
