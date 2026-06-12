// ============================================================
// category.service.ts — 产业类型字典服务
//   硬编码常见物流相关产业分类，支持 loadTreeData + loadDictItem
//   后期可替换为数据库 / 远程字典
// ============================================================

import { Injectable } from '@nestjs/common';

export interface CategoryNode {
  key: string;
  value: string;
  title: string;
  isLeaf?: boolean;
  children?: CategoryNode[];
}

const CATEGORY_TREE: CategoryNode[] = [
  {
    key: 'manufacturing',
    value: 'manufacturing',
    title: '制造业',
    children: [
      { key: 'manufacturing.electronics', value: 'manufacturing.electronics', title: '电子制造', isLeaf: true },
      { key: 'manufacturing.machinery', value: 'manufacturing.machinery', title: '机械制造', isLeaf: true },
      { key: 'manufacturing.food', value: 'manufacturing.food', title: '食品加工', isLeaf: true },
      { key: 'manufacturing.textile', value: 'manufacturing.textile', title: '纺织服装', isLeaf: true },
      { key: 'manufacturing.chemical', value: 'manufacturing.chemical', title: '化工', isLeaf: true },
      { key: 'manufacturing.building_materials', value: 'manufacturing.building_materials', title: '建材', isLeaf: true },
      { key: 'manufacturing.auto_parts', value: 'manufacturing.auto_parts', title: '汽车零部件', isLeaf: true },
    ],
  },
  {
    key: 'trade',
    value: 'trade',
    title: '商贸流通',
    children: [
      { key: 'trade.wholesale', value: 'trade.wholesale', title: '批发', isLeaf: true },
      { key: 'trade.retail', value: 'trade.retail', title: '零售', isLeaf: true },
      { key: 'trade.e_commerce', value: 'trade.e_commerce', title: '电商', isLeaf: true },
      { key: 'trade.cross_border', value: 'trade.cross_border', title: '跨境贸易', isLeaf: true },
    ],
  },
  {
    key: 'agriculture',
    value: 'agriculture',
    title: '农林牧渔',
    children: [
      { key: 'agriculture.planting', value: 'agriculture.planting', title: '种植业', isLeaf: true },
      { key: 'agriculture.breeding', value: 'agriculture.breeding', title: '养殖业', isLeaf: true },
      { key: 'agriculture.fishing', value: 'agriculture.fishing', title: '渔业', isLeaf: true },
    ],
  },
  {
    key: 'logistics',
    value: 'logistics',
    title: '物流仓储',
    children: [
      { key: 'logistics.express', value: 'logistics.express', title: '快递', isLeaf: true },
      { key: 'logistics.freight', value: 'logistics.freight', title: '货运', isLeaf: true },
      { key: 'logistics.warehousing', value: 'logistics.warehousing', title: '仓储', isLeaf: true },
      { key: 'logistics.cold_chain', value: 'logistics.cold_chain', title: '冷链', isLeaf: true },
    ],
  },
  {
    key: 'other',
    value: 'other',
    title: '其他',
    children: [
      { key: 'other.construction', value: 'other.construction', title: '建筑', isLeaf: true },
      { key: 'other.medical', value: 'other.medical', title: '医疗', isLeaf: true },
      { key: 'other.education', value: 'other.education', title: '教育', isLeaf: true },
      { key: 'other.real_estate', value: 'other.real_estate', title: '房地产', isLeaf: true },
    ],
  },
];

@Injectable()
export class CategoryService {
  private flatMap = new Map<string, string>();

  constructor() {
    this.buildFlatMap(CATEGORY_TREE);
  }

  loadTreeData(pcode?: string): CategoryNode[] {
    if (!pcode) return CATEGORY_TREE;
    const node = this.findNode(CATEGORY_TREE, pcode);
    return node?.children || [];
  }

  loadDictItem(ids: string): string[] {
    return ids.split(',').map((k) => this.flatMap.get(k.trim()) || k);
  }

  private buildFlatMap(nodes: CategoryNode[]) {
    for (const n of nodes) {
      this.flatMap.set(n.key, n.title);
      if (n.children) this.buildFlatMap(n.children);
    }
  }

  private findNode(nodes: CategoryNode[], key: string): CategoryNode | null {
    for (const n of nodes) {
      if (n.key === key) return n;
      if (n.children) {
        const found = this.findNode(n.children, key);
        if (found) return found;
      }
    }
    return null;
  }
}
