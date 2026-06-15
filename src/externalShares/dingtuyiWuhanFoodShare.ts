import type { FoodLayer, FoodPlace } from "../domain/types";

export const DINGTUYI_SHARE_ID = "698f48d2fd465207723e5aeb";
export const DINGTUYI_SHARE_URL = "https://map.dingtuyi.com/share/view?id=698f48d2fd465207723e5aeb";
export const DINGTUYI_SHARE_LAYER_ID = "external-dingtuyi-wuhan-food";

export interface DingtuyiShareMarker {
  id: string;
  name: string;
  address: string;
  longitude: number;
  latitude: number;
}

export const DINGTUYI_SHARE_LAYER: FoodLayer = {
  id: DINGTUYI_SHARE_LAYER_ID,
  name: "钉图易分享",
  color: "#7A5CDB",
  icon: "pin",
  visible: true,
  sortOrder: 6
};

export const DINGTUYI_WUHAN_FOOD_MARKERS: DingtuyiShareMarker[] = [
  {
    "id": "698f478c182b6cfaf33c26f5",
    "name": "罗山大肠汤",
    "address": "湖北省武汉市黄陂区盘龙城经济开发区小叔粥铺叶店商贸市场",
    "longitude": 114.263733,
    "latitude": 30.712912
  },
  {
    "id": "698f47511974442d9cd2fe58",
    "name": "混蛋厨房WELLDONE KITCHEN",
    "address": "湖北省武汉市汉阳区龙阳街道龙珠路湖北省广播电视学校",
    "longitude": 114.20778,
    "latitude": 30.547856
  },
  {
    "id": "698f4713fd465207723e2cb2",
    "name": "玫瑰烤房·美式熏肉自助",
    "address": "湖北省武汉市汉阳区琴断口街道玫瑰烤房·美式熏肉自助铁桥广场",
    "longitude": 114.226273,
    "latitude": 30.562266
  },
  {
    "id": "698f46cd182b6cfaf33bfaaf",
    "name": "张先生牛汤鲜面(香樟水岸店)",
    "address": "湖北省武汉市汉阳区琴断口街道香樟水岸",
    "longitude": 114.228016,
    "latitude": 30.563086
  },
  {
    "id": "698f469c182b6cfaf33bf00c",
    "name": "广州打边炉(枫桥苑店)",
    "address": "湖北省武汉市汉阳区江汉二桥街道枫桥苑",
    "longitude": 114.208698,
    "latitude": 30.570323
  },
  {
    "id": "698f4667182b6cfaf33bdf80",
    "name": "湘妹湖南菜馆(自力店)",
    "address": "湖北省武汉市汉阳区鹦鹉街道湖南菜馆(自力店)自力南苑",
    "longitude": 114.269429,
    "latitude": 30.5401
  },
  {
    "id": "698f46341974442d9cd2a8f2",
    "name": "恩施茶店牛肉(玫瑰苑南苑店)",
    "address": "湖北省武汉市汉阳区江汉二桥街道刘胖子家常菜玫瑰苑南苑",
    "longitude": 114.203577,
    "latitude": 30.565518
  },
  {
    "id": "698f4600182b6cfaf33bc235",
    "name": "九歌烧肉铺",
    "address": "湖北省武汉市东西湖区将军路街道美联·奥林匹克花园六期",
    "longitude": 114.238209,
    "latitude": 30.651926
  },
  {
    "id": "698f45c51974442d9cd283bb",
    "name": "通发餐厅",
    "address": "湖北省武汉市东西湖区吴家山街道田园街1194号梅苑小区",
    "longitude": 114.143413,
    "latitude": 30.620644
  },
  {
    "id": "698f45a21974442d9cd27850",
    "name": "老黄牛·桂林牛八宝酸辣牛肉火锅(汉正街店)",
    "address": "湖北省武汉市硚口区汉正街道宝善街71号",
    "longitude": 114.274631,
    "latitude": 30.570488
  },
  {
    "id": "698f4577be6e2bbdf1ac9dbf",
    "name": "荣记·泉州味道(汉西店)",
    "address": "湖北省武汉市硚口区韩家墩街道泉州面线糊(保利香槟店)保利香槟国际金座",
    "longitude": 114.222364,
    "latitude": 30.590043
  },
  {
    "id": "698f451bfd465207723de46c",
    "name": "马氏饺子真好吃(武胜路店)",
    "address": "湖北省武汉市硚口区荣华街道地质小区",
    "longitude": 114.26571,
    "latitude": 30.571395
  },
  {
    "id": "698f44f2be6e2bbdf1ac6ed9",
    "name": "叙雅小院",
    "address": "湖北省武汉市硚口区长丰街道宝路丰华名车奔驰宝马专修店天顺园十组团",
    "longitude": 114.213624,
    "latitude": 30.615305
  },
  {
    "id": "698f44b51974442d9cd22cd9",
    "name": "阿川佬海鲜楼(品牌广场店)",
    "address": "湖北省武汉市硚口区汉正街道全新社区汉正街品牌服饰批发广场",
    "longitude": 114.277159,
    "latitude": 30.569786
  },
  {
    "id": "698f4485fd465207723dd16a",
    "name": "浪打浪酒楼(新街店)",
    "address": "湖北省武汉市江汉区满春街道煦龙阁武汉奈尚精品公寓",
    "longitude": 114.28184,
    "latitude": 30.569593
  },
  {
    "id": "698f445dbe6e2bbdf1ac4220",
    "name": "黔味食府(汉正广场店)",
    "address": "湖北省武汉市硚口区汉正街道汉正街601号汉正广场",
    "longitude": 114.273498,
    "latitude": 30.565835
  },
  {
    "id": "698f442c182b6cfaf33b23bf",
    "name": "开心厨房(古词路)",
    "address": "湖北省武汉市硚口区古田街道红星新村",
    "longitude": 114.191266,
    "latitude": 30.589175
  },
  {
    "id": "698f43f9fd465207723dc35a",
    "name": "三桌半(欣城社区105小区店)",
    "address": "湖北省武汉市青山区冶金街道冶金105街坊物业小区欣城社区105小区",
    "longitude": 114.401092,
    "latitude": 30.621429
  },
  {
    "id": "698f43c8be6e2bbdf1ac0c45",
    "name": "金牛羊-特色菜(钢花新村店)",
    "address": "湖北省武汉市青山区钢花村街道钢花新村116街坊",
    "longitude": 114.384642,
    "latitude": 30.624093
  },
  {
    "id": "698f4380182b6cfaf33ae774",
    "name": "应城烧菜馆(清芬小区店)",
    "address": "湖北省武汉市江汉区满春街道清芬一路18号清芬社区",
    "longitude": 114.281878,
    "latitude": 30.572837
  },
  {
    "id": "698f434ffd465207723d953f",
    "name": "婆婆粉面馆(坤元里店)",
    "address": "湖北省武汉市江汉区民权街道坤元里小区",
    "longitude": 114.290505,
    "latitude": 30.575279
  },
  {
    "id": "698f430ebe6e2bbdf1abda5e",
    "name": "阿梅的牛",
    "address": "湖北省武汉市江岸区大智街道慈德里小区金业里小区",
    "longitude": 114.289612,
    "latitude": 30.583798
  },
  {
    "id": "698f4268be6e2bbdf1abab9c",
    "name": "热顶辣辣鸡 Hot Ding Chicken(武汉首店)",
    "address": "湖北省武汉市江汉区北湖街道妙三社区",
    "longitude": 114.265316,
    "latitude": 30.597328
  },
  {
    "id": "698f4222be6e2bbdf1ab9e13",
    "name": "钱妈自助快餐",
    "address": "湖北省武汉市江汉区常青街道沁园春新世纪都市花园新世纪都市花园沁园春",
    "longitude": 114.266619,
    "latitude": 30.604718
  },
  {
    "id": "698f41f11974442d9cd156b9",
    "name": "独一味油香",
    "address": "湖北省武汉市江汉区水塔街道长健里小区",
    "longitude": 114.287794,
    "latitude": 30.582229
  },
  {
    "id": "698f41bbfd465207723d5c53",
    "name": "对对对鲜食火锅",
    "address": "湖北省武汉市江汉区汉兴街道红光小区(新湾路)",
    "longitude": 114.248472,
    "latitude": 30.631748
  },
  {
    "id": "698f4171182b6cfaf33a39e5",
    "name": "复盛酒家(马场角横路店)",
    "address": "湖北省武汉市江汉区常青街道沁园春新世纪都市花园新世纪都市花园沁园春",
    "longitude": 114.266175,
    "latitude": 30.60511
  },
  {
    "id": "698f41431974442d9cd11d06",
    "name": "大禹家自助烤肉(马场角店)",
    "address": "湖北省武汉市江汉区常青街道沁园春新世纪都市花园新世纪都市花园上园",
    "longitude": 114.267007,
    "latitude": 30.604333
  },
  {
    "id": "698f41051974442d9cd111d5",
    "name": "蟠龙烤猪串",
    "address": "湖北省武汉市江汉区新华街道单洞社区(单洞三路)武汉国际大厦",
    "longitude": 114.280537,
    "latitude": 30.583937
  },
  {
    "id": "698f40a9be6e2bbdf1ab1f69",
    "name": "片片情(福星惠誉·福星城南区店)",
    "address": "湖北省武汉市江汉区汉兴街道片片情(福星惠誉·福星城南区店)福星惠誉·福星城南区",
    "longitude": 114.249497,
    "latitude": 30.619132
  },
  {
    "id": "698f4053fd465207723d1bb4",
    "name": "大姚螺蛳粉",
    "address": "湖北省武汉市江汉区常青街道复兴新村小区",
    "longitude": 114.244623,
    "latitude": 30.604207
  },
  {
    "id": "698f403bfd465207723d19b6",
    "name": "Fine Farm细耘农场餐厅",
    "address": "湖北省武汉市江汉区常青街道华发中城中央汇",
    "longitude": 114.258382,
    "latitude": 30.59915
  },
  {
    "id": "698f3feabe6e2bbdf1aae8b1",
    "name": "大头小食堂(新华小路店)",
    "address": "湖北省武汉市江汉区新华街道新华公寓中银大厦",
    "longitude": 114.271513,
    "latitude": 30.594118
  },
  {
    "id": "698f3fbb1974442d9cd0a38a",
    "name": "乐花园LeJardin法式主题餐厅(大武汉1911店)",
    "address": "湖北省武汉市江汉区常青街道乐花园LeJardin法式主题餐厅(大武汉1911店)大武汉1911",
    "longitude": 114.262777,
    "latitude": 30.615188
  },
  {
    "id": "698f3f91be6e2bbdf1aad004",
    "name": "恩施土家本味(卓刀泉店)",
    "address": "湖北省武汉市洪山区卓刀泉街道枫景佳园卓刀泉街高创家园社区",
    "longitude": 114.373537,
    "latitude": 30.508232
  },
  {
    "id": "698f3f1bbe6e2bbdf1aaad4f",
    "name": "拌粉侠",
    "address": "湖北省武汉市洪山区关山街道关山大道332附67号武汉东湖新技术开发区",
    "longitude": 114.409579,
    "latitude": 30.490759
  },
  {
    "id": "698f3eee1974442d9cd05902",
    "name": "SAVOR丝沃·法式酒馆餐厅",
    "address": "湖北省武汉市洪山区东湖风景区街道SAVOR丝沃法式小酒馆(华侨城店)纯水岸·东湖天屿一期",
    "longitude": 114.385191,
    "latitude": 30.58944
  },
  {
    "id": "698f3e5d182b6cfaf339376f",
    "name": "壹哆19元牛腩饭",
    "address": "湖北省武汉市洪山区和平街道冶建花园青洲花园",
    "longitude": 114.378885,
    "latitude": 30.614524
  },
  {
    "id": "698f3d2a1974442d9ccfc8a9",
    "name": "一派老火锅(武汉首店)",
    "address": "湖北省武汉市洪山区洪山街道武汉方泰医院",
    "longitude": 114.324256,
    "latitude": 30.509286
  },
  {
    "id": "698f3cfabe6e2bbdf1a53c20",
    "name": "丹丹私房菜馆(武南路店)",
    "address": "湖北省武汉市洪山区狮子山街道湖工小区湖北工业大学",
    "longitude": 114.307542,
    "latitude": 30.475108
  },
  {
    "id": "698f3cc6182b6cfaf3389c2e",
    "name": "牛盘山川味小炒",
    "address": "湖北省武汉市洪山区关山街道丽岛漫城光谷新世界汇贤邸",
    "longitude": 114.417874,
    "latitude": 30.493665
  },
  {
    "id": "698f3c91182b6cfaf3388ba2",
    "name": "西安肉夹馍(铁机路店)",
    "address": "湖北省武汉市洪山区梨园街道铁机路东沙花园南区",
    "longitude": 114.367229,
    "latitude": 30.585061
  },
  {
    "id": "698f3c5a1974442d9ccf7d42",
    "name": "越上PHO越南粉(武昌府店)",
    "address": "湖北省武汉市洪山区洪山街道蜜儿堂儿推健康管理中心(南湖武昌府店)武昌府二期",
    "longitude": 114.329507,
    "latitude": 30.501833
  },
  {
    "id": "698f3bfe1974442d9ccf6900",
    "name": "Casa Cocina墨西哥餐厅(世界城光谷步行街店)",
    "address": "湖北省武汉市洪山区关山街道光谷街意大利风情街",
    "longitude": 114.408181,
    "latitude": 30.502218
  },
  {
    "id": "698f3bcc182b6cfaf3385027",
    "name": "花花披萨",
    "address": "湖北省武汉市洪山区洪山街道蜜儿堂儿推健康管理中心(南湖武昌府店)武昌府二期",
    "longitude": 114.329482,
    "latitude": 30.501841
  },
  {
    "id": "698f3b75fd465207723c363e",
    "name": "玉疆饭店(曙光星城店)",
    "address": "湖北省武汉市洪山区关山街道G+电竞酒店曙光星城C区",
    "longitude": 114.402838,
    "latitude": 30.483619
  },
  {
    "id": "698f3b45182b6cfaf3381b90",
    "name": "瑶山老汤(广埠屯店)",
    "address": "湖北省武汉市洪山区珞南街道广埠屯地铁站H口武汉电脑城",
    "longitude": 114.364067,
    "latitude": 30.52299
  },
  {
    "id": "698f3b1fbe6e2bbdf1a4a149",
    "name": "LOQMA HANIYA & MASALA",
    "address": "湖北省武汉市洪山区洪山街道文荟街10号名士1号",
    "longitude": 114.342139,
    "latitude": 30.506685
  },
  {
    "id": "698f38be182b6cfaf33728bc",
    "name": "本味特色烤牛肉(武汉首店)",
    "address": "湖北省武汉市洪山区和平街道老巷子鱼头泡饭(徐东店)徐东馨苑",
    "longitude": 114.350655,
    "latitude": 30.593431
  },
  {
    "id": "698f3861182b6cfaf3371635",
    "name": "小牛满潮汕鲜牛肉粿条汤粉火锅",
    "address": "湖北省武汉市洪山区关山街道光谷APP广场居然之家(光谷店)",
    "longitude": 114.401594,
    "latitude": 30.481048
  },
  {
    "id": "698f3828be6e2bbdf1a3c534",
    "name": "谢妖幺千滋兔自贡盐帮菜(南湖店)",
    "address": "湖北省武汉市洪山区洪山街道谢妖幺千滋兔自贡盐帮菜(南湖中央广场店)南湖中央广场",
    "longitude": 114.324074,
    "latitude": 30.496771
  },
  {
    "id": "698f37ea1974442d9ccdee86",
    "name": "老七番茄鱼",
    "address": "湖北省武汉市洪山区东湖风景区街道四海烤鱼王家常菜(地大北街店)",
    "longitude": 114.402517,
    "latitude": 30.526454
  },
  {
    "id": "698f37b2182b6cfaf336f421",
    "name": "乡下人家常菜(虎泉街店)",
    "address": "湖北省武汉市洪山区卓刀泉街道项府酒店教师小区",
    "longitude": 114.371315,
    "latitude": 30.511751
  },
  {
    "id": "698f3783182b6cfaf336ecf8",
    "name": "左记港食·港式车仔面(光谷东总店)",
    "address": "湖北省武汉市洪山区九峰街道丽芮酒店(武汉光谷科技会展中心大悦城店)华翔中心",
    "longitude": 114.505624,
    "latitude": 30.488261
  },
  {
    "id": "698f374e182b6cfaf336d947",
    "name": "米雅餐厅(亿德·光谷先锋店)",
    "address": "湖北省武汉市洪山区关山街道东创仕佳桔子酒店(武汉光谷创业街店)",
    "longitude": 114.418685,
    "latitude": 30.500295
  },
  {
    "id": "698f370ffd465207723b7ea5",
    "name": "阿美泉州面线糊",
    "address": "湖北省武汉市洪山区关山街道加州阳光世界城瑜樾东方",
    "longitude": 114.405951,
    "latitude": 30.503551
  },
  {
    "id": "698f36dfbe6e2bbdf1a37173",
    "name": "老三烧得香",
    "address": "湖北省武汉市洪山区珞南街道老三烧得香武汉理工大学(马房山校区)",
    "longitude": 114.350573,
    "latitude": 30.520049
  },
  {
    "id": "698f367f1974442d9ccd99c3",
    "name": "陈记打边炉(沙羡街店)",
    "address": "湖北省武汉市江夏区纸坊街道沙羡街晨星幼儿园(沙羡街)",
    "longitude": 114.310567,
    "latitude": 30.354797
  },
  {
    "id": "698f3635fd465207723b5d79",
    "name": "阿帕新疆糕点",
    "address": "湖北省武汉市江夏区江夏区经济开发区大桥新区街道大花岭小区",
    "longitude": 114.311799,
    "latitude": 30.414166
  },
  {
    "id": "698f35c2be6e2bbdf1a31181",
    "name": "文焱赤壁牛杂(江夏店)",
    "address": "湖北省武汉市江夏区纸坊街道熊廷弼街134号",
    "longitude": 114.312306,
    "latitude": 30.35092
  },
  {
    "id": "698f34d6fd465207723b393b",
    "name": "遵义豆豉火锅(财大店)",
    "address": "湖北省武汉市江夏区关东街道中南财经政法大学政院小区",
    "longitude": 114.384543,
    "latitude": 30.477325
  },
  {
    "id": "698f3490182b6cfaf3363cfc",
    "name": "拾年手作糖水(南山纵横滨江时代店)",
    "address": "湖北省武汉市武昌区杨园街道船校村南山纵横滨江时代",
    "longitude": 114.347739,
    "latitude": 30.602059
  },
  {
    "id": "698f34571974442d9cccccaf",
    "name": "巴黎小厨",
    "address": "湖北省武汉市武昌区黄鹤楼街道花堤街39号武汉音乐学院解放路校区",
    "longitude": 114.292889,
    "latitude": 30.537266
  },
  {
    "id": "698f341ebe6e2bbdf1a294be",
    "name": "藕王甲鱼(武车小区店)",
    "address": "湖北省武汉市武昌区徐家棚街道武车体育场武车小区",
    "longitude": 114.330899,
    "latitude": 30.582598
  },
  {
    "id": "698f33e01974442d9ccca201",
    "name": "固始鹅块(张之洞路店)",
    "address": "湖北省武汉市武昌区紫阳街道紫阳街工程营社区星程酒店(武汉黄鹤楼首义路地铁站店)",
    "longitude": 114.308627,
    "latitude": 30.533362
  },
  {
    "id": "698f3398be6e2bbdf1a262e1",
    "name": "舒爽面包店(三角路店)",
    "address": "湖北省武汉市武昌区徐家棚街道赵家墩社区武昌区秦臻路社区武车养老院",
    "longitude": 114.326927,
    "latitude": 30.580814
  },
  {
    "id": "698f33671974442d9ccc7b1e",
    "name": "洋洋酒家(武珞路三巷店)",
    "address": "湖北省武汉市武昌区中南路街道武珞路三巷1号武珞路三巷小区停车场",
    "longitude": 114.322918,
    "latitude": 30.537532
  },
  {
    "id": "698f332fbe6e2bbdf1a253ec",
    "name": "乡聚源山东饺子馆(水果湖店)",
    "address": "湖北省武汉市武昌区水果湖街道中国国际旅行社(洪山路)湖北省人民政府",
    "longitude": 114.342961,
    "latitude": 30.545686
  },
  {
    "id": "698f32f9fd465207723af810",
    "name": "一味堂(丁字桥社区安国苑店)",
    "address": "湖北省武汉市武昌区中南路街道大禧称重·自选快餐(丁字桥社区安国苑店)丁字桥社区安国苑",
    "longitude": 114.333253,
    "latitude": 30.52831
  },
  {
    "id": "698f329bbe6e2bbdf1a2255a",
    "name": "海米小吃温州瘦肉丸福鼎肉片(中华路店)",
    "address": "湖北省武汉市武昌区中华路街道楚材社区楚材社区南区",
    "longitude": 114.301389,
    "latitude": 30.548709
  },
  {
    "id": "698f324bbe6e2bbdf1a21309",
    "name": "牛者烧肉·和牛专门店(江滩锦江店)",
    "address": "湖北省武汉市武昌区积玉桥街道锦坤公寓楼",
    "longitude": 114.306178,
    "latitude": 30.562668
  },
  {
    "id": "698f3200182b6cfaf33554db",
    "name": "和平川菜(湖北大学店)",
    "address": "湖北省武汉市武昌区徐家棚街道重北火锅喻家湖小区",
    "longitude": 114.327103,
    "latitude": 30.578466
  },
  {
    "id": "698f31c8fd465207723ac981",
    "name": "潮州大排档",
    "address": "湖北省武汉市武昌区黄鹤楼街道彭刘杨路78号武汉齐星城市旅馆",
    "longitude": 114.295196,
    "latitude": 30.542786
  },
  {
    "id": "698f317a1974442d9ccac49a",
    "name": "言记湛江鸡(安家湾店)",
    "address": "湖北省武汉市武昌区中南路街道华润置地公馆中南二路-道路停车位",
    "longitude": 114.326129,
    "latitude": 30.542958
  },
  {
    "id": "698f3065182b6cfaf334fb8d",
    "name": "领鲜海鲜超市(水岸星城B区店)",
    "address": "湖北省武汉市武昌区徐家棚街道福星惠誉·水岸星城(B区)水岸星城B区",
    "longitude": 114.345358,
    "latitude": 30.578248
  },
  {
    "id": "698f3034182b6cfaf334e687",
    "name": "思思酒店(烈士街店)",
    "address": "湖北省武汉市武昌区黄鹤楼街道紫阳·金利屋",
    "longitude": 114.302913,
    "latitude": 30.534952
  },
  {
    "id": "698f2f95be6e2bbdf1a15338",
    "name": "意式披萨意粉(武大校园店)",
    "address": "湖北省武汉市武昌区珞珈山街道重庆特色菜(武大店)",
    "longitude": 114.371936,
    "latitude": 30.531175
  },
  {
    "id": "698f2f4b182b6cfaf333679f",
    "name": "清真双宝红油牛系列",
    "address": "湖北省武汉市江岸区二七街道赵家条路86号金岛御璟世家1期",
    "longitude": 114.299979,
    "latitude": 30.623144
  },
  {
    "id": "698f2efa1974442d9cca32b2",
    "name": "Slow Fire 小火低温慢烤",
    "address": "湖北省武汉市江岸区二七街道东立国际",
    "longitude": 114.314974,
    "latitude": 30.625311
  },
  {
    "id": "698f2eb01974442d9cca121e",
    "name": "椒香川流不息川菜馆(二七北路店)",
    "address": "湖北省武汉市江岸区新村街道航务社区(一院)航务一院",
    "longitude": 114.317232,
    "latitude": 30.629807
  },
  {
    "id": "698f2e71182b6cfaf3333462",
    "name": "祥太牛系列(武汉天地店)",
    "address": "湖北省武汉市江岸区永清街道永清街吉林社区",
    "longitude": 114.309978,
    "latitude": 30.606062
  },
  {
    "id": "698f2d68be6e2bbdf1a0bcb3",
    "name": "凯捷东北量贩式烤肉",
    "address": "湖北省武汉市江岸区后湖街道黄大厨私房菜安居路-道路停车位",
    "longitude": 114.319419,
    "latitude": 30.653956
  },
  {
    "id": "698f2cf2182b6cfaf332de76",
    "name": "略地小馆IN YARD",
    "address": "湖北省武汉市江岸区车站街道先歌·新干线音响花园华新里",
    "longitude": 114.29706,
    "latitude": 30.589951
  },
  {
    "id": "698f2c66be6e2bbdf1a079ed",
    "name": "YiYi 餐厅(洞庭街店)",
    "address": "湖北省武汉市江岸区一元街道外滩洞庭首府平和坊历史文化街区",
    "longitude": 114.298754,
    "latitude": 30.582553
  },
  {
    "id": "698f2bab1974442d9cc96d6d",
    "name": "阿誠家燒面·東海海鮮",
    "address": "湖北省武汉市江岸区大智街道先锋里",
    "longitude": 114.291708,
    "latitude": 30.585637
  },
  {
    "id": "698f2b63182b6cfaf33289ef",
    "name": "小碗羊杂",
    "address": "湖北省武汉市江岸区新村街道憨娃热干面(发展大道)江岸区长春街第二小新村校区",
    "longitude": 114.314234,
    "latitude": 30.627405
  },
  {
    "id": "698f2b0f182b6cfaf3326d24",
    "name": "小张烧烤",
    "address": "湖北省武汉市江岸区后湖街道温馨路73号惠民居",
    "longitude": 114.312252,
    "latitude": 30.649511
  },
  {
    "id": "698f2aa5be6e2bbdf19fcf66",
    "name": "夜烧果酱串烧",
    "address": "湖北省武汉市江岸区塔子湖街道健美街29号越秀·星汇君泊三期",
    "longitude": 114.28076,
    "latitude": 30.650684
  },
  {
    "id": "698f2a6f182b6cfaf33235ae",
    "name": "小甲川酒家(武汉剧院店)",
    "address": "湖北省武汉市江岸区球场街道武汉剧院村武汉六中上智中学(黄石路校区)",
    "longitude": 114.288902,
    "latitude": 30.588592
  },
  {
    "id": "698f29fe182b6cfaf331f4b6",
    "name": "九叔公海南鸡饭",
    "address": "湖北省武汉市江岸区永清街道胜利街347附15号长航宿舍",
    "longitude": 114.309601,
    "latitude": 30.605488
  },
  {
    "id": "698f29b31974442d9cc7b436",
    "name": "齐天大肾烤吧(东方花都f区店)",
    "address": "湖北省武汉市江岸区后湖街道东方世家东方花都F区",
    "longitude": 114.298659,
    "latitude": 30.643167
  },
  {
    "id": "698f295d182b6cfaf331c054",
    "name": "辽K·东北烧烤",
    "address": "湖北省武汉市江岸区后湖街道童谣小提琴幸福时代·大家",
    "longitude": 114.324683,
    "latitude": 30.657115
  },
  {
    "id": "698f28ff1974442d9cc65927",
    "name": "大个子烧菜馆(武华住宅小区3区店)",
    "address": "湖北省武汉市江岸区花桥街道武华住宅小区(三区)武华住宅小区3区",
    "longitude": 114.280803,
    "latitude": 30.620219
  },
  {
    "id": "698f28721974442d9cc644e3",
    "name": "荣轩(武汉嘉佰汇店)",
    "address": "湖北省武汉市江岸区二七街道江码社区宸嘉100嘉佰道",
    "longitude": 114.321096,
    "latitude": 30.62107
  },
  {
    "id": "698f282dbe6e2bbdf19f2d35",
    "name": "夏记火煲砂锅(安静社区店)",
    "address": "湖北省武汉市江岸区球场街道安静社区(黄石路)安静社区北区",
    "longitude": 114.289448,
    "latitude": 30.58935
  },
  {
    "id": "698f27f11974442d9cc62bb8",
    "name": "椰礼·海南食铺(胜利街店)",
    "address": "湖北省武汉市江岸区一元街道胜利街209号同兴里",
    "longitude": 114.299869,
    "latitude": 30.588923
  },
  {
    "id": "698f27a8be6e2bbdf19f1767",
    "name": "陕西手擀面(工农兵路店)",
    "address": "湖北省武汉市江岸区二七街道东立国际",
    "longitude": 114.309204,
    "latitude": 30.622856
  },
  {
    "id": "698f26a5be6e2bbdf19ee5a5",
    "name": "Jeune faim烊饭·法餐小馆",
    "address": "湖北省武汉市江岸区一元街道佬表煨汤馆(洞庭街)江汉村",
    "longitude": 114.296347,
    "latitude": 30.578544
  },
  {
    "id": "698f2657be6e2bbdf19edbed",
    "name": "全胜东北烧烤(大智嘉园店)",
    "address": "湖北省武汉市江岸区大智街道乐居大智嘉园I区",
    "longitude": 114.294288,
    "latitude": 30.591004
  },
  {
    "id": "698f17b8fd4652077237080d",
    "name": "楠记狮头鹅(后湖大道地铁站店)",
    "address": "湖北省武汉市江岸区后湖街道建设大道1641号同安家园",
    "longitude": 114.303857,
    "latitude": 30.651033
  },
  {
    "id": "698f1793fd4652077237037c",
    "name": "卤有果台式小馆",
    "address": "湖北省武汉市江岸区西马街道国信城招银苑",
    "longitude": 114.28626,
    "latitude": 30.594592
  },
  {
    "id": "698f174fbe6e2bbdf199eebd",
    "name": "三怪牛肉炒饭",
    "address": "湖北省武汉市江岸区后湖街道顺记三怪牛肉炒饭幸福时代南区",
    "longitude": 114.314747,
    "latitude": 30.655823
  },
  {
    "id": "698f1720fd4652077236ec11",
    "name": "捌陆汉舍",
    "address": "湖北省武汉市江岸区后湖街道新地·东方花都新地·东方花都B区",
    "longitude": 114.294948,
    "latitude": 30.63733
  },
  {
    "id": "698f16d31974442d9cc07e52",
    "name": "懒厨小馆",
    "address": "湖北省武汉市江岸区四唯街道六合社区六合小区",
    "longitude": 114.30825,
    "latitude": 30.603162
  },
  {
    "id": "698f169a182b6cfaf32cd288",
    "name": "LA CASITA 卡希塔餐厅",
    "address": "湖北省武汉市江岸区永清街道苗姑酒堂仁义社区",
    "longitude": 114.30571,
    "latitude": 30.605626
  },
  {
    "id": "698f16451974442d9cc05a7c",
    "name": "杜宾汉堡手推车",
    "address": "湖北省武汉市江岸区后湖街道后湖大道地铁站G口汉口城市广场",
    "longitude": 114.30622,
    "latitude": 30.651205
  },
  {
    "id": "698f10cb182b6cfaf32aeeeb",
    "name": "杰哥栋企烧鸡(百步亭店)",
    "address": "湖北省武汉市江岸区后湖街道杰哥栋企鸡(百步亭店)丹水嘉苑",
    "longitude": 114.323721,
    "latitude": 30.647778
  },
  {
    "id": "698f10ae182b6cfaf32ae8e4",
    "name": "云味轩",
    "address": "湖北省武汉市江岸区新村街道二七横路二七横路-道路停车位",
    "longitude": 114.316808,
    "latitude": 30.627863
  },
  {
    "id": "698f106f182b6cfaf32adb59",
    "name": "怒海手抓羊肉烧烤(11分店)",
    "address": "湖北省武汉市江岸区球场街道云宏大厦",
    "longitude": 114.298807,
    "latitude": 30.598557
  },
  {
    "id": "698f1039fd4652077235e3f8",
    "name": "Hulu呼噜肉店",
    "address": "湖北省武汉市江岸区永清街道继红菜馆永清小区",
    "longitude": 114.309074,
    "latitude": 30.611486
  },
  {
    "id": "698f1014be6e2bbdf197b8c0",
    "name": "洪兴饭店(云林街店)",
    "address": "湖北省武汉市江岸区台北街道合美社区(一区)长发小康苑",
    "longitude": 114.278286,
    "latitude": 30.593648
  },
  {
    "id": "698f0fefbe6e2bbdf197b20a",
    "name": "蓝瑾牛牛家(台北店)",
    "address": "湖北省武汉市江岸区台北街道和美社区台北路97-101号小区",
    "longitude": 114.282005,
    "latitude": 30.595379
  },
  {
    "id": "698f0fc7be6e2bbdf197a82d",
    "name": "粤德兴正宗港式牛腩",
    "address": "湖北省武汉市江岸区一元街道时代广场巴公房子",
    "longitude": 114.3001,
    "latitude": 30.58591
  },
  {
    "id": "698f0f8f182b6cfaf32a94b3",
    "name": "艾师傅",
    "address": "湖北省武汉市江岸区丹水池街道艾师傅馆田园二村",
    "longitude": 114.342467,
    "latitude": 30.659699
  },
  {
    "id": "698f0db3182b6cfaf329ffb7",
    "name": "林燕香颂咖啡店",
    "address": "湖北省武汉市江岸区台北街道长发小康苑",
    "longitude": 114.279039,
    "latitude": 30.593351
  },
  {
    "id": "698f0c7afd4652077235596e",
    "name": "Jungle犟狗美式餐厅",
    "address": "湖北省武汉市江岸区台北街道台南社区(台颐公寓南)",
    "longitude": 114.278788,
    "latitude": 30.592695
  },
  {
    "id": "698f0bf11974442d9cbd569b",
    "name": "木萨私房菜",
    "address": "湖北省武汉市江岸区西马街道高雄路武汉市六中致诚中学",
    "longitude": 114.286948,
    "latitude": 30.594151
  },
  {
    "id": "698f0bbffd46520772353168",
    "name": "浩克肉铺",
    "address": "湖北省武汉市江岸区永清街道沈阳路1附4号日本居留民团办事处旧址",
    "longitude": 114.30891,
    "latitude": 30.603686
  },
  {
    "id": "698f0a1a1974442d9cbcc41f",
    "name": "哈尔滨家常菜",
    "address": "湖北省武汉市江岸区后湖街道百步亭路50附18号丹水嘉苑",
    "longitude": 114.323757,
    "latitude": 30.647719
  },
  {
    "id": "698f08e31974442d9cbc5868",
    "name": "越南美食",
    "address": "湖北省武汉市江岸区球场街道安静社区(解放大道)安静社区红艳村",
    "longitude": 114.285757,
    "latitude": 30.586517
  }
];

export function dingtuyiMarkerToMapPlace(marker: DingtuyiShareMarker): FoodPlace {
  const tags = Array.from(new Set([
    "钉图易分享",
    "武汉店家",
    ...inferFoodTags(marker.name),
    ...inferDistrictTags(marker.address)
  ]));
  return {
    id: dingtuyiMapId(marker.id),
    name: marker.name,
    longitude: marker.longitude,
    latitude: marker.latitude,
    coordinateSystem: "gcj02",
    address: marker.address,
    city: "武汉",
    layerId: DINGTUYI_SHARE_LAYER_ID,
    tags,
    rating: 4,
    visitedAt: "2026-02-13",
    notes: [
      "来源：钉图易公开分享图层",
      `原始分享 ID：${DINGTUYI_SHARE_ID}`,
      "坐标说明：来自钉图易分享页点位，按高德/GCJ02 坐标上图；未并入个人收藏，确认后可再收藏。",
      `来源链接：${DINGTUYI_SHARE_URL}`
    ].join("\n"),
    photoIds: [],
    createdAt: "2026-02-13T23:52:00.000+08:00",
    updatedAt: "2026-02-13T23:52:00.000+08:00",
    mapAccuracy: "exact"
  };
}

export function dingtuyiMapId(sourceId: string): string {
  return `dingtuyi-share:${sourceId}`;
}

export function sourceIdFromDingtuyiMapId(id: string): string | undefined {
  return id.startsWith("dingtuyi-share:") ? id.slice("dingtuyi-share:".length) : undefined;
}

function inferDistrictTags(address: string): string[] {
  const districts = ["江岸区", "江汉区", "硚口区", "汉阳区", "武昌区", "青山区", "洪山区", "东西湖区", "黄陂区", "江夏区"];
  return districts.filter((district) => address.includes(district));
}

function inferFoodTags(name: string): string[] {
  const rules: Array<[RegExp, string]> = [
    [/咖啡|Coffee|CAFE|Cafe/i, "咖啡"],
    [/烧烤|烤肉|烤吧|串|熏肉|烧肉/i, "烧烤"],
    [/火锅|打边炉|牛杂|牛肉火锅/i, "火锅"],
    [/牛肉|牛腩|牛汤|牛系列|牛八宝/i, "牛肉"],
    [/面|粉|螺蛳粉|越南粉|面线糊|肉夹馍|瘦肉丸|福鼎肉片/i, "粉面"],
    [/饺子|小吃|糖水|糕点|面包|披萨|汉堡/i, "小吃"],
    [/海鲜|湛江鸡|海南鸡|鹅|羊|猪|兔|甲鱼/i, "肉食"],
    [/湘|湖南/i, "湘菜"],
    [/川|自贡|辣/i, "川菜"],
    [/法式|法餐|西班牙|墨西哥|意式|西餐|餐厅/i, "西餐"],
    [/东北|哈尔滨/i, "东北菜"],
    [/家常菜|私房菜|烧菜|酒楼|酒家|食府|餐厅|饭店|菜馆/i, "正餐"]
  ];
  return rules.filter(([pattern]) => pattern.test(name)).map(([, tag]) => tag);
}
