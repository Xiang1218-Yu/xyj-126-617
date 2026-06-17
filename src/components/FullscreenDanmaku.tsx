import { X, Settings, Flower2, Flame, Waves } from "lucide-react";
import Danmaku from "./Danmaku";
import type { DanmakuVariant, DanmakuSpeed } from "./Danmaku";
import type { UnifiedDanmakuItem, DanmakuTypeConfig } from "@/hooks/useFullscreenDanmaku";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

/**
 * 全屏弹幕组件属性接口
 */
export interface FullscreenDanmakuProps {
  /** 是否显示 */
  visible: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 弹幕数据（按类型分组） */
  danmakuByType: Record<DanmakuVariant, UnifiedDanmakuItem[]>;
  /** 弹幕类型配置 */
  typeConfig: DanmakuTypeConfig;
  /** 切换弹幕类型 */
  onToggleType: (type: keyof DanmakuTypeConfig) => void;
  /** 弹幕速度 */
  speed: DanmakuSpeed;
  /** 设置弹幕速度 */
  onSpeedChange: (speed: DanmakuSpeed) => void;
  /** 纪念页名称（用于顶部展示） */
  memorialName?: string;
  /** 主题 */
  theme?: string;
}

/**
 * 速度选项配置
 */
const SPEED_OPTIONS: { value: DanmakuSpeed; label: string }[] = [
  { value: "slow", label: "舒缓" },
  { value: "normal", label: "标准" },
  { value: "fast", label: "轻快" },
];

/**
 * 全屏弹幕组件
 *
 * 功能职责：
 * 1. 全屏展示滚动弹幕效果
 * 2. 提供控制面板（类型切换、速度调节）
 * 3. 展示纪念页主题信息
 * 4. 支持多种类型弹幕混合显示（共用同一轨道系统）
 *
 * 设计原则：单一职责 - 只负责全屏弹幕的UI渲染和交互，状态管理由hook负责
 */
export default function FullscreenDanmaku({
  visible,
  onClose,
  danmakuByType,
  typeConfig,
  onToggleType,
  speed,
  onSpeedChange,
  memorialName,
  theme = "default",
}: FullscreenDanmakuProps) {
  /**
   * 合并所有已启用类型的弹幕数据
   *
   * 使用useMemo缓存，避免不必要的合并计算
   * 合并后传入单个Danmaku组件，确保所有弹幕共享同一轨道系统，避免重叠
   */
  const mergedDanmakuItems = useMemo(() => {
    const items: UnifiedDanmakuItem[] = [];

    if (typeConfig.flower && danmakuByType.flower.length > 0) {
      items.push(...danmakuByType.flower);
    }
    if (typeConfig.candle && danmakuByType.candle.length > 0) {
      items.push(...danmakuByType.candle);
    }
    if (typeConfig.bottle && danmakuByType.bottle.length > 0) {
      items.push(...danmakuByType.bottle);
    }

    return items;
  }, [danmakuByType, typeConfig]);

  // 不可见时不渲染
  if (!visible) return null;

  /**
   * 切换到下一个速度档位
   */
  const handleSpeedToggle = () => {
    const speeds: DanmakuSpeed[] = ["slow", "normal", "fast"];
    const currentIndex = speeds.indexOf(speed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    onSpeedChange(speeds[nextIndex]);
  };

  /**
   * 获取当前速度标签
   */
  const getCurrentSpeedLabel = () => {
    return SPEED_OPTIONS.find((s) => s.value === speed)?.label || "标准";
  };

  // 计算总弹幕数
  const totalCount =
    danmakuByType.flower.length +
    danmakuByType.candle.length +
    danmakuByType.bottle.length;

  // 计算已启用类型的弹幕数
  const enabledCount = mergedDanmakuItems.length;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] animate-fade-in overflow-hidden",
        theme === "starry"
          ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-b from-memorial-900 via-memorial-800 to-memorial-900"
      )}
    >
      {/* 背景装饰 - 星星/光点 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor:
                theme === "starry" ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.2)",
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* 顶部信息栏 */}
      <div className="relative z-20 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🕯️</span>
          <div>
            <h2 className="text-white/90 font-serif text-lg">
              {memorialName || "追思寄语"}
            </h2>
            <p className="text-white/50 text-xs">
              共 {totalCount} 条寄语 · 当前显示 {enabledCount} 条
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          title="关闭全屏弹幕"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 弹幕区域 - 使用单个Danmaku组件渲染所有类型，确保轨道统一 */}
      <div className="absolute inset-0 top-16 bottom-28">
        {mergedDanmakuItems.length > 0 ? (
          <Danmaku
            items={mergedDanmakuItems}
            speed={speed}
            maxItems={15}
            className="z-10"
          />
        ) : (
          // 无内容提示
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-4 opacity-50">🌊</div>
              <p className="text-white/50 text-sm">暂无寄语内容</p>
              <p className="text-white/30 text-xs mt-1">
                献上鲜花、点燃蜡烛或投放漂流瓶
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 底部控制面板 */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        <div className="relative px-6 pb-6 pt-8">
          {/* 类型切换按钮组 */}
          <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
            {/* 鲜花弹幕开关 */}
            <button
              onClick={() => onToggleType("flower")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                typeConfig.flower
                  ? "bg-pink-500/80 text-white shadow-lg shadow-pink-500/30"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              )}
            >
              <Flower2 className="w-4 h-4" />
              <span>鲜花</span>
              <span className="text-xs opacity-70">({danmakuByType.flower.length})</span>
            </button>

            {/* 蜡烛弹幕开关 */}
            <button
              onClick={() => onToggleType("candle")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                typeConfig.candle
                  ? "bg-amber-500/80 text-white shadow-lg shadow-amber-500/30"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              )}
            >
              <Flame className="w-4 h-4" />
              <span>蜡烛</span>
              <span className="text-xs opacity-70">({danmakuByType.candle.length})</span>
            </button>

            {/* 漂流瓶弹幕开关 */}
            <button
              onClick={() => onToggleType("bottle")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                typeConfig.bottle
                  ? "bg-blue-500/80 text-white shadow-lg shadow-blue-500/30"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              )}
            >
              <Waves className="w-4 h-4" />
              <span>漂流瓶</span>
              <span className="text-xs opacity-70">({danmakuByType.bottle.length})</span>
            </button>
          </div>

          {/* 速度调节 */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleSpeedToggle}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-sm transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>速度：{getCurrentSpeedLabel()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
