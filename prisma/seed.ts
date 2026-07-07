import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ================================================================
  // 1. Categories
  // ================================================================
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "milk_tea" },
      update: {},
      create: { name: "milk_tea", label: "\u5976\u8336" },
    }),
    prisma.category.upsert({
      where: { name: "coffee" },
      update: {},
      create: { name: "coffee", label: "\u5496\u5561" },
    }),
    prisma.category.upsert({
      where: { name: "fruit_tea" },
      update: {},
      create: { name: "fruit_tea", label: "\u679C\u8336" },
    }),
    prisma.category.upsert({
      where: { name: "other" },
      update: {},
      create: { name: "other", label: "\u5176\u4ED6" },
    }),
  ]);

  const [milkTea, coffee, fruitTea, other] = categories;
  console.log(`Created ${categories.length} categories`);

  // ================================================================
  // 2. Brands
  // ================================================================
  const brandData = [
    { name: "\u559C\u8336" },
    { name: "\u5948\u96EA\u7684\u8336" },
    { name: "\u745E\u5E78\u5496\u5561" },
    { name: "\u661F\u5DF4\u514B" },
    { name: "Manner" },
    { name: "\u8336\u989C\u60A6\u8272" },
    { name: "\u53E4\u8317" },
    { name: "\u871C\u96EA\u51B0\u57CE" },
  ];

  const brands: Record<string, { id: string; name: string }> = {};
  for (const b of brandData) {
    const brand = await prisma.brand.upsert({
      where: { name: b.name },
      update: {},
      create: { name: b.name },
    });
    brands[b.name] = brand;
  }
  console.log(`Created ${Object.keys(brands).length} brands`);

  // ================================================================
  // 3. Drinks (2-4 per brand, 30+ total)
  // ================================================================
  const drinkData: { name: string; brandName: string; categoryId: string }[] = [
    // Heytea
    { name: "\u591A\u8089\u8461\u8404", brandName: "\u559C\u8336", categoryId: fruitTea.id },
    { name: "\u82B7\u82B7\u8461\u8404", brandName: "\u559C\u8336", categoryId: fruitTea.id },
    { name: "\u70E4\u9ED1\u5976\u8336\u6CE2\u6CE2", brandName: "\u559C\u8336", categoryId: milkTea.id },
    { name: "\u591A\u8089\u8292\u8292\u7518\u9732", brandName: "\u559C\u8336", categoryId: fruitTea.id },
    // Nayuki
    { name: "\u9738\u6C14\u7389\u6CB9\u67D1", brandName: "\u5948\u96EA\u7684\u8336", categoryId: fruitTea.id },
    { name: "\u5976\u5C6B\u5B9D\u85CF\u8336", brandName: "\u5948\u96EA\u7684\u8336", categoryId: milkTea.id },
    { name: "\u6768\u679D\u7518\u9732", brandName: "\u5948\u96EA\u7684\u8336", categoryId: fruitTea.id },
    // Luckin
    { name: "\u751F\u6930\u62FF\u94C1", brandName: "\u745E\u5E78\u5496\u5561", categoryId: coffee.id },
    { name: "\u751F\u9171\u62FF\u94C1", brandName: "\u745E\u5E78\u5496\u5561", categoryId: coffee.id },
    { name: "\u6D77\u76D0\u82B1\u751F\u62FF\u94C1", brandName: "\u745E\u5E78\u5496\u5561", categoryId: coffee.id },
    { name: "\u6A59C\u7F8E\u5F0F", brandName: "\u745E\u5E78\u5496\u5561", categoryId: coffee.id },
    // Starbucks
    { name: "\u661F\u51B0\u4E50", brandName: "\u661F\u5DF4\u514B", categoryId: coffee.id },
    { name: "\u62FF\u94C1", brandName: "\u661F\u5DF4\u514B", categoryId: coffee.id },
    { name: "\u7126\u7CD6\u739B\u5947\u6735", brandName: "\u661F\u5DF4\u514B", categoryId: coffee.id },
    { name: "\u62B9\u8336\u62FF\u94C1", brandName: "\u661F\u5DF4\u514B", categoryId: milkTea.id },
    // Manner
    { name: "\u7F8E\u5F0F", brandName: "Manner", categoryId: coffee.id },
    { name: "\u6FB3\u767D", brandName: "Manner", categoryId: coffee.id },
    { name: "\u6842\u82B1\u62FF\u94C1", brandName: "Manner", categoryId: coffee.id },
    // Chayan Yuese
    { name: "\u58F0\u58F0\u4E4C\u9F99", brandName: "\u8336\u989C\u60A6\u8272", categoryId: milkTea.id },
    { name: "\u5E7D\u5170\u62FF\u94C1", brandName: "\u8336\u989C\u60A6\u8272", categoryId: milkTea.id },
    { name: "\u6843\u82B1\u4E4C\u9F99", brandName: "\u8336\u989C\u60A6\u8272", categoryId: milkTea.id },
    { name: "\u5F00\u82B1\u7EA2\u8336", brandName: "\u8336\u989C\u60A6\u8272", categoryId: milkTea.id },
    // Guming
    { name: "\u8D85\u7EA7\u6768\u6885", brandName: "\u53E4\u8317", categoryId: fruitTea.id },
    { name: "\u67E0\u6AAC\u8336", brandName: "\u53E4\u8317", categoryId: fruitTea.id },
    { name: "\u73CD\u73E0\u5976\u8336", brandName: "\u53E4\u8317", categoryId: milkTea.id },
    // Mixue
    { name: "\u51B0\u9C9C\u67E0\u6AAC\u6C34", brandName: "\u871C\u96EA\u51B0\u57CE", categoryId: other.id },
    { name: "\u8702\u871C\u67E0\u6AAC\u6C34", brandName: "\u871C\u96EA\u51B0\u57CE", categoryId: other.id },
    { name: "\u6469\u5929\u8131\u5206\u5427", brandName: "\u871C\u96EA\u51B0\u57CE", categoryId: other.id },
    { name: "\u6843\u6843\u8336", brandName: "\u871C\u96EA\u51B0\u57CE", categoryId: fruitTea.id },
  ];

  const drinks: Record<string, { id: string; name: string }> = {};
  for (const d of drinkData) {
    const brand = brands[d.brandName];
    if (!brand) continue;
    const drink = await prisma.drink.upsert({
      where: { brandId_name: { brandId: brand.id, name: d.name } },
      update: {},
      create: {
        name: d.name,
        brandId: brand.id,
        categoryId: d.categoryId,
      },
    });
    drinks[`${d.brandName}-${d.name}`] = drink;
  }
  console.log(`Created ${Object.keys(drinks).length} drinks`);

  // ================================================================
  // 4. Cities (15 major Chinese cities)
  // ================================================================
  const cityData = [
    { name: "\u5317\u4EAC", province: "\u5317\u4EAC", code: "beijing" },
    { name: "\u4E0A\u6D77", province: "\u4E0A\u6D77", code: "shanghai" },
    { name: "\u5E7F\u5DDE", province: "\u5E7F\u4E1C", code: "guangzhou" },
    { name: "\u6DF1\u5733", province: "\u5E7F\u4E1C", code: "shenzhen" },
    { name: "\u676D\u5DDE", province: "\u6D59\u6C5F", code: "hangzhou" },
    { name: "\u6210\u90FD", province: "\u56DB\u5DDD", code: "chengdu" },
    { name: "\u91CD\u5E86", province: "\u91CD\u5E86", code: "chongqing" },
    { name: "\u6B66\u6C49", province: "\u6E56\u5317", code: "wuhan" },
    { name: "\u5357\u4EAC", province: "\u6C5F\u82CF", code: "nanjing" },
    { name: "\u897F\u5B89", province: "\u9655\u897F", code: "xian" },
    { name: "\u957F\u6C99", province: "\u6E56\u5357", code: "changsha" },
    { name: "\u82CF\u5DDE", province: "\u6C5F\u82CF", code: "suzhou" },
    { name: "\u53A6\u95E8", province: "\u798F\u5EFA", code: "xiamen" },
    { name: "\u6606\u660E", province: "\u4E91\u5357", code: "kunming" },
    { name: "\u9752\u5C9B", province: "\u5C71\u4E1C", code: "qingdao" },
  ];

  const cities: Record<string, { id: string; name: string }> = {};
  for (const c of cityData) {
    const city = await prisma.city.upsert({
      where: { code: c.code },
      update: {},
      create: { name: c.name, province: c.province, code: c.code },
    });
    cities[c.code] = city;
  }
  console.log(`Created ${Object.keys(cities).length} cities`);

  // ================================================================
  // 5. Demo User
  // ================================================================
  const demoUser = await prisma.user.upsert({
    where: { id: "demo-user-001" },
    update: {},
    create: { id: "demo-user-001" },
  });

  const demoUser2 = await prisma.user.upsert({
    where: { id: "demo-user-002" },
    update: {},
    create: { id: "demo-user-002" },
  });

  console.log("Created demo users");

  // ================================================================
  // 6. Demo Check-ins (20+)
  // ================================================================
  // Keys kept for future use in demo check-in generation below

  const checkInData: {
    userId: string;
    drinkKey: string;
    cityCode: string;
    date: string;
    caption: string;
  }[] = [
    { userId: demoUser.id, drinkKey: "\u559C\u8336-\u591A\u8089\u8461\u8404", cityCode: "shanghai", date: "2026-07-07", caption: "\u591A\u8089\u8461\u8404\u6C38\u8FDC\u7684\u795E" },
    { userId: demoUser.id, drinkKey: "\u745E\u5E78\u5496\u5561-\u751F\u6930\u62FF\u94C1", cityCode: "shanghai", date: "2026-07-07", caption: "\u4ECA\u5929\u559D\u7684\u4E09\u5206\u7CD6" },
    { userId: demoUser.id, drinkKey: "Manner-\u7F8E\u5F0F", cityCode: "shanghai", date: "2026-07-06", caption: "\u7B2C\u4E8C\u676F\u534A\u4EF7" },
    { userId: demoUser.id, drinkKey: "\u661F\u5DF4\u514B-\u661F\u51B0\u4E50", cityCode: "beijing", date: "2026-07-06", caption: "\u590F\u5929\u5FC5\u5907" },
    { userId: demoUser.id, drinkKey: "\u8336\u989C\u60A6\u8272-\u58F0\u58F0\u4E4C\u9F99", cityCode: "changsha", date: "2026-07-05", caption: "\u957F\u6C99\u5FC5\u559D" },
    { userId: demoUser.id, drinkKey: "\u53E4\u8317-\u8D85\u7EA7\u6768\u6885", cityCode: "hangzhou", date: "2026-07-05", caption: "\u6768\u6885\u5B63\u5F88\u9002\u5408" },
    { userId: demoUser.id, drinkKey: "\u871C\u96EA\u51B0\u57CE-\u51B0\u9C9C\u67E0\u6AAC\u6C34", cityCode: "chengdu", date: "2026-07-04", caption: "\u6027\u4EF7\u6BD4\u4E4B\u738B" },
    { userId: demoUser.id, drinkKey: "\u5948\u96EA\u7684\u8336-\u9738\u6C14\u7389\u6CB9\u67D1", cityCode: "guangzhou", date: "2026-07-04", caption: "\u592A\u597D\u559D\u4E86" },
    { userId: demoUser.id, drinkKey: "\u559C\u8336-\u70E4\u9ED1\u5976\u8336\u6CE2\u6CE2", cityCode: "shenzhen", date: "2026-07-03", caption: "\u5976\u8336\u63A7\u72EC\u4EAB" },
    { userId: demoUser.id, drinkKey: "\u745E\u5E78\u5496\u5561-\u751F\u9171\u62FF\u94C1", cityCode: "beijing", date: "2026-07-03", caption: "\u65B0\u54C1\u4E0D\u9519" },
    { userId: demoUser2.id, drinkKey: "\u559C\u8336-\u591A\u8089\u8461\u8404", cityCode: "shanghai", date: "2026-07-07", caption: "\u559C\u8336yyds" },
    { userId: demoUser2.id, drinkKey: "\u745E\u5E78\u5496\u5561-\u751F\u6930\u62FF\u94C1", cityCode: "shanghai", date: "2026-07-06", caption: "\u65E9\u8D77\u5FC5\u5907" },
    { userId: demoUser2.id, drinkKey: "\u745E\u5E78\u5496\u5561-\u751F\u6930\u62FF\u94C1", cityCode: "beijing", date: "2026-07-07", caption: "\u559D\u4E0D\u814A" },
    { userId: demoUser2.id, drinkKey: "Manner-\u6FB3\u767D", cityCode: "shanghai", date: "2026-07-07", caption: "\u6FB3\u767D\u63A7\u53D1\u8A00" },
    { userId: demoUser2.id, drinkKey: "\u661F\u5DF4\u514B-\u62FF\u94C1", cityCode: "guangzhou", date: "2026-07-05", caption: "\u7ECF\u5178\u6C38\u4E0D\u8FC7\u65F6" },
    { userId: demoUser2.id, drinkKey: "\u8336\u989C\u60A6\u8272-\u5E7D\u5170\u62FF\u94C1", cityCode: "changsha", date: "2026-07-06", caption: "\u6392\u961F\u4E00\u5C0F\u65F6\u503C\u4E86" },
    { userId: demoUser2.id, drinkKey: "\u53E4\u8317-\u67E0\u6AAC\u8336", cityCode: "hangzhou", date: "2026-07-04", caption: "\u6E05\u723D\u89E3\u6691" },
    { userId: demoUser2.id, drinkKey: "\u871C\u96EA\u51B0\u57CE-\u8702\u871C\u67E0\u6AAC\u6C34", cityCode: "chongqing", date: "2026-07-03", caption: "\u91CD\u5E86\u592A\u70ED\u4E86" },
    { userId: demoUser2.id, drinkKey: "\u5948\u96EA\u7684\u8336-\u5976\u5C6B\u5B9D\u85CF\u8336", cityCode: "nanjing", date: "2026-07-05", caption: "\u5976\u5C6B\u5F88\u6D53\u90C1" },
    { userId: demoUser2.id, drinkKey: "\u559C\u8336-\u82B7\u82B7\u8461\u8404", cityCode: "shenzhen", date: "2026-07-06", caption: "\u82B7\u82B7\u6BD4\u591A\u8089\u597D\u559D" },
    { userId: demoUser.id, drinkKey: "\u745E\u5E78\u5496\u5561-\u751F\u6930\u62FF\u94C1", cityCode: "hangzhou", date: "2026-07-07", caption: "\u897F\u6E56\u8FB9\u559D\u5496\u5561" },
    { userId: demoUser.id, drinkKey: "\u661F\u5DF4\u514B-\u7126\u7CD6\u739B\u5947\u6735", cityCode: "nanjing", date: "2026-07-07", caption: "\u7126\u7CD6\u5976\u6CB9\u5F88\u5730\u9053" },
    { userId: demoUser2.id, drinkKey: "\u8336\u989C\u60A6\u8272-\u6843\u82B1\u4E4C\u9F99", cityCode: "changsha", date: "2026-07-07", caption: "\u65B0\u54C1\u5C1D\u9C9C" },
    { userId: demoUser.id, drinkKey: "\u871C\u96EA\u51B0\u57CE-\u6843\u6843\u8336", cityCode: "wuhan", date: "2026-07-02", caption: "\u6843\u5B50\u5473\u9053\u5F88\u6B63" },
  ];

  let checkInCount = 0;
  const createdCheckIns: { id: string }[] = [];
  for (const ci of checkInData) {
    const drink = drinks[ci.drinkKey];
    const city = cities[ci.cityCode];
    if (!drink || !city) continue;

    const checkIn = await prisma.checkIn.create({
      data: {
        userId: ci.userId,
        drinkId: drink.id,
        cityId: city.id,
        imageUrl: "/uploads/placeholder.jpg",
        date: ci.date,
        caption: ci.caption,
      },
    });
    createdCheckIns.push(checkIn);
    checkInCount++;
  }
  console.log(`Created ${checkInCount} check-ins`);

  // ================================================================
  // 7. Demo Likes
  // ================================================================
  if (createdCheckIns.length >= 4) {
    await prisma.like.create({
      data: {
        userId: demoUser2.id,
        checkInId: createdCheckIns[0].id,
      },
    });
    await prisma.like.create({
      data: {
        userId: demoUser.id,
        checkInId: createdCheckIns[10].id,
      },
    });
    await prisma.like.create({
      data: {
        userId: demoUser2.id,
        checkInId: createdCheckIns[1].id,
      },
    });
    await prisma.like.create({
      data: {
        userId: demoUser.id,
        checkInId: createdCheckIns[3].id,
      },
    });
    console.log("Created demo likes");
  }

  // ================================================================
  // 8. Season Tips (12 months)
  // ================================================================
  const seasonTipData = [
    {
      month: 1,
      title: "\u51AC\u65E5\u6696\u996E\u5B63",
      description: "\u71AC\u8FC7\u5BD2\u51AC\u7684\u70ED\u5976\u8336\u548C\u62FF\u94C1\u662F\u6700\u597D\u7684\u4F34\u4FA3",
    },
    {
      month: 2,
      title: "\u65B0\u5E74\u5F00\u5DE5\u5496\u5561",
      description: "\u65B0\u5E74\u7B2C\u4E00\u676F\u5496\u5561\u5F00\u542F\u65B0\u7684\u4E00\u5E74",
    },
    {
      month: 3,
      title: "\u6625\u8336\u4E0A\u65B0\u5B63",
      description: "\u9F99\u4E95\u3001\u6BD4\u5C14\u7684\u6625\u8336\u7CFB\u5217\u5F00\u59CB\u4E0A\u65B0",
    },
    {
      month: 4,
      title: "\u6A31\u82B1\u5B63\u9650\u5B9A",
      description: "\u6A31\u82B1\u5473\u996E\u54C1\u9650\u65F6\u5F00\u552E\u4E2D",
    },
    {
      month: 5,
      title: "\u6768\u6885\u5B63\u8981\u6765\u4E86",
      description: "\u6768\u6885\u5F00\u59CB\u4E0A\u5E02\uFF0C\u5404\u5BB6\u6768\u6885\u996E\u54C1\u503C\u5F97\u5C1D\u8BD5",
    },
    {
      month: 6,
      title: "\u9EC4\u76AE\u5B63\u6B63\u5F53\u65F6",
      description: "\u9EC4\u76AE\u3001\u8354\u679D\u3001\u8584\u8377\u6B63\u5F53\u5B63\uFF0C\u89E3\u6691\u9996\u9009",
    },
    {
      month: 7,
      title: "\u76DB\u590F\u51B0\u996E\u5B63",
      description: "\u7095\u70ED\u590F\u65E5\u9700\u8981\u4E00\u676F\u51B0\u51C9\u7684\u679C\u8336\u6216\u51B0\u5496\u5561",
    },
    {
      month: 8,
      title: "\u79CB\u5929\u7B2C\u4E00\u676F\u5976\u8336",
      description: "\u79CB\u5929\u7684\u7B2C\u4E00\u676F\u5976\u8336\uFF0C\u4F60\u559D\u4E86\u5417",
    },
    {
      month: 9,
      title: "\u6842\u82B1\u98D8\u9999\u5B63",
      description: "\u6842\u82B1\u5B63\u8282\u7684\u6842\u82B1\u62FF\u94C1\u3001\u6842\u82B1\u4E4C\u9F99\u4E0D\u5BB9\u9519\u8FC7",
    },
    {
      month: 10,
      title: "\u67DA\u5B50\u8336\u4E0A\u65B0",
      description: "\u67DA\u5B50\u5B63\u8282\u7684\u67DA\u5B50\u8336\u7CFB\u5217\u5F00\u59CB\u4E86",
    },
    {
      month: 11,
      title: "\u70ED\u996E\u56DE\u5F52\u5B63",
      description: "\u5929\u51C9\u4E86\uFF0C\u70ED\u5976\u8336\u548C\u70ED\u62FF\u94C1\u662F\u6700\u597D\u7684\u6170\u85C9",
    },
    {
      month: 12,
      title: "\u5723\u8BDE\u9650\u5B9A\u7CFB\u5217",
      description: "\u5404\u5927\u54C1\u724C\u5723\u8BDE\u9650\u5B9A\u996E\u54C1\u5F00\u552E",
    },
  ];

  // Gather some drink IDs for season tips
  const allDrinkValues = Object.values(drinks);
  for (const tip of seasonTipData) {
    // Pick 2-3 random drinks for each tip
    const tipDrinkIds = allDrinkValues
      .slice((tip.month * 2) % allDrinkValues.length, (tip.month * 2) % allDrinkValues.length + 3)
      .map((d) => d.id);

    await prisma.seasonTip.create({
      data: {
        month: tip.month,
        title: tip.title,
        description: tip.description,
        drinkIds: tipDrinkIds.join(","),
      },
    });
  }
  console.log(`Created ${seasonTipData.length} season tips`);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
