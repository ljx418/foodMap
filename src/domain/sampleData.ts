import type { FoodLayer } from "./types";

export const DEFAULT_LAYERS: FoodLayer[] = [
  { id: "layer-must-eat", name: "必吃餐厅", icon: "star", color: "#C76A32", visible: true, sortOrder: 10 },
  { id: "layer-cafe", name: "咖啡馆", icon: "coffee", color: "#8A5A3B", visible: true, sortOrder: 20 },
  { id: "layer-snack", name: "小吃快餐", icon: "bowl", color: "#6F7F47", visible: true, sortOrder: 30 },
  { id: "layer-dessert", name: "甜品饮品", icon: "heart", color: "#D98A7A", visible: true, sortOrder: 40 },
  { id: "layer-wishlist", name: "想去清单", icon: "pin", color: "#8C7AA9", visible: true, sortOrder: 50 }
];

export const SAMPLE_TAGS = ["早餐", "午餐", "晚餐", "甜品", "咖啡", "朋友聚餐", "旅行", "性价比"];
