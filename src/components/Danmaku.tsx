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
  createdAt: number;
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
 * 5. 流式生成弹幕，确保从右到左完整滚动
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
   * 流式生成弹幕
   *
   * 职责：
   * 1. 每隔一段时间添加一条新弹幕
   * 2. 清理已经完成动画的弹幕
   * 3. 保持弹幕数量在 maxItems 以内
   */
  useEffect(() => {
    if (messagesWithText.length === 0) {
      setVisibleItems([]);
      return;
    }

    const [minDuration, maxDuration] = getSpeedDuration(speed, mode);
    const spawnInterval = Math.max((minDuration * 1000) / maxItems, 2000);

    /**
     * 生成单条弹幕
     *
     * 职责：随机选择一条消息，生成随机的垂直位置和动画时长
     *
     * @returns 生成的弹幕项
     */
    const createDanmakuItem = (): VisibleDanmakuItem | null => {
      if (messagesWithText.length === 0) return null;

      const randomIdx = Math.floor(Math.random() * messagesWithText.length);
      const item = messagesWithText[randomIdx];
      const top = mode === "fullscreen" ? 5 + Math.random() * 85 : 10 + Math.random() * 70;
      const duration = minDuration + Math.random() * (maxDuration - minDuration);
      const now = Date.now();

      return {
        id: `${item.id}-${now}-${Math.random().toString(36).substr(2, 9)}`,
        message: item.message,
        top,
        duration,
        delay: 0,
        variant,
        createdAt: now,
      };
    };

    /**
     * 清理过期弹幕
     *
     * 职责：移除动画已完成的弹幕，防止内存泄漏
     */
    const cleanupExpired = () => {
      const now = Date.now();
      setVisibleItems((prev) =>
        prev.filter((item) => {
          const elapsed = (now - item.createdAt) / 1000;
          return elapsed < item.duration + 1;
        })
      );
    };

    /**
     * 添加新弹幕
     *
     * 职责：添加新弹幕，保持数量不超过maxItems
     */
    const addNewDanmaku = () => {
      setVisibleItems((prev) => {
        if (prev.length >= maxItems) {
          return prev;
        }
        const newItem = createDanmakuItem();
        if (!newItem) return prev;
        return [...prev, newItem];
      });
    };

    for (let i = 0; i < Math.min(maxItems, 3); i++) {
      setTimeout(() => addNewDanmaku(), i * (spawnInterval / 2));
    }

    const spawnTimer = setInterval(addNewDanmaku, spawnInterval);
    const cleanupTimer = setInterval(cleanupExpired, 5000);

    return () => {
      clearInterval(spawnTimer);
      clearInterval(cleanupTimer);
    };
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
            left: "100%",
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
            transform: translate3d(0, 0, 0);
            opacity: 0;
          }
          2% {
            opacity: 0.9;
          }
          98% {
            opacity: 0.9;
          }
          100% {
            transform: translate3d(calc(-150vw - 100%), 0, 0);
            opacity: 0;
          }
        }
        .danmaku-item {
          will-change: transform, opacity;
        }
      `}</style>
    </div>
  );
}
