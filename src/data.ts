/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DrinkCategory, CityInfo, SipRecord, CityRankingItem, UserProfile } from "@/types";

export const CHINA_MAP_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuCXtDDFx-6fqmPxi3YKloGCevP93mHSnT8SRYzXNRkZJ9BIH0qKKpNWNntuNVELs4UUobgNEAfZKKxjKejzNlv33T2XkXQGVvpBV-dsCTit5QkBZNvWU4TJuS1xUp4EJP4Xsx3PhZVOEQs_o6P51dj6QoNGlOtUAt3uOsXeBPEhQERCLMGrNtt1_0Y3sXkPJZjhE_nJEs1-TU0ef6t18dG68-imn44o_OwLj_F8ssXSdumyeo9E_ZYlPXG0ttFWlqaCGIjEYuciYazH";

export const PRESET_DRINK_IMAGES: Record<DrinkCategory, string[]> = {
  [DrinkCategory.Matcha]: [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDFG-DAPah6FLNQSUJK0eTFOBbl4mImA2Yc89sGhE951fU6LIF_b_ZPsxBuFRF-OTMZmF_LZh_sQynT5Dtlm3nSdXKmwOAYq_05LK8mHg0qrgXISS3NcK4DoUHGIsjiA_E_Bh7lDqIfs9yQTQ5l2U_AM1ocj_p-5LGIXwZLWrr8ooPEYpbGwNZ3Y4zjtsU2xWpuKLRkOGbbQMjCIexpZGAB9pfdlrgcohgQKBq9OnTx3clfpZcBIaUvUgzNUdwMFriKQUOySiPo4Dqg",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCPPmkFgoualxK__yPFnCI2bOVJur1CMwV9dsW2SWrTidGlkgu53pbEvf7INMtyyEg0pTeHeiRbTTluu2RpX-3zDzY0pSrInBvFBgMZLWew6LX1BeNCL2z4O0xGj3e39V_7h8AUVlaMPsXZdDrKxOOvwki4NT9a0TW_AFw7dF7Gz15-Bb4JkVp1nO2boxGpQHgTrRwlHBqK_KJC4-Mc4XcVh98RHgjOmmjWknGgfJfHsp8kigMNO4epHF3GIsO13DdvZ-CnqPPQI0Xl"
  ],
  [DrinkCategory.Coffee]: [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAZklPHlylUA1GeuGhm7n-ZehJ_tmtcSyUvVb4jg-dp9RKnEwUQYS2CMVrj98e-NRAy4gP6Kr9p1PL6Odm7mHFa9BoAdaSH2msUrDCEPEEoc6m-ydO6Y8TL0nv4b3uuVtE59VVZJew6Lq2_r60pt8hBT1pUmpcmvsbRLaK0cyMLL34mB22SiIq1C-TjqRXOdnCQ40Jf_wTPjMekBSJGOGmFAjf5J2MQN3O8pDhWXiQV_Pt1qYl-1eCccdiUqFjIChOBxDSstcMfj4-n"
  ],
  [DrinkCategory.PourOver]: [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCwIqLepqUldwos56p1AeONRQCaQ-ZPQMdexUhLEKzdZFR-I5FFZI5BGnoRV8TmWrE-tPY1TICCwBz_EemidyTpQyFHkJdaiEO6y0VMukqUOZojEOSTGOdwDhX_zKlcPIhhw--W6OEt4_OO_N0-zWGmHuyyPoQ7Hx_W9vdhgOcBKi2Ty3JWxsN8eiyTdveHTjgrYLufwg785R-jGUIJwwg-XSckBJZIixHfR7SwsSeeQ5tDqEsY_4E14Jg2lrvgkevQiMWCxhw15W01",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDMleBIDaXqL9hLyF5UepPXYGvvkgG3X89JB8aHqDulL8j0-F1nB9E48-y1Yvp_gvvW0WcA2tp1ubIEi_JLCscxPBdJ1EvgdlWu9qvcsRDLyf5OCajupCwSHaWXB0nuo279lQ8M_H3K3WO1fjjxGRU2Msc1a12HmKEcIG6ZVxeDcy_nIjhfpr-shgYpt-wz7XVTBVncKuCLJ4ym4q9QOgnJXu59ET97NsuhRDY770STNQqCcCjMAItGLT-1mrRZMx9-FECMbQ52DqSV"
  ],
  [DrinkCategory.FruitTea]: [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBJ3_gzO2BVxb1AixwriBpK9UUNcXfjzpE7pkF1chrOHDyr4B591wjbCQj3YRrZeX4n4XArE9APfXgRJWlZkyQ3cwGCN9nHvXYB2wbIoWP2vgQ2QoMr2s_YsAE_iBbcwZk3qOZriW6AO2Yhj-cSpchB3jnJl942lIUK1nTLFU__dVV-HdRY1cihqy7AIO5iw2SEXCBk-bzRcGVS4gctVe7Q9qr5I2l91oDQnTrgXrzgVUNZryu8gLlXU8tvs0t1Ue9ytMdgmSpx9IXx"
  ],
  [DrinkCategory.Tea]: [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDCXXsNovzqMEOz-T1aEhdr2pBd1BcIfYgbu81OQhEFWnsMFtS-44fCfDi1TnyNkI6tV_O6T438_wl28k0GYIs5il6c3Rwzxb48QJyIa9GaevYmR446Iyzrx6bC6LuJ7GmZEVSAAdVaILdHdWBxS47a2Kl2zMFb5GRbnDIpLAK5guEQ62uBvQFdXNMLDl7FPheuUDneRqm4PzvMYL08gcdPs4hZFn5oqysCscuqIX3NK2nUGD676qSgPQlbxhb2prD_-zbhJWSa7e2M"
  ],
  [DrinkCategory.MilkTea]: [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAZklPHlylUA1GeuGhm7n-ZehJ_tmtcSyUvVb4jg-dp9RKnEwUQYS2CMVrj98e-NRAy4gP6Kr9p1PL6Odm7mHFa9BoAdaSH2msUrDCEPEEoc6m-ydO6Y8TL0nv4b3uuVtE59VVZJew6Lq2_r60pt8hBT1pUmpcmvsbRLaK0cyMLL34mB22SiIq1C-TjqRXOdnCQ40Jf_wTPjMekBSJGOGmFAjf5J2MQN3O8pDhWXiQV_Pt1qYl-1eCccdiUqFjIChOBxDSstcMfj4-n"
  ]
};

export const CITIES: CityInfo[] = [
  { name: "Shanghai", displayName: "上海", x: 70, y: 40 },
  { name: "Beijing", displayName: "北京", x: 65, y: 30 },
  { name: "Chengdu", displayName: "成都", x: 60, y: 60 },
  { name: "Guangzhou", displayName: "广州", x: 68, y: 75 },
  { name: "Shenzhen", displayName: "深圳", x: 67, y: 78 },
  { name: "Hangzhou", displayName: "杭州", x: 70, y: 46 },
  { name: "Suzhou", displayName: "苏州", x: 69, y: 43 },
  { name: "Chongqing", displayName: "重庆", x: 52, y: 62 },
  { name: "Xi'an", displayName: "西安", x: 48, y: 45 },
  { name: "Wuhan", displayName: "武汉", x: 61, y: 52 },
  { name: "Nanjing", displayName: "南京", x: 68, y: 41 },
  { name: "Changsha", displayName: "长沙", x: 59, y: 61 }
];

export const INITIAL_SIPS: SipRecord[] = [
  {
    id: "sip-1",
    drinkName: "晨间抹茶",
    shopName: "芋泥咖啡屋",
    cityName: "Shanghai",
    districtName: "徐汇区",
    date: "2026-07-06",
    category: DrinkCategory.Matcha,
    flavorTags: ["草木香", "奶香"],
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFG-DAPah6FLNQSUJK0eTFOBbl4mImA2Yc89sGhE951fU6LIF_b_ZPsxBuFRF-OTMZmF_LZh_sQynT5Dtlm3nSdXKmwOAYq_05LK8mHg0qrgXISS3NcK4DoUHGIsjiA_E_Bh7lDqIfs9yQTQ5l2U_AM1ocj_p-5LGIXwZLWrr8ooPEYpbGwNZ3Y4zjtsU2xWpuKLRkOGbbQMjCIexpZGAB9pfdlrgcohgQKBq9OnTx3clfpZcBIaUvUgzNUdwMFriKQUOySiPo4Dqg",
    rating: 5,
    comment: "精致的陶瓷杯，口感极其丝滑，抹茶原料源自西尾。"
  },
  {
    id: "sip-2",
    drinkName: "埃塞俄比亚 耶加雪菲",
    shopName: "格网咖啡",
    cityName: "Beijing",
    districtName: "朝阳区",
    date: "2026-07-04",
    category: DrinkCategory.PourOver,
    flavorTags: ["果香", "花香"],
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCwIqLepqUldwos56p1AeONRQCaQ-ZPQMdexUhLEKzdZFR-I5FFZI5BGnoRV8TmWrE-tPY1TICCwBz_EemidyTpQyFHkJdaiEO6y0VMukqUOZojEOSTGOdwDhX_zKlcPIhhw--W6OEt4_OO_N0-zWGmHuyyPoQ7Hx_W9vdhgOcBKi2Ty3JWxsN8eiyTdveHTjgrYLufwg785R-jGUIJwwg-XSckBJZIixHfR7SwsSeeQ5tDqEsY_4E14Jg2lrvgkevQiMWCxhw15W01",
    rating: 4,
    comment: "非常干净的水洗处理，茉莉花与柠檬皮风味浓郁。"
  },
  {
    id: "sip-3",
    drinkName: "盛夏百香果茶",
    shopName: "茶与她",
    cityName: "Chengdu",
    districtName: "锦江区",
    date: "2026-06-28",
    category: DrinkCategory.FruitTea,
    flavorTags: ["清甜", "果香"],
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBJ3_gzO2BVxb1AixwriBpK9UUNcXfjzpE7pkF1chrOHDyr4B591wjbCQj3YRrZeX4n4XArE9APfXgRJWlZkyQ3cwGCN9nHvXYB2wbIoWP2vgQ2QoMr2s_YsAE_iBbcwZk3qOZriW6AO2Yhj-cSpchB3jnJl942lIUK1nTLFU__dVV-HdRY1cihqy7AIO5iw2SEXCBk-bzRcGVS4gctVe7Q9qr5I2l91oDQnTrgXrzgVUNZryu8gLlXU8tvs0t1Ue9ytMdgmSpx9IXx",
    rating: 5,
    comment: "夏日户外极佳的清爽饮品，可以嚼到新鲜百香果籽。"
  },
  {
    id: "sip-4",
    drinkName: "特选铁观音",
    shopName: "传统茶社",
    cityName: "Guangzhou",
    districtName: "南沙区",
    date: "2026-06-15",
    category: DrinkCategory.Tea,
    flavorTags: ["花香", "微苦"],
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCXXsNovzqMEOz-T1aEhdr2pBd1BcIfYgbu81OQhEFWnsMFtS-44fCfDi1TnyNkI6tV_O6T438_wl28k0GYIs5il6c3Rwzxb48QJyIa9GaevYmR446Iyzrx6bC6LuJ7GmZEVSAAdVaILdHdWBxS47a2Kl2zMFb5GRbnDIpLAK5guEQ62uBvQFdXNMLDl7FPheuUDneRqm4PzvMYL08gcdPs4hZFn5oqysCscuqIX3NK2nUGD676qSgPQlbxhb2prD_-zbhJWSa7e2M",
    rating: 5,
    comment: "精致的白瓷杯，入口生津，有持久的幽雅兰花回甘。"
  }
];

export const CITY_RANKINGS: Record<string, CityRankingItem[]> = {
  "Shanghai": [
    {
      rank: 1,
      drinkName: "生椰拿铁",
      shopName: "Manner 咖啡",
      cityName: "Shanghai",
      districtName: "静安区",
      category: DrinkCategory.Coffee,
      sipsToday: "1.2k",
      isTrending: true,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZklPHlylUA1GeuGhm7n-ZehJ_tmtcSyUvVb4jg-dp9RKnEwUQYS2CMVrj98e-NRAy4gP6Kr9p1PL6Odm7mHFa9BoAdaSH2msUrDCEPEEoc6m-ydO6Y8TL0nv4b3uuVtE59VVZJew6Lq2_r60pt8hBT1pUmpcmvsbRLaK0cyMLL34mB22SiIq1C-TjqRXOdnCQ40Jf_wTPjMekBSJGOGmFAjf5J2MQN3O8pDhWXiQV_Pt1qYl-1eCccdiUqFjIChOBxDSstcMfj4-n"
    },
    {
      rank: 2,
      drinkName: "冰抹茶拿铁",
      shopName: "Alimentari 意式餐厅",
      cityName: "Shanghai",
      districtName: "徐汇区",
      category: DrinkCategory.Matcha,
      sipsToday: "980",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPPmkFgoualxK__yPFnCI2bOVJur1CMwV9dsW2SWrTidGlkgu53pbEvf7INMtyyEg0pTeHeiRbTTluu2RpX-3zDzY0pSrInBvFBgMZLWew6LX1BeNCL2z4O0xGj3e39V_7h8AUVlaMPsXZdDrKxOOvwki4NT9a0TW_AFw7dF7Gz15-Bb4JkVp1nO2boxGpQHgTrRwlHBqK_KJC4-Mc4XcVh98RHgjOmmjWknGgfJfHsp8kigMNO4epHF3GIsO13DdvZ-CnqPPQI0Xl"
    },
    {
      rank: 3,
      drinkName: "埃塞俄比亚 耶加雪菲",
      shopName: "Seesaw 咖啡",
      cityName: "Shanghai",
      districtName: "黄浦区",
      category: DrinkCategory.PourOver,
      sipsToday: "850",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDMleBIDaXqL9hLyF5UepPXYGvvkgG3X89JB8aHqDulL8j0-F1nB9E48-y1Yvp_gvvW0WcA2tp1ubIEi_JLCscxPBdJ1EvgdlWu9qvcsRDLyf5OCajupCwSHaWXB0nuo279lQ8M_H3K3WO1fjjxGRU2Msc1a12HmKEcIG6ZVxeDcy_nIjhfpr-shgYpt-wz7XVTBVncKuCLJ4ym4q9QOgnJXu59ET97NsuhRDY770STNQqCcCjMAItGLT-1mrRZMx9-FECMbQ52DqSV"
    }
  ],
  "Beijing": [
    {
      rank: 1,
      drinkName: "埃塞俄比亚 耶加雪菲",
      shopName: "格网咖啡",
      cityName: "Beijing",
      districtName: "三里屯",
      category: DrinkCategory.PourOver,
      sipsToday: "1.1k",
      isTrending: true,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCwIqLepqUldwos56p1AeONRQCaQ-ZPQMdexUhLEKzdZFR-I5FFZI5BGnoRV8TmWrE-tPY1TICCwBz_EemidyTpQyFHkJdaiEO6y0VMukqUOZojEOSTGOdwDhX_zKlcPIhhw--W6OEt4_OO_N0-zWGmHuyyPoQ7Hx_W9vdhgOcBKi2Ty3JWxsN8eiyTdveHTjgrYLufwg785R-jGUIJwwg-XSckBJZIixHfR7SwsSeeQ5tDqEsY_4E14Jg2lrvgkevQiMWCxhw15W01"
    },
    {
      rank: 2,
      drinkName: "经典老北京乌龙",
      shopName: "吴裕泰茶庄",
      cityName: "Beijing",
      districtName: "东城区",
      category: DrinkCategory.Tea,
      sipsToday: "940",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCXXsNovzqMEOz-T1aEhdr2pBd1BcIfYgbu81OQhEFWnsMFtS-44fCfDi1TnyNkI6tV_O6T438_wl28k0GYIs5il6c3Rwzxb48QJyIa9GaevYmR446Iyzrx6bC6LuJ7GmZEVSAAdVaILdHdWBxS47a2Kl2zMFb5GRbnDIpLAK5guEQ62uBvQFdXNMLDl7FPheuUDneRqm4PzvMYL08gcdPs4hZFn5oqysCscuqIX3NK2nUGD676qSgPQlbxhb2prD_-zbhJWSa7e2M"
    },
    {
      rank: 3,
      drinkName: "芋泥抹茶冰沙",
      shopName: "茶与酿",
      cityName: "Beijing",
      districtName: "朝阳区",
      category: DrinkCategory.Matcha,
      sipsToday: "720",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFG-DAPah6FLNQSUJK0eTFOBbl4mImA2Yc89sGhE951fU6LIF_b_ZPsxBuFRF-OTMZmF_LZh_sQynT5Dtlm3nSdXKmwOAYq_05LK8mHg0qrgXISS3NcK4DoUHGIsjiA_E_Bh7lDqIfs9yQTQ5l2U_AM1ocj_p-5LGIXwZLWrr8ooPEYpbGwNZ3Y4zjtsU2xWpuKLRkOGbbQMjCIexpZGAB9pfdlrgcohgQKBq9OnTx3clfpZcBIaUvUgzNUdwMFriKQUOySiPo4Dqg"
    }
  ],
  "Chengdu": [
    {
      rank: 1,
      drinkName: "盛夏百香果茶",
      shopName: "霸王茶姬",
      cityName: "Chengdu",
      districtName: "春熙路",
      category: DrinkCategory.FruitTea,
      sipsToday: "1.4k",
      isTrending: true,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBJ3_gzO2BVxb1AixwriBpK9UUNcXfjzpE7pkF1chrOHDyr4B591wjbCQj3YRrZeX4n4XArE9APfXgRJWlZkyQ3cwGCN9nHvXYB2wbIoWP2vgQ2QoMr2s_YsAE_iBbcwZk3qOZriW6AO2Yhj-cSpchB3jnJl942lIUK1nTLFU__dVV-HdRY1cihqy7AIO5iw2SEXCBk-bzRcGVS4gctVe7Q9qr5I2l91oDQnTrgXrzgVUNZryu8gLlXU8tvs0t1Ue9ytMdgmSpx9IXx"
    },
    {
      rank: 2,
      drinkName: "四川茉莉花茶",
      shopName: "老顺兴茶馆",
      cityName: "Chengdu",
      districtName: "宽窄巷子",
      category: DrinkCategory.Tea,
      sipsToday: "1.1k",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCXXsNovzqMEOz-T1aEhdr2pBd1BcIfYgbu81OQhEFWnsMFtS-44fCfDi1TnyNkI6tV_O6T438_wl28k0GYIs5il6c3Rwzxb48QJyIa9GaevYmR446Iyzrx6bC6LuJ7GmZEVSAAdVaILdHdWBxS47a2Kl2zMFb5GRbnDIpLAK5guEQ62uBvQFdXNMLDl7FPheuUDneRqm4PzvMYL08gcdPs4hZFn5oqysCscuqIX3NK2nUGD676qSgPQlbxhb2prD_-zbhJWSa7e2M"
    },
    {
      rank: 3,
      drinkName: "冷萃瑰夏咖啡",
      shopName: "UID 咖啡",
      cityName: "Chengdu",
      districtName: "锦江区",
      category: DrinkCategory.PourOver,
      sipsToday: "640",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCwIqLepqUldwos56p1AeONRQCaQ-ZPQMdexUhLEKzdZFR-I5FFZI5BGnoRV8TmWrE-tPY1TICCwBz_EemidyTpQyFHkJdaiEO6y0VMukqUOZojEOSTGOdwDhX_zKlcPIhhw--W6OEt4_OO_N0-zWGmHuyyPoQ7Hx_W9vdhgOcBKi2Ty3JWxsN8eiyTdveHTjgrYLufwg785R-jGUIJwwg-XSckBJZIixHfR7SwsSeeQ5tDqEsY_4E14Jg2lrvgkevQiMWCxhw15W01"
    }
  ],
  "Guangzhou": [
    {
      rank: 1,
      drinkName: "特选铁观音",
      shopName: "大同酒家茶室",
      cityName: "Guangzhou",
      districtName: "荔湾区",
      category: DrinkCategory.Tea,
      sipsToday: "1.3k",
      isTrending: true,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCXXsNovzqMEOz-T1aEhdr2pBd1BcIfYgbu81OQhEFWnsMFtS-44fCfDi1TnyNkI6tV_O6T438_wl28k0GYIs5il6c3Rwzxb48QJyIa9GaevYmR446Iyzrx6bC6LuJ7GmZEVSAAdVaILdHdWBxS47a2Kl2zMFb5GRbnDIpLAK5guEQ62uBvQFdXNMLDl7FPheuUDneRqm4PzvMYL08gcdPs4hZFn5oqysCscuqIX3NK2nUGD676qSgPQlbxhb2prD_-zbhJWSa7e2M"
    },
    {
      rank: 2,
      drinkName: "冰滴耶加雪菲",
      shopName: "Lokal 咖啡",
      cityName: "Guangzhou",
      districtName: "天河区",
      category: DrinkCategory.Coffee,
      sipsToday: "920",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZklPHlylUA1GeuGhm7n-ZehJ_tmtcSyUvVb4jg-dp9RKnEwUQYS2CMVrj98e-NRAy4gP6Kr9p1PL6Odm7mHFa9BoAdaSH2msUrDCEPEEoc6m-ydO6Y8TL0nv4b3uuVtE59VVZJew6Lq2_r60pt8hBT1pUmpcmvsbRLaK0cyMLL34mB22SiIq1C-TjqRXOdnCQ40Jf_wTPjMekBSJGOGmFAjf5J2MQN3O8pDhWXiQV_Pt1qYl-1eCccdiUqFjIChOBxDSstcMfj4-n"
    },
    {
      rank: 3,
      drinkName: "多肉葡萄杨梅",
      shopName: "喜茶",
      cityName: "Guangzhou",
      districtName: "越秀区",
      category: DrinkCategory.FruitTea,
      sipsToday: "890",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBJ3_gzO2BVxb1AixwriBpK9UUNcXfjzpE7pkF1chrOHDyr4B591wjbCQj3YRrZeX4n4XArE9APfXgRJWlZkyQ3cwGCN9nHvXYB2wbIoWP2vgQ2QoMr2s_YsAE_iBbcwZk3qOZriW6AO2Yhj-cSpchB3jnJl942lIUK1nTLFU__dVV-HdRY1cihqy7AIO5iw2SEXCBk-bzRcGVS4gctVe7Q9qr5I2l91oDQnTrgXrzgVUNZryu8gLlXU8tvs0t1Ue9ytMdgmSpx9IXx"
    }
  ]
};

export const INITIAL_PROFILE: UserProfile = {
  name: "品饮大师 茉莉",
  handle: "@jasmine_sips",
  bio: "用一杯茶或咖啡，丈量这个世界的温度。",
  avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-VXJ6BlpMihIC-BGTCROuLA3D26wwxVoW78lt-V-WaxgWgdq8OrJJTZJ06skGwpK0p1V6exKUT79hijpUFtqHsjZmvoq9QgyObNWS7a8aGBmaAUdQoD8AJpyWVXW7AmGm9hmEzrhXDD8lV6jhcy8btTVWi1IXi7hvDQlVynub4Gqm6fWqFPU26uYrzNhDJpNqrdLp_zR5-TvU0H951pfkCUjOKozmcmHkVTewaaqlrx5HCcCSYCh6nWQQB4w3--YfloITnlPlqP9W",
  badges: [
    {
      id: "badge-early",
      name: "元老用户",
      description: "SipNotes 首批创始成员。",
      icon: "verified",
      color: "bg-primary-container/20 text-on-primary-container border-primary-container/30"
    },
    {
      id: "badge-coffee",
      name: "咖啡狂热粉",
      description: "累计打卡超过 50 杯精品手冲/拿铁。",
      icon: "local_cafe",
      color: "bg-secondary-container/20 text-secondary border-secondary-container/30"
    },
    {
      id: "badge-citrus",
      name: "饮品探险家",
      description: "尝试过 10 种独特的特调水果茶饮。",
      icon: "explore",
      color: "bg-amber-100 text-amber-800 border-amber-200"
    },
    {
      id: "badge-shanghai",
      name: "上海活地图",
      description: "在徐汇区打卡超过 5 家极富特色的小店。",
      icon: "map",
      color: "bg-teal-100 text-teal-800 border-teal-200"
    }
  ]
};
