/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { CategoryType } from "@/types";

export interface PersonalRecommendation {
  drinkName: string;
  shopName: string;
  badge: string;
  description: string;
}

export interface BadgeInfo {
  badge: string;
  desc: string;
}

export const PERSONAL_RECOMMENDATIONS: Record<string, PersonalRecommendation[]> = {
  coffee: [
    {
      drinkName: "手调冰滴瑰夏",
      shopName: "UID 咖啡",
      badge: "神级瑰夏",
      description:
        "顶级巴拿马瑰夏，缓慢冰滴24小时，释放出高雅茉莉与香甜水蜜桃风味。",
    },
    {
      drinkName: "燕麦 Dirty",
      shopName: "Seesaw 咖啡",
      badge: "冰火撞击",
      description:
        "杯底冰镇香甜燕麦奶，直接承接滚烫热浓缩咖啡，入口即是冷热极致交织。",
    },
  ],
  milk_tea: [
    {
      drinkName: "声声乌龙",
      shopName: "茶颜悦色",
      badge: "清甜不腻",
      description:
        "蜜桃风味乌龙茶底撞入优质脱脂牛奶，口感极其轻盈甘爽，淡淡花果香萦绕。",
    },
    {
      drinkName: "芋泥厚牛乳波波",
      shopName: "喜茶",
      badge: "沙糯软粘",
      description:
        "手捣巨多沙软荔浦芋泥，裹上Q弹黑糖珍珠，倒入温热香浓鲜牛乳，绝绝子。",
    },
  ],
  fruit_tea: [
    {
      drinkName: "多肉黑提芝士",
      shopName: "喜茶",
      badge: "爆多果肉",
      description:
        "手剥新鲜大颗无籽黑提，铺满杯底，融入清新茉莉茶汤与绵密厚奶盖，超值大满足。",
    },
    {
      drinkName: "超大杯爆柠四季春",
      shopName: "林里茶饮",
      badge: "超值消暑",
      description:
        "高香四季春茶底配合一整颗爆打海南香水柠檬，解暑效果直击灵魂。",
    },
  ],
  other: [
    {
      drinkName: "高山冷泡冻顶乌龙",
      shopName: "山中岁月",
      badge: "兰花回甘",
      description:
        "中烘焙发酵乌龙，低温纯水冷萃24小时，汤色橙黄澄亮，落喉甜香生津。",
    },
    {
      drinkName: "炭焙肉桂岩茶",
      shopName: "传统古茶社",
      badge: "辛香岩韵",
      description:
        "炭火反复焙火的肉桂岩茶，干茶香气霸烈，带有一抹奇妙辛香，岩韵醇厚悠长。",
    },
  ],
};

export function getPersonalBadgeInfo(category: CategoryType): BadgeInfo {
  switch (category) {
    case "coffee":
      return {
        badge: "重度咖啡成瘾者",
        desc: "您钟爱清香微苦、坚果可可味十足的精制手磨或香浓拿铁咖啡，提神又饱含质感。",
      };
    case "milk_tea":
      return {
        badge: "快乐奶茶守护者",
        desc: "温润顺滑的牛乳遇上持久悠长红绿茶底，带给您满满的能量和日常小确幸。",
      };
    case "fruit_tea":
      return {
        badge: "鲜活果味探险家",
        desc: "您热衷于爆汁水果与清甜花香在舌尖的猛烈撞击，活力无限，阳光消暑。",
      };
    case "other":
      return {
        badge: "东方禅意茶客",
        desc: "您钟情于山野气息、天然岩韵的高山原叶冷萃或盖碗中慢跑出来的传统名茶。",
      };
    default:
      return {
        badge: "寻味探索大师",
        desc: "您拥有一条极富探险精神的多元化味蕾，每一种精彩的特色饮品都想品味一番。",
      };
  }
}

export function getRecommendationsForCategory(
  category: CategoryType
): PersonalRecommendation[] {
  return PERSONAL_RECOMMENDATIONS[category] ?? PERSONAL_RECOMMENDATIONS["other"];
}
