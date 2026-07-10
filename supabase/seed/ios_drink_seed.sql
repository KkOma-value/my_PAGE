insert into public.cities (code, name, province, display_name, map_x, map_y, sort_order)
values
  ('shanghai', 'Shanghai', 'Shanghai', '上海', 70, 40, 1),
  ('beijing', 'Beijing', 'Beijing', '北京', 65, 30, 2),
  ('guangzhou', 'Guangzhou', 'Guangdong', '广州', 68, 75, 3),
  ('shenzhen', 'Shenzhen', 'Guangdong', '深圳', 67, 78, 4),
  ('chengdu', 'Chengdu', 'Sichuan', '成都', 60, 60, 5),
  ('chongqing', 'Chongqing', 'Chongqing', '重庆', 52, 62, 6),
  ('hangzhou', 'Hangzhou', 'Zhejiang', '杭州', 70, 46, 7),
  ('suzhou', 'Suzhou', 'Jiangsu', '苏州', 69, 43, 8),
  ('nanjing', 'Nanjing', 'Jiangsu', '南京', 68, 41, 9),
  ('wuhan', 'Wuhan', 'Hubei', '武汉', 61, 52, 10),
  ('xian', 'Xi''an', 'Shaanxi', '西安', 48, 45, 11),
  ('changsha', 'Changsha', 'Hunan', '长沙', 59, 61, 12),
  ('tianjin', 'Tianjin', 'Tianjin', '天津', 66, 33, 13),
  ('qingdao', 'Qingdao', 'Shandong', '青岛', 70, 39, 14),
  ('xiamen', 'Xiamen', 'Fujian', '厦门', 72, 68, 15),
  ('fuzhou', 'Fuzhou', 'Fujian', '福州', 72, 64, 16),
  ('ningbo', 'Ningbo', 'Zhejiang', '宁波', 73, 48, 17),
  ('zhengzhou', 'Zhengzhou', 'Henan', '郑州', 57, 45, 18),
  ('jinan', 'Jinan', 'Shandong', '济南', 66, 38, 19),
  ('shenyang', 'Shenyang', 'Liaoning', '沈阳', 74, 22, 20),
  ('dalian', 'Dalian', 'Liaoning', '大连', 73, 31, 21),
  ('harbin', 'Harbin', 'Heilongjiang', '哈尔滨', 74, 14, 22),
  ('kunming', 'Kunming', 'Yunnan', '昆明', 43, 70, 23),
  ('guiyang', 'Guiyang', 'Guizhou', '贵阳', 52, 67, 24),
  ('nanning', 'Nanning', 'Guangxi', '南宁', 56, 76, 25),
  ('hefei', 'Hefei', 'Anhui', '合肥', 65, 48, 26),
  ('wuxi', 'Wuxi', 'Jiangsu', '无锡', 70, 44, 27),
  ('foshan', 'Foshan', 'Guangdong', '佛山', 67, 75, 28),
  ('dongguan', 'Dongguan', 'Guangdong', '东莞', 68, 77, 29),
  ('sanya', 'Sanya', 'Hainan', '三亚', 59, 88, 30)
on conflict (code) do update set
  name = excluded.name,
  province = excluded.province,
  display_name = excluded.display_name,
  map_x = excluded.map_x,
  map_y = excluded.map_y,
  sort_order = excluded.sort_order,
  active = true;

with region_seed (city_code, region_codes, region_names) as (
  values
    ('shanghai', array['huangpu', 'xuhui', 'jingan'], array['黄浦区', '徐汇区', '静安区']),
    ('beijing', array['dongcheng', 'chaoyang', 'haidian'], array['东城区', '朝阳区', '海淀区']),
    ('guangzhou', array['yuexiu', 'tianhe', 'haizhu'], array['越秀区', '天河区', '海珠区']),
    ('shenzhen', array['futian', 'nanshan', 'luohu'], array['福田区', '南山区', '罗湖区']),
    ('chengdu', array['jinjiang', 'wuhou', 'qingyang'], array['锦江区', '武侯区', '青羊区']),
    ('chongqing', array['yuzhong', 'jiangbei', 'shapingba'], array['渝中区', '江北区', '沙坪坝区']),
    ('hangzhou', array['shangcheng', 'xihu', 'gongshu'], array['上城区', '西湖区', '拱墅区']),
    ('suzhou', array['gusu', 'wuzhong', 'industrial_park'], array['姑苏区', '吴中区', '工业园区']),
    ('nanjing', array['xuanwu', 'qinhuai', 'jianye'], array['玄武区', '秦淮区', '建邺区']),
    ('wuhan', array['jianghan', 'wuchang', 'hongshan'], array['江汉区', '武昌区', '洪山区']),
    ('xian', array['beilin', 'yanta', 'lianhu'], array['碑林区', '雁塔区', '莲湖区']),
    ('changsha', array['furong', 'tianxin', 'yuelu'], array['芙蓉区', '天心区', '岳麓区']),
    ('tianjin', array['heping', 'hexi', 'nankai'], array['和平区', '河西区', '南开区']),
    ('qingdao', array['shinan', 'shibei', 'laoshan'], array['市南区', '市北区', '崂山区']),
    ('xiamen', array['siming', 'huli', 'jimei'], array['思明区', '湖里区', '集美区']),
    ('fuzhou', array['gulou', 'taijiang', 'cangshan'], array['鼓楼区', '台江区', '仓山区']),
    ('ningbo', array['haishu', 'yinzhou', 'jiangbei'], array['海曙区', '鄞州区', '江北区']),
    ('zhengzhou', array['jinshui', 'erqi', 'zhongyuan'], array['金水区', '二七区', '中原区']),
    ('jinan', array['lixia', 'shizhong', 'huaiyin'], array['历下区', '市中区', '槐荫区']),
    ('shenyang', array['heping', 'shenhe', 'huanggu'], array['和平区', '沈河区', '皇姑区']),
    ('dalian', array['zhongshan', 'shahekou', 'ganjingzi'], array['中山区', '沙河口区', '甘井子区']),
    ('harbin', array['daoli', 'nangang', 'daowai'], array['道里区', '南岗区', '道外区']),
    ('kunming', array['wuhua', 'panlong', 'guandu'], array['五华区', '盘龙区', '官渡区']),
    ('guiyang', array['nanming', 'yunyan', 'guanshanhu'], array['南明区', '云岩区', '观山湖区']),
    ('nanning', array['qingxiu', 'xingning', 'jiangnan'], array['青秀区', '兴宁区', '江南区']),
    ('hefei', array['shushan', 'luyang', 'baohe'], array['蜀山区', '庐阳区', '包河区']),
    ('wuxi', array['liangxi', 'binhu', 'xinwu'], array['梁溪区', '滨湖区', '新吴区']),
    ('foshan', array['chancheng', 'nanhai', 'shunde'], array['禅城区', '南海区', '顺德区']),
    ('dongguan', array['dongcheng', 'nancheng', 'songshan_lake'], array['东城街道', '南城街道', '松山湖']),
    ('sanya', array['jiyang', 'tianya', 'haitang'], array['吉阳区', '天涯区', '海棠区'])
)
insert into public.city_regions (city_id, code, name, display_name, map_x, map_y)
select
  city.id,
  region.code,
  region.display_name,
  region.display_name,
  city.map_x + ((region.ordinality - 2) * 0.55),
  city.map_y + ((region.ordinality - 2) * 0.45)
from region_seed
join public.cities as city on city.code = region_seed.city_code
cross join lateral unnest(region_seed.region_codes, region_seed.region_names)
  with ordinality as region(code, display_name, ordinality)
on conflict (city_id, code) do update set
  name = excluded.name,
  display_name = excluded.display_name,
  map_x = excluded.map_x,
  map_y = excluded.map_y,
  active = true;

with city_templates (category, suffix, badge, description, image_url, sort_order) as (
  values
    ('coffee', '城市限定拿铁', '本地咖啡热度', '结合公开打卡热度每日更新的城市咖啡原型推荐。', 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=900&auto=format&fit=crop&q=80', 1),
    ('milk_tea', '茶香厚乳', '城市奶茶热度', '奶香与茶底平衡的城市厚乳原型推荐。', 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=900&auto=format&fit=crop&q=80', 2),
    ('tea', '冷泡原叶茶', '清爽茶饮', '适合记录城市漫游的冷泡原叶茶原型推荐。', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=900&auto=format&fit=crop&q=80', 3),
    ('fruit_tea', '当季鲜果茶', '当季果香', '按季节与公开打卡共同更新的鲜果茶原型推荐。', 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=900&auto=format&fit=crop&q=80', 4),
    ('matcha', '抹茶特调', '城市新口味', '为城市探索准备的抹茶特调原型推荐。', 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=900&auto=format&fit=crop&q=80', 5)
)
insert into public.seed_recommendations (
  kind, city_id, drink_name, brand_name, category, image_url, badge, description, sort_order
)
select
  'city',
  city.id,
  city.display_name || template.suffix,
  'SipNotes 城市精选',
  template.category,
  template.image_url,
  template.badge,
  template.description,
  template.sort_order
from public.cities as city
cross join city_templates as template
on conflict (city_id, drink_name, brand_name) where kind = 'city' do update set
  category = excluded.category,
  image_url = excluded.image_url,
  badge = excluded.badge,
  description = excluded.description,
  sort_order = excluded.sort_order,
  active = true;

insert into public.seed_recommendations (
  kind, season, drink_name, brand_name, category, image_url, badge, description, sort_order
)
values
  ('season', 'spring', '樱花冷萃', 'SipNotes 季节精选', 'coffee', 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=900&auto=format&fit=crop&q=80', '春日花香', '清亮冷萃搭配轻柔花香。', 1),
  ('season', 'spring', '青提茉莉茶', 'SipNotes 季节精选', 'fruit_tea', 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=900&auto=format&fit=crop&q=80', '鲜嫩果香', '青提与茉莉茶底带来春日清甜。', 2),
  ('season', 'spring', '龙井厚乳', 'SipNotes 季节精选', 'milk_tea', 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=900&auto=format&fit=crop&q=80', '新茶上市', '龙井茶香与厚乳平衡。', 3),
  ('season', 'spring', '莓果抹茶', 'SipNotes 季节精选', 'matcha', 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=900&auto=format&fit=crop&q=80', '红绿撞色', '莓果酸甜衬托抹茶回甘。', 4),
  ('season', 'spring', '桂花乌龙', 'SipNotes 季节精选', 'tea', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=900&auto=format&fit=crop&q=80', '轻花香', '低糖乌龙与桂花香气。', 5),
  ('season', 'spring', '柚子气泡茶', 'SipNotes 季节精选', 'fruit_tea', 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=900&auto=format&fit=crop&q=80', '气泡清爽', '柚子果香与茶感气泡。', 6),
  ('season', 'spring', '浅烘手冲', 'SipNotes 季节精选', 'pour_over', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&auto=format&fit=crop&q=80', '明亮酸质', '适合春日的花果调浅烘咖啡。', 7),
  ('season', 'spring', '白桃煎茶', 'SipNotes 季节精选', 'tea', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=900&auto=format&fit=crop&q=80', '白桃清甜', '煎茶鲜爽与白桃香气。', 8),
  ('season', 'summer', '爆柠四季春', 'SipNotes 季节精选', 'fruit_tea', 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=900&auto=format&fit=crop&q=80', '盛夏清爽', '柠檬酸香与四季春茶底。', 1),
  ('season', 'summer', '椰青冰美式', 'SipNotes 季节精选', 'coffee', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=900&auto=format&fit=crop&q=80', '海岛风味', '椰青清甜融合冰美式。', 2),
  ('season', 'summer', '西瓜茉莉冰茶', 'SipNotes 季节精选', 'fruit_tea', 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=900&auto=format&fit=crop&q=80', '冰镇瓜香', '西瓜与茉莉茶的低负担组合。', 3),
  ('season', 'summer', '冷泡高山乌龙', 'SipNotes 季节精选', 'tea', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=900&auto=format&fit=crop&q=80', '回甘清冽', '长时间冷泡释放清雅回甘。', 4),
  ('season', 'summer', '芒果抹茶冰沙', 'SipNotes 季节精选', 'matcha', 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=900&auto=format&fit=crop&q=80', '果香冰沙', '芒果甜香搭配微苦抹茶。', 5),
  ('season', 'summer', '冰滴耶加雪菲', 'SipNotes 季节精选', 'pour_over', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&auto=format&fit=crop&q=80', '柑橘花香', '慢速冰滴保留明亮花果调。', 6),
  ('season', 'summer', '薄荷青柠气泡茶', 'SipNotes 季节精选', 'fruit_tea', 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=900&auto=format&fit=crop&q=80', '清凉气泡', '薄荷与青柠带来直接清凉感。', 7),
  ('season', 'summer', '海盐奶盖绿茶', 'SipNotes 季节精选', 'milk_tea', 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=900&auto=format&fit=crop&q=80', '咸甜平衡', '轻海盐奶盖衬托绿茶鲜爽。', 8),
  ('season', 'autumn', '桂花酒酿奶茶', 'SipNotes 季节精选', 'milk_tea', 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=900&auto=format&fit=crop&q=80', '金秋桂香', '桂花与酒酿带来温润甜香。', 1),
  ('season', 'autumn', '板栗燕麦拿铁', 'SipNotes 季节精选', 'coffee', 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=900&auto=format&fit=crop&q=80', '坚果暖香', '板栗与燕麦奶形成绵密口感。', 2),
  ('season', 'autumn', '柿子乌龙', 'SipNotes 季节精选', 'fruit_tea', 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=900&auto=format&fit=crop&q=80', '成熟果甜', '柿子风味与乌龙茶香相接。', 3),
  ('season', 'autumn', '烤米玄米茶', 'SipNotes 季节精选', 'tea', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=900&auto=format&fit=crop&q=80', '谷物烘香', '玄米烘香适合转凉天气。', 4),
  ('season', 'autumn', '黑糖抹茶厚乳', 'SipNotes 季节精选', 'matcha', 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=900&auto=format&fit=crop&q=80', '浓郁回甘', '黑糖甜香包裹抹茶微苦。', 5),
  ('season', 'autumn', '深烘焦糖手冲', 'SipNotes 季节精选', 'pour_over', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&auto=format&fit=crop&q=80', '焦糖余韵', '偏深烘焙带来坚果与焦糖调。', 6),
  ('season', 'autumn', '无花果红茶', 'SipNotes 季节精选', 'fruit_tea', 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=900&auto=format&fit=crop&q=80', '柔和果香', '无花果甜感融合红茶。', 7),
  ('season', 'autumn', '南瓜香料拿铁', 'SipNotes 季节精选', 'coffee', 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=900&auto=format&fit=crop&q=80', '秋日香料', '南瓜与肉桂香料形成暖甜口感。', 8),
  ('season', 'winter', '黑糖波波鲜奶', 'SipNotes 季节精选', 'milk_tea', 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=900&auto=format&fit=crop&q=80', '冬日醇厚', '温热黑糖与鲜奶带来满足感。', 1),
  ('season', 'winter', '烤椰焦糖玛奇朵', 'SipNotes 季节精选', 'coffee', 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=900&auto=format&fit=crop&q=80', '烤椰暖香', '焦糖、浓缩与烤椰香气。', 2),
  ('season', 'winter', '热红茶苹果饮', 'SipNotes 季节精选', 'fruit_tea', 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=900&auto=format&fit=crop&q=80', '热果香', '苹果与红茶适合低温天气。', 3),
  ('season', 'winter', '姜汁厚乳茶', 'SipNotes 季节精选', 'milk_tea', 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=900&auto=format&fit=crop&q=80', '辛香回暖', '姜汁辛香平衡厚乳甜感。', 4),
  ('season', 'winter', '热抹茶巧克力', 'SipNotes 季节精选', 'matcha', 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=900&auto=format&fit=crop&q=80', '浓郁热饮', '抹茶与可可形成苦甜层次。', 5),
  ('season', 'winter', '肉桂橙香美式', 'SipNotes 季节精选', 'coffee', 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=900&auto=format&fit=crop&q=80', '柑橘香料', '橙皮与肉桂提升热美式香气。', 6),
  ('season', 'winter', '陈皮普洱', 'SipNotes 季节精选', 'tea', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=900&auto=format&fit=crop&q=80', '温润陈香', '陈皮与熟普形成温润回甘。', 7),
  ('season', 'winter', '榛果热拿铁', 'SipNotes 季节精选', 'coffee', 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=900&auto=format&fit=crop&q=80', '坚果奶香', '榛果香气搭配绵密热奶。', 8)
on conflict (season, drink_name, brand_name) where kind = 'season' do update set
  category = excluded.category,
  image_url = excluded.image_url,
  badge = excluded.badge,
  description = excluded.description,
  sort_order = excluded.sort_order,
  active = true;
