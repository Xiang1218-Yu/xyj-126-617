import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * 弹幕数据基础接口
 *
 * 所有弹幕数据都需要包含id和message字段
 */
export interface DanmakuItemBase {
  id: string;
  message: string;
  /** 弹幕类型（可选，用于混合类型弹幕） */
  variant?: DanmakuVariant;
}

/** 弹幕变体类型 - 决定弹幕的视觉样式 */
export type DanmakuVariant = "flower" | "candle" | "bottle";

/** 弹幕速度类型 */
export type DanmakuSpeed = "slow" | "normal" | "fast";

/**
 * 弹幕组件属性接口
 *
 * @template T - 弹幕数据类型，必须继承自DanmakuItemBase
 */
export interface DanmakuProps<T extends DanmakuItemBase> {
  /** 弹幕数据列表 */
  items: T[];
  /** 弹幕视觉样式变体（默认值，当item中没有指定时使用） */
  variant?: DanmakuVariant;
  /** 弹幕滚动速度 */
  speed?: DanmakuSpeed;
  /** 同时显示的最大弹幕数量 */
  maxItems?: number;
  /** 自定义类名 */
  className?: string;
}

/**
 * 内部可见弹幕项的数据结构
 *
 * 包含渲染弹幕所需的所有位置和动画参数
 */
interface VisibleDanmakuItem {
  /** 唯一标识（包含时间戳避免重复） */
  id: string;
  /** 弹幕消息内容 */
  message: string;
  /** 弹幕类型 */
  variant: DanmakuVariant;
  /** 距离顶部的百分比位置 */
  top: number;
  /** 动画持续时间（秒） */
  duration: number;
  /** 动画延迟时间（秒） */
  delay: number;
  /** 弹幕所在轨道（行） */
  track: number;
}

/**
 * 根据变体类型获取对应的图标
 */
function getVariantIcon(variant: DanmakuVariant): string {
  switch (variant) {
    case "candle":
      return "🕯️";
    case "bottle":
      return "🍾";
    case "flower":
    default:
      return "🌸";
  }
}

/**
 * 根据变体类型获取对应的样式类名
 */
function getVariantStyleClass(variant: DanmakuVariant): string {
  switch (variant) {
    case "candle":
      return "text-amber-700 bg-amber-50/90 border-amber-200/70 backdrop-blur-sm";
    case "bottle":
      return "text-blue-700 bg-blue-50/90 border-blue-200/70 backdrop-blur-sm";
    case "flower":
    default:
      return "text-pink-700 bg-pink-50/90 border-pink-200/70 backdrop-blur-sm";
  }
}

/**
 * 弹幕组件
 *
 * 功能职责：
 * 1. 根据传入的数据生成滚动弹幕效果
 * 2. 支持多种视觉样式（鲜花/蜡烛/漂流瓶）
 * 3. 支持混合类型弹幕（每条弹幕可指定自己的类型）
 * 4. 支持速度调节和数量控制
 * 5. 自动循环刷新弹幕内容
 * 6. 轨道分配算法避免弹幕重叠
 *
 * 设计原则：单一职责 - 只负责弹幕的渲染和动画，不关心数据来源
 *
 * @template T - 弹幕数据类型
 */
export default function Danmaku<T extends DanmakuItemBase>({
  items,
  variant: defaultVariant = "flower",
  speed = "slow",
  maxItems = 5,
  className,
}: DanmakuProps<T>) {
  /** 可见弹幕列表状态 */
  const [visibleItems, setVisibleItems] = useState<VisibleDanmakuItem[]>([]);

  /**
   * 过滤出有有效消息内容的弹幕项
   *
   * 使用useMemo缓存计算结果，避免不必要的重复计算
   */
  const messagesWithText = useMemo(
    () => items.filter((item) => item.message && item.message.trim().length > 0),
    [items]
  );

  /**
   * 根据速度配置获取动画持续时间范围
   *
   * @returns [最小持续时间, 最大持续时间]（秒）
   */
  const getSpeedRange = (): [number, number] => {
    switch (speed) {
      case "fast":
        return [6, 10];
      case "normal":
        return [10, 15];
      case "slow":
      default:
        return [14, 22];
    }
  };

  /**
   * 生成一批新的弹幕
   *
   * 轨道分配算法说明：
   * 1. 计算可用轨道数量（最多10条轨道）
   * 2. 将弹幕按顺序分配到不同轨道
   * 3. 同一轨道内的弹幕通过延迟和速度错开，避免重叠
   * 4. 每条轨道内的垂直位置有一定随机性，避免过于整齐
   */
  useEffect(() => {
    // 没有有效消息时清空弹幕
    if (messagesWithText.length === 0) {
      setVisibleItems([]);
      return;
    }

    const generateDanmaku = () => {
      const count = Math.min(maxItems, messagesWithText.length);
      const selected: VisibleDanmakuItem[] = [];
      const usedIndices = new Set<number>();
      const [minDuration, maxDuration] = getSpeedRange();
      // 轨道数量：根据弹幕数量动态调整，最多10条轨道
      const totalTracks = Math.min(Math.max(count, 3), 10);
      // 轨道高度占比（基于可用区域的百分比）
      const trackHeight = 80 / totalTracks;

      for (let i = 0; i < count; i++) {
        // 随机选择一个未使用过的消息索引
        let idx: number;
        let attempts = 0;
        do {
          idx = Math.floor(Math.random() * messagesWithText.length);
          attempts++;
        } while (
          usedIndices.has(idx) &&
          usedIndices.size < messagesWithText.length &&
          attempts < 100
        );
        usedIndices.add(idx);

        const item = messagesWithText[idx];
        const itemVariant = item.variant || defaultVariant;

        // 按顺序分配轨道，循环使用
        const trackIndex = i % totalTracks;
        // 在轨道范围内随机偏移，增加自然感
        const top = 10 + trackIndex * trackHeight + Math.random() * (trackHeight * 0.5);

        // 随机持续时间（在速度范围内）
        const duration = minDuration + Math.random() * (maxDuration - minDuration);

        // 根据轨道索引错开延迟，避免同一时间大量弹幕出现
        const delay = (trackIndex * 0.8) + Math.random() * 2;

        selected.push({
          id: `${item.id}-${Date.now()}-${i}`,
          message: item.message,
          variant: itemVariant,
          top,
          duration,
          delay,
          track: trackIndex,
        });
      }

      setVisibleItems(selected);
    };

    // 立即生成第一批弹幕
    generateDanmaku();

    // 定时刷新弹幕内容
    const interval = setInterval(generateDanmaku, 12000);

    // 清理定时器
    return () => clearInterval(interval);
  }, [messagesWithText, speed, maxItems, defaultVariant]);

  // 没有有效消息时不渲染
  if (messagesWithText.length === 0) {
    return null;
  }

  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}>
      {visibleItems.map((item) => (
        <div
          key={item.id}
          className={cn(
            "absolute px-3 py-1.5 rounded-full text-xs border whitespace-nowrap danmaku-item",
            getVariantStyleClass(item.variant)
          )}
          style={{
            top: `${item.top}%`,
            right: 0,
            animation: `danmakuScroll ${item.duration}s linear ${item.delay}s forwards`,
            opacity: 0,
            maxWidth: "70%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <span className="mr-1">{getVariantIcon(item.variant)}</span>
          <span className="truncate inline-block align-middle">{item.message}</span>
        </div>
      ))}

      {/* 弹幕滚动动画关键帧 */}
      <style>{`
        @keyframes danmakuScroll {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          5% {
            opacity: 0.95;
          }
          90% {
            opacity: 0.95;
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
