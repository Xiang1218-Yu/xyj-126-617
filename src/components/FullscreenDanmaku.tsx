import { useState, useEffect, useMemo, useCallback } from "react";
import { X, Play, Pause, Settings, Maximize2 } from "lucide-react";
import type { Flower, Candle, DriftBottle } from "@/types";
import { getFlowerEmoji } from "@/utils";
import { cn } from "@/lib/utils";

/**
 * 全屏弹幕组件
 * 职责：全屏展示鲜花、蜡烛、漂流瓶寄语的滚动弹幕效果
 * 遵循单一职责原则：只负责弹幕的渲染和动画控制
 */

/** 弹幕类型枚举 */
export type DanmakuType = "flower" | "candle" | "bottle" | "mixed";

/** 弹幕速度 */
export type DanmakuSpeed = "slow" | "normal" | "fast";

/** 单个弹幕项数据 */
interface DanmakuItem {
  id: string;
  type: "flower" | "candle" | "bottle";
  content: string;
  emoji?: string;
}

/** FullscreenDanmaku 组件属性 */
interface FullscreenDanmakuProps {
  /** 鲜花数据 */
  flowers: Flower[];
  /** 蜡烛数据 */
  candles: Candle[];
  /** 漂流瓶数据 */
  bottles: DriftBottle[];
  /** 是否开启 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 主题 */
  theme?: string;
  /** 默认弹幕类型 */
  defaultType?: DanmakuType;
  /** 默认速度 */
  defaultSpeed?: DanmakuSpeed;
}

/**
 * 弹幕元素组件
 * 职责：渲染单个弹幕项及其动画
 */
function DanmakuElement({
  item,
  top,
  duration,
  theme,
  onAnimationEnd,
}: {
  item: DanmakuItem;
  top: number;
  duration: number;
  theme: string;
  onAnimationEnd?: (id: string) => void;
}) {
  /** 根据弹幕类型获取样式 */
  const getTypeStyle = () => {
    switch (item.type) {
      case "flower":
        return theme === "starry"
          ? "bg-purple-900/40 border-purple-500/30 text-purple-200"
          : "bg-cream-50/90 border-memorial-200/60 text-memorial-700";
      case "candle":
        return theme === "starry"
          ? "bg-amber-900/40 border-amber-500/30 text-amber-200"
          : "bg-gold-50/90 border-gold-200/60 text-gold-700";
      case "bottle":
        return theme === "starry"
          ? "bg-cyan-900/40 border-cyan-500/30 text-cyan-200"
          : "bg-blue-50/90 border-blue-200/60 text-blue-700";
      default:
        return "";
    }
  };

  const handleAnimationEnd = () => {
    if (onAnimationEnd) {
      onAnimationEnd(item.id);
    }
  };

  return (
    <div
      className={cn(
        "absolute px-4 py-2.5 rounded-full text-sm border whitespace-nowrap danmaku-element",
        getTypeStyle()
      )}
      style={{
        top: `${top}%`,
        right: 0,
        animation: `danmakuScrollFull ${duration}s linear forwards`,
        opacity: 0,
        maxWidth: "60%",
        overflow: "hidden",
        textOverflow: "ellipsis",
        backdropFilter: "blur-sm",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.1)",
      }}
      onAnimationEnd={handleAnimationEnd}
    >
      {item.emoji && <span className="mr-2">{item.emoji}</span>}
      <span className="font-medium">{item.content}</span>
    </div>
  );
}

/**
 * 弹幕控制面板组件
 * 职责：提供弹幕类型、速度等设置的UI控制
 */
function DanmakuControlPanel({
  danmakuType,
  setDanmakuType,
  speed,
  setSpeed,
  isPaused,
  setIsPaused,
  onClose,
  theme,
}: {
  danmakuType: DanmakuType;
  setDanmakuType: (type: DanmakuType) => void;
  speed: DanmakuSpeed;
  setSpeed: (speed: DanmakuSpeed) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  onClose: () => void;
  theme: string;
}) {
  const [showSettings, setShowSettings] = useState(false);

  const typeOptions: { value: DanmakuType; label: string; icon: string }[] = [
    { value: "flower", label: "鲜花", icon: "🌸" },
    { value: "candle", label: "蜡烛", icon: "🕯️" },
    { value: "bottle", label: "漂流瓶", icon: "🍾" },
    { value: "mixed", label: "混合", icon: "✨" },
  ];

  const speedOptions: { value: DanmakuSpeed; label: string }[] = [
    { value: "slow", label: "慢速" },
    { value: "normal", label: "中速" },
    { value: "fast", label: "快速" },
  ];

  return (
    <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
      {/* 设置面板 */}
      {showSettings && (
        <div
          className={cn(
            "absolute top-12 right-0 p-4 rounded-xl shadow-lg animate-fade-in",
            theme === "starry"
              ? "bg-slate-800/95 border border-slate-600"
              : "bg-white/95 border border-memorial-200"
          )}
        >
          {/* 类型选择 */}
          <div className="mb-4">
            <p
              className={cn(
              "text-xs font-medium mb-2",
              theme === "starry" ? "text-gray-400" : "text-memorial-500"
            )}
            >
              弹幕类型
            </p>
            <div className="flex gap-1.5">
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDanmakuType(opt.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1",
                    danmakuType === opt.value
                      ? theme === "starry"
                        ? "bg-purple-600 text-white"
                        : "bg-memorial-700 text-white"
                      : theme === "starry"
                      ? "bg-white/10 text-gray-300 hover:bg-white/20"
                      : "bg-memorial-100 text-memorial-600 hover:bg-memorial-200"
                  )}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 速度选择 */}
          <div>
            <p
              className={cn(
                "text-xs font-medium mb-2",
                theme === "starry" ? "text-gray-400" : "text-memorial-500"
              )}
            >
              滚动速度
            </p>
            <div className="flex gap-1.5">
              {speedOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSpeed(opt.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs transition-all",
                    speed === opt.value
                      ? theme === "starry"
                        ? "bg-purple-600 text-white"
                        : "bg-memorial-700 text-white"
                      : theme === "starry"
                      ? "bg-white/10 text-gray-300 hover:bg-white/20"
                      : "bg-memorial-100 text-memorial-600 hover:bg-memorial-200"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 控制按钮 */}
      <button
        onClick={() => setIsPaused(!isPaused)}
        className={cn(
          "p-2.5 rounded-full transition-all",
          theme === "starry"
            ? "bg-white/10 text-white hover:bg-white/20"
            : "bg-white/80 text-memorial-600 hover:bg-white"
        )}
        title={isPaused ? "播放" : "暂停"}
      >
        {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
      </button>

      <button
        onClick={() => setShowSettings(!showSettings)}
        className={cn(
          "p-2.5 rounded-full transition-all",
          theme === "starry"
            ? "bg-white/10 text-white hover:bg-white/20"
            : "bg-white/80 text-memorial-600 hover:bg-white",
          showSettings && (theme === "starry" ? "bg-white/20" : "bg-white")
        )}
        title="设置"
      >
        <Settings className="w-5 h-5" />
      </button>

      <button
        onClick={onClose}
        className={cn(
          "p-2.5 rounded-full transition-all",
          theme === "starry"
            ? "bg-white/10 text-white hover:bg-white/20"
            : "bg-white/80 text-memorial-600 hover:bg-white"
        )}
        title="关闭"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

/**
 * 全屏弹幕主组件
 * 职责：管理弹幕数据、动画循环、整体布局
 */
export default function FullscreenDanmaku({
  flowers,
  candles,
  bottles,
  isOpen,
  onClose,
  theme = "default",
  defaultType = "mixed",
  defaultSpeed = "slow",
}: FullscreenDanmakuProps) {
  const [danmakuType, setDanmakuType] = useState<DanmakuType>(defaultType);
  const [speed, setSpeed] = useState<DanmakuSpeed>(defaultSpeed);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleItems, setVisibleItems] = useState<
    { item: DanmakuItem; top: number; duration: number }[]
  >([]);

  /**
   * 将原始数据转换为弹幕项格式
   * 职责：数据格式转换
   */
  const allDanmakuItems = useMemo<DanmakuItem[]>(() => {
    const items: DanmakuItem[] = [];

    /** 转换鲜花数据 */
    if (danmakuType === "flower" || danmakuType === "mixed") {
      flowers.forEach((flower) => {
        if (flower.message && flower.message.trim()) {
          items.push({
            id: `flower-${flower.id}`,
            type: "flower",
            content: flower.message,
            emoji: getFlowerEmoji(flower.type),
          });
        }
      });
    }

    /** 转换蜡烛数据 */
    if (danmakuType === "candle" || danmakuType === "mixed") {
      candles.forEach((candle) => {
        if (candle.message && candle.message.trim()) {
          items.push({
            id: `candle-${candle.id}`,
            type: "candle",
            content: candle.message,
            emoji: "🕯️",
          });
        }
      });
    }

    /** 转换漂流瓶数据 */
    if (danmakuType === "bottle" || danmakuType === "mixed") {
      bottles.forEach((bottle) => {
        items.push({
          id: `bottle-${bottle.id}`,
          type: "bottle",
          content: bottle.content,
          emoji: "🍾",
        });
      });
    }

    return items;
  }, [flowers, candles, bottles, danmakuType]);

  /**
   * 根据速度获取动画持续时间范围
   * @param speedType 速度类型
   * @returns 持续时间范围（秒）
   */
  const getDurationRange = useCallback((speedType: DanmakuSpeed): [number, number] => {
    switch (speedType) {
      case "fast":
        return [8, 12];
      case "normal":
        return [12, 18];
      case "slow":
      default:
        return [18, 25];
    }
  }, []);

  /**
   * 获取弹幕生成间隔
   * @param speedType 速度类型
   * @returns 生成间隔（毫秒）
   */
  const getSpawnInterval = useCallback((speedType: DanmakuSpeed): number => {
    switch (speedType) {
      case "fast":
        return 800;
      case "normal":
        return 1500;
      case "slow":
      default:
        return 2500;
    }
  }, []);

  /**
   * 生成单个弹幕项
   * 职责：随机选择一条弹幕并分配位置和动画参数
   * @returns 单个弹幕数据
   */
  const createSingleDanmaku = useCallback((): {
    item: DanmakuItem;
    top: number;
    duration: number;
  } | null => {
    if (allDanmakuItems.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * allDanmakuItems.length);
    const item = allDanmakuItems[randomIndex];
    const top = 8 + Math.random() * 80;
    const [minDuration, maxDuration] = getDurationRange(speed);
    const duration = minDuration + Math.random() * (maxDuration - minDuration);

    return {
      item: { ...item, id: `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}` },
      top,
      duration,
    };
  }, [allDanmakuItems, speed, getDurationRange]);

  /**
   * 添加一个弹幕
   * 职责：向可见列表中添加新弹幕
   */
  const addDanmaku = useCallback(() => {
    const newDanmaku = createSingleDanmaku();
    if (!newDanmaku) return;

    setVisibleItems((prev) => {
      const maxVisible = 12;
      if (prev.length >= maxVisible) {
        return [...prev.slice(1), newDanmaku];
      }
      return [...prev, newDanmaku];
    });
  }, [createSingleDanmaku]);

  /**
   * 移除指定弹幕
   * 职责：动画结束后从可见列表移除弹幕
   * @param id 弹幕ID
   */
  const removeDanmaku = useCallback((id: string) => {
    setVisibleItems((prev) => prev.filter((d) => d.item.id !== id));
  }, []);

  /**
   * 弹幕持续生成
   * 职责：按间隔持续生成弹幕，暂停时停止生成
   */
  useEffect(() => {
    if (!isOpen || isPaused) return;

    const [minDuration] = getDurationRange(speed);

    const initialCount = 6;
    for (let i = 0; i < initialCount; i++) {
      const newDanmaku = createSingleDanmaku();
      if (newDanmaku) {
        const delay = i * (minDuration * 1000 / initialCount);
        setTimeout(() => {
          setVisibleItems((prev) => [...prev, newDanmaku]);
        }, delay);
      }
    }

    const spawnInterval = getSpawnInterval(speed);
    const interval = setInterval(addDanmaku, spawnInterval);

    return () => clearInterval(interval);
  }, [isOpen, isPaused, speed, createSingleDanmaku, addDanmaku, getDurationRange, getSpawnInterval]);

  /**
   * 暂停时清空所有弹幕
   * 重新开启时重新生成
   */
  useEffect(() => {
    if (!isOpen) {
      setVisibleItems([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 pointer-events-none overflow-hidden",
        theme === "starry" ? "bg-black/30" : "bg-memorial-950/20"
      )}
      style={{ animation: "fadeIn 0.3s ease-out" }}
    >
      {/* 控制面板（可交互） */}
      <div className="pointer-events-auto">
        <DanmakuControlPanel
          danmakuType={danmakuType}
          setDanmakuType={setDanmakuType}
          speed={speed}
          setSpeed={setSpeed}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
          onClose={onClose}
          theme={theme}
        />
      </div>

      {/* 弹幕内容 */}
      <div
        className={cn(
          "absolute inset-0",
          isPaused && "danmaku-paused"
        )}
      >
        {visibleItems.map(({ item, top, duration }) => (
          <DanmakuElement
            key={item.id}
            item={item}
            top={top}
            duration={duration}
            theme={theme}
            onAnimationEnd={removeDanmaku}
          />
        ))}
      </div>

      {/* 标题提示 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
        <div
          className={cn(
            "px-6 py-3 rounded-full text-center",
            theme === "starry"
              ? "bg-white/10 text-white/70"
              : "bg-white/60 text-memorial-500"
          )}
        >
          <Maximize2 className="w-4 h-4 inline mr-2" />
          <span className="text-sm">全屏弹幕模式</span>
        </div>
      </div>

      {/* 动画样式 */}
      <style>{`
        @keyframes danmakuScrollFull {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% {
            transform: translateX(calc(-100vw - 100%));
            opacity: 0;
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .danmaku-paused .danmaku-element {
          animation-play-state: paused !important;
        }
      `}</style>
    </div>
  );
}
