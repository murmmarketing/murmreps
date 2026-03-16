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
    buildUrl: (link) =>
      `https://cnfans.com/product/?url=${encodeURIComponent(link)}`,
    referralUrl: "https://cnfans.com/register?ref=17439797",
  },
  {
    name: "MuleBuy",
    buildUrl: (link) =>
      `https://mulebuy.com/product/?url=${encodeURIComponent(link)}`,
    referralUrl: "https://mulebuy.com/register?ref=201054809",
  },
  {
    name: "ACBuy",
    buildUrl: (link) =>
      `https://www.acbuy.com/product?url=${encodeURIComponent(link)}`,
    referralUrl:
      "https://www.acbuy.com/login?loginStatus=register&code=RJLAUE",
  },
  {
    name: "LoveGoBuy",
    buildUrl: (link) =>
      `https://www.lovegobuy.com/product?url=${encodeURIComponent(link)}`,
    referralUrl: "https://www.lovegobuy.com/?invite_code=5C3H94",
  },
  {
    name: "JoyaGoo",
    buildUrl: (link) =>
      `https://joyagoo.com/product?url=${encodeURIComponent(link)}`,
    referralUrl: "https://joyagoo.com/register?ref=300914828",
  },
  {
    name: "SugarGoo",
    buildUrl: (link) =>
      `https://sugargoo.com/product?url=${encodeURIComponent(link)}`,
    referralUrl: "https://sugargoo.com",
  },
];
