import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * 弹幕数据基础接口
 *
 * 职责：定义弹幕项的基本数据结构
 */
interface DanmakuItemBase {
  id: string;
  message: string;
}

/**
 * 弹幕类型枚举
 *
 * 职责：定义支持的弹幕类型
 */
export type DanmakuVariant = "flower" | "candle" | "bottle";

/**
 * 弹幕显示模式
 *
 * 职责：定义弹幕的显示模式
 */
export type DanmakuMode = "inline" | "fullscreen";

/**
 * 弹幕速度类型
 *
 * 职责：定义弹幕滚动速度选项
 */
export type DanmakuSpeed = "slow" | "normal" | "fast";

/**
 * 弹幕组件属性接口
 *
 * 职责：定义Danmaku组件的输入属性
 */
interface DanmakuProps<T extends DanmakuItemBase> {
  items: T[];
  variant?: DanmakuVariant;
  speed?: DanmakuSpeed;
  maxItems?: number;
  mode?: DanmakuMode;
}

/**
 * 内部可见弹幕项结构
 *
 * 职责：存储弹幕的显示状态和动画参数
 */
interface VisibleDanmakuItem {
  id: string;
  message: string;
  top: number;
  duration: number;
  delay: number;
  variant: DanmakuVariant;
}

/**
 * 获取弹幕类型对应的图标
 *
 * 职责：根据弹幕类型返回对应的emoji图标
 *
 * @param variant - 弹幕类型
 * @returns 对应的emoji图标
 */
function getDanmakuIcon(variant: DanmakuVariant): string {
  switch (variant) {
    case "flower":
      return "🌸";
    case "candle":
      return "🕯️";
    case "bottle":
      return "🍾";
    default:
      return "💫";
  }
}

/**
 * 获取弹幕类型对应的样式类名
 *
 * 职责：根据弹幕类型和主题返回对应的样式类
 *
 * @param variant - 弹幕类型
 * @param mode - 显示模式
 * @returns 样式类名字符串
 */
function getVariantClasses(variant: DanmakuVariant, mode: DanmakuMode): string {
  if (mode === "fullscreen") {
    switch (variant) {
      case "flower":
        return "bg-pink-500/20 text-pink-100 border-pink-400/30 backdrop-blur-sm";
      case "candle":
        return "bg-amber-500/20 text-amber-100 border-amber-400/30 backdrop-blur-sm";
      case "bottle":
        return "bg-cyan-500/20 text-cyan-100 border-cyan-400/30 backdrop-blur-sm";
      default:
        return "bg-white/10 text-white border-white/20 backdrop-blur-sm";
    }
  }

  switch (variant) {
    case "candle":
      return "text-gold-700 bg-gold-50/80 border-gold-200/60";
    case "bottle":
      return "text-cyan-700 bg-cyan-50/80 border-cyan-200/60";
    case "flower":
    default:
      return "text-memorial-700 bg-cream-50/80 border-memorial-200/60";
  }
}

/**
 * 根据速度类型获取动画时长范围
 *
 * 职责：将速度类型转换为具体的动画秒数范围
 *
 * @param speed - 速度类型
 * @param mode - 显示模式
 * @returns 动画时长范围 [最小值, 最大值]
 */
function getSpeedDuration(speed: DanmakuSpeed, mode: DanmakuMode): [number, number] {
  const multiplier = mode === "fullscreen" ? 1.5 : 1;
  switch (speed) {
    case "fast":
      return [6 * multiplier, 10 * multiplier];
    case "normal":
      return [10 * multiplier, 15 * multiplier];
    case "slow":
    default:
      return [14 * multiplier, 22 * multiplier];
  }
}

/**
 * 弹幕组件
 *
 * 职责：
 * 1. 管理弹幕的显示状态和动画
 * 2. 支持内嵌模式和全屏模式
 * 3. 支持多种弹幕类型（鲜花、蜡烛、漂流瓶）
 * 4. 随机生成弹幕位置和动画参数
 *
 * @template T - 弹幕数据类型，必须包含id和message字段
 */
export default function Danmaku<T extends DanmakuItemBase>({
  items,
  variant = "flower",
  speed = "slow",
  maxItems = 5,
  mode = "inline",
}: DanmakuProps<T>) {
  const [visibleItems, setVisibleItems] = useState<VisibleDanmakuItem[]>([]);

  /**
   * 过滤有效消息（非空）
   *
   * 职责：只保留有内容的消息，避免空弹幕
   */
  const messagesWithText = useMemo(
    () => items.filter((item) => item.message && item.message.trim().length > 0),
    [items]
  );

  /**
   * 生成弹幕效果
   *
   * 职责：
   * 1. 随机选择弹幕项
   * 2. 为每个弹幕生成随机的垂直位置、动画时长和延迟
   * 3. 更新可见弹幕列表
   */
  useEffect(() => {
    if (messagesWithText.length === 0) {
      setVisibleItems([]);
      return;
    }

    const generateDanmaku = () => {
      const count = Math.min(maxItems, messagesWithText.length);
      const selected: VisibleDanmakuItem[] = [];
      const usedIndices = new Set<number>();

      const [minDuration, maxDuration] = getSpeedDuration(speed, mode);

      for (let i = 0; i < count; i++) {
        let idx: number;
        do {
          idx = Math.floor(Math.random() * messagesWithText.length);
        } while (usedIndices.has(idx) && usedIndices.size < messagesWithText.length);
        usedIndices.add(idx);

        const item = messagesWithText[idx];
        const top = mode === "fullscreen" ? 5 + Math.random() * 85 : 10 + Math.random() * 70;
        const duration = minDuration + Math.random() * (maxDuration - minDuration);
        const delay = Math.random() * 5;

        selected.push({
          id: `${item.id}-${Date.now()}-${i}`,
          message: item.message,
          top,
          duration,
          delay,
          variant,
        });
      }

      setVisibleItems(selected);
    };

    generateDanmaku();

    const intervalTime = mode === "fullscreen" ? 8000 : 12000;
    const interval = setInterval(generateDanmaku, intervalTime);

    return () => clearInterval(interval);
  }, [messagesWithText, speed, maxItems, mode, variant]);

  if (messagesWithText.length === 0) {
    return null;
  }

  const containerClasses = cn(
    "pointer-events-none overflow-hidden",
    mode === "fullscreen"
      ? "fixed inset-0 z-50"
      : "absolute inset-0"
  );

  const itemSizeClasses = mode === "fullscreen"
    ? "px-4 py-2 rounded-full text-sm border"
    : "px-3 py-1.5 rounded-full text-xs border";

  return (
    <div className={containerClasses}>
      {visibleItems.map((item) => (
        <div
          key={item.id}
          className={cn(
            "absolute whitespace-nowrap danmaku-item",
            itemSizeClasses,
            getVariantClasses(item.variant, mode)
          )}
          style={{
            top: `${item.top}%`,
            right: 0,
            animation: `danmakuScroll ${item.duration}s linear ${item.delay}s forwards`,
            opacity: 0,
            maxWidth: mode === "fullscreen" ? "60%" : "70%",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <span className="mr-1.5">{getDanmakuIcon(item.variant)}</span>
          {item.message}
        </div>
      ))}

      <style>{`
        @keyframes danmakuScroll {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          5% {
            opacity: 0.9;
          }
          90% {
            opacity: 0.9;
          }
          100% {
            transform: translateX(calc(-100vw - 100%));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
