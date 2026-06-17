import { useState, useEffect, useMemo } from "react";

/**
 * 全屏弹幕数据项
 *
 * 统一鲜花、蜡烛、漂流瓶寄语三种数据源的结构
 */
export interface DanmakuScreenItem {
  id: string;
  message: string;
  /** 弹幕类型，决定显示样式 */
  type: "flower" | "candle" | "bottle";
}

interface FullscreenDanmakuProps {
  /** 弹幕数据源 */
  items: DanmakuScreenItem[];
  /** 是否显示全屏弹幕 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 主题 */
  theme?: string;
}

/** 单条弹幕的运行时状态 */
interface DanmakuTrack {
  key: string;
  item: DanmakuScreenItem;
  top: number;
  duration: number;
  delay: number;
}

/** 各类型弹幕的样式配置 */
const TYPE_STYLES: Record<DanmakuScreenItem["type"], { icon: string; colorClass: string; darkColorClass: string }> = {
  flower: {
    icon: "💐",
    colorClass: "text-memorial-700 bg-cream-50/90 border-memorial-200/60",
    darkColorClass: "text-pink-200 bg-pink-900/30 border-pink-500/30",
  },
  candle: {
    icon: "🕯️",
    colorClass: "text-gold-700 bg-gold-50/90 border-gold-200/60",
    darkColorClass: "text-amber-200 bg-amber-900/30 border-amber-500/30",
  },
  bottle: {
    icon: "🍾",
    colorClass: "text-blue-700 bg-blue-50/90 border-blue-200/60",
    darkColorClass: "text-cyan-200 bg-cyan-900/30 border-cyan-500/30",
  },
};

/**
 * 全屏弹幕组件
 *
 * 覆盖整个视口的弹幕层，支持鲜花、蜡烛、漂流瓶寄语三种类型的滚动弹幕。
 * 每隔一段时间刷新一批弹幕，弹幕从右侧飘入、左侧飘出。
 */
export default function FullscreenDanmaku({
  items,
  isOpen,
  onClose,
  theme = "default",
}: FullscreenDanmakuProps) {
  const [tracks, setTracks] = useState<DanmakuTrack[]>([]);

  /** 过滤掉空消息 */
  const validItems = useMemo(
    () => items.filter((item) => item.message && item.message.trim().length > 0),
    [items]
  );

  /** 生成一批弹幕轨道 */
  const generateTracks = useMemo(() => {
    return (): DanmakuTrack[] => {
      if (validItems.length === 0) return [];

      const count = Math.min(8, validItems.length);
      const result: DanmakuTrack[] = [];
      const usedIndices = new Set<number>();

      for (let i = 0; i < count; i++) {
        let idx: number;
        do {
          idx = Math.floor(Math.random() * validItems.length);
        } while (usedIndices.has(idx) && usedIndices.size < validItems.length);
        usedIndices.add(idx);

        const item = validItems[idx];
        result.push({
          key: `${item.id}-${Date.now()}-${i}`,
          item,
          top: 5 + Math.random() * 80,
          duration: 10 + Math.random() * 8,
          delay: Math.random() * 5,
        });
      }

      return result;
    };
  }, [validItems]);

  /** 定时刷新弹幕 */
  useEffect(() => {
    if (!isOpen || validItems.length === 0) {
      setTracks([]);
      return;
    }

    setTracks(generateTracks());

    const interval = setInterval(() => {
      setTracks(generateTracks());
    }, 15000);

    return () => clearInterval(interval);
  }, [isOpen, validItems, generateTracks]);

  if (!isOpen) return null;

  const isDark = theme === "starry";

  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      {/* 关闭按钮需要可点击 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 pointer-events-auto p-2.5 rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/60 transition-colors backdrop-blur-sm"
        title="关闭弹幕"
      >
        ✕
      </button>

      {/* 弹幕轨道 */}
      {tracks.map((track) => {
        const style = TYPE_STYLES[track.item.type];
        return (
          <div
            key={track.key}
            className={`absolute px-4 py-2 rounded-full text-sm border whitespace-nowrap backdrop-blur-sm ${
              isDark ? style.darkColorClass : style.colorClass
            }`}
            style={{
              top: `${track.top}%`,
              right: 0,
              animation: `danmakuFullscreenScroll ${track.duration}s linear ${track.delay}s forwards`,
              opacity: 0,
              maxWidth: "80%",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <span className="mr-1.5">{style.icon}</span>
            {track.item.message}
          </div>
        );
      })}

      <style>{`
        @keyframes danmakuFullscreenScroll {
          0% {
            transform: translateX(100vw);
            opacity: 0;
          }
          3% {
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
