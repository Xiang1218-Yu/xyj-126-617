import { useState, useCallback, useMemo } from "react";
import type { Flower, Candle, DriftBottle } from "@/types";
import type { DanmakuItemBase, DanmakuVariant, DanmakuSpeed } from "@/components/Danmaku";

/**
 * 全屏弹幕管理Hook
 *
 * 功能职责：
 * 1. 管理全屏弹幕的开启/关闭状态
 * 2. 管理弹幕显示类型（鲜花/蜡烛/漂流瓶）
 * 3. 管理弹幕速度
 * 4. 将不同类型的数据统一转换为弹幕格式
 *
 * 设计原则：单一职责 - 只负责弹幕状态管理和数据转换，不涉及UI渲染
 */

/** 弹幕类型配置 */
export interface DanmakuTypeConfig {
  /** 是否显示鲜花弹幕 */
  flower: boolean;
  /** 是否显示蜡烛弹幕 */
  candle: boolean;
  /** 是否显示漂流瓶弹幕 */
  bottle: boolean;
}

/** 统一的弹幕数据项（适配Danmaku组件） */
export interface UnifiedDanmakuItem extends DanmakuItemBase {
  /** 弹幕类型 */
  variant: DanmakuVariant;
  /** 来源名称（如"来自张三的纪念页"） */
  sourceName?: string;
}

/** Hook返回值接口 */
export interface UseFullscreenDanmakuReturn {
  /** 全屏弹幕是否开启 */
  isFullscreen: boolean;
  /** 开启全屏弹幕 */
  openFullscreen: () => void;
  /** 关闭全屏弹幕 */
  closeFullscreen: () => void;
  /** 切换全屏弹幕状态 */
  toggleFullscreen: () => void;
  /** 弹幕类型配置 */
  typeConfig: DanmakuTypeConfig;
  /** 设置弹幕类型配置 */
  setTypeConfig: (config: DanmakuTypeConfig) => void;
  /** 切换某类弹幕的显示状态 */
  toggleDanmakuType: (type: keyof DanmakuTypeConfig) => void;
  /** 弹幕速度 */
  speed: DanmakuSpeed;
  /** 设置弹幕速度 */
  setSpeed: (speed: DanmakuSpeed) => void;
  /** 统一处理后的弹幕数据 */
  danmakuItems: UnifiedDanmakuItem[];
  /** 每种类型的弹幕数据（用于分组显示） */
  danmakuByType: Record<DanmakuVariant, UnifiedDanmakuItem[]>;
}

/**
 * 将鲜花数据转换为弹幕格式
 *
 * @param flowers - 鲜花数据列表
 * @returns 格式化后的弹幕项列表
 */
function flowersToDanmaku(flowers: Flower[]): UnifiedDanmakuItem[] {
  return flowers
    .filter((f) => f.message && f.message.trim().length > 0)
    .map((flower) => ({
      id: `flower-${flower.id}`,
      message: flower.message,
      variant: "flower" as DanmakuVariant,
      sourceName: "敬献鲜花",
    }));
}

/**
 * 将蜡烛数据转换为弹幕格式
 *
 * @param candles - 蜡烛数据列表
 * @returns 格式化后的弹幕项列表
 */
function candlesToDanmaku(candles: Candle[]): UnifiedDanmakuItem[] {
  return candles
    .filter((c) => c.message && c.message.trim().length > 0)
    .map((candle) => ({
      id: `candle-${candle.id}`,
      message: candle.message,
      variant: "candle" as DanmakuVariant,
      sourceName: candle.name || "点燃心灯",
    }));
}

/**
 * 将漂流瓶数据转换为弹幕格式
 *
 * @param bottles - 漂流瓶数据列表
 * @returns 格式化后的弹幕项列表
 */
function bottlesToDanmaku(bottles: DriftBottle[]): UnifiedDanmakuItem[] {
  return bottles
    .filter((b) => b.content && b.content.trim().length > 0)
    .map((bottle) => ({
      id: `bottle-${bottle.id}`,
      message: bottle.content,
      variant: "bottle" as DanmakuVariant,
      sourceName: `来自「${bottle.fromMemorialName}」`,
    }));
}

/**
 * 全屏弹幕管理Hook
 *
 * @param flowers - 鲜花数据
 * @param candles - 蜡烛数据
 * @param bottles - 漂流瓶数据
 * @returns 弹幕状态和操作方法
 */
export function useFullscreenDanmaku(
  flowers: Flower[],
  candles: Candle[],
  bottles: DriftBottle[]
): UseFullscreenDanmakuReturn {
  /** 全屏弹幕开关状态 */
  const [isFullscreen, setIsFullscreen] = useState(false);

  /** 弹幕类型配置（默认全部开启） */
  const [typeConfig, setTypeConfig] = useState<DanmakuTypeConfig>({
    flower: true,
    candle: true,
    bottle: true,
  });

  /** 弹幕速度 */
  const [speed, setSpeed] = useState<DanmakuSpeed>("slow");

  /**
   * 开启全屏弹幕
   */
  const openFullscreen = useCallback(() => {
    setIsFullscreen(true);
    // 禁止页面滚动
    document.body.style.overflow = "hidden";
  }, []);

  /**
   * 关闭全屏弹幕
   */
  const closeFullscreen = useCallback(() => {
    setIsFullscreen(false);
    // 恢复页面滚动
    document.body.style.overflow = "";
  }, []);

  /**
   * 切换全屏弹幕状态
   */
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      const next = !prev;
      document.body.style.overflow = next ? "hidden" : "";
      return next;
    });
  }, []);

  /**
   * 切换某类弹幕的显示状态
   *
   * @param type - 弹幕类型
   */
  const toggleDanmakuType = useCallback((type: keyof DanmakuTypeConfig) => {
    setTypeConfig((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  }, []);

  /**
   * 按类型分组的弹幕数据
   *
   * 使用useMemo缓存计算结果，只有当数据或配置变化时才重新计算
   */
  const danmakuByType = useMemo(() => {
    const flowerItems = typeConfig.flower ? flowersToDanmaku(flowers) : [];
    const candleItems = typeConfig.candle ? candlesToDanmaku(candles) : [];
    const bottleItems = typeConfig.bottle ? bottlesToDanmaku(bottles) : [];

    return {
      flower: flowerItems,
      candle: candleItems,
      bottle: bottleItems,
    };
  }, [flowers, candles, bottles, typeConfig]);

  /**
   * 合并所有类型的弹幕数据
   */
  const danmakuItems = useMemo(() => {
    return [
      ...danmakuByType.flower,
      ...danmakuByType.candle,
      ...danmakuByType.bottle,
    ];
  }, [danmakuByType]);

  return {
    isFullscreen,
    openFullscreen,
    closeFullscreen,
    toggleFullscreen,
    typeConfig,
    setTypeConfig,
    toggleDanmakuType,
    speed,
    setSpeed,
    danmakuItems,
    danmakuByType,
  };
}
