import { useState, useMemo } from "react";
import { X, Play, Pause, Settings, Flower2, Flame, Waves } from "lucide-react";
import Danmaku, { type DanmakuVariant, type DanmakuSpeed } from "./Danmaku";
import type { Flower, Candle, DriftBottle } from "@/types";
import { cn } from "@/lib/utils";

/**
 * 全屏弹幕数据接口
 *
 * 职责：定义全屏弹幕需要的数据源
 */
interface FullscreenDanmakuData {
  flowers: Flower[];
  candles: Candle[];
  driftBottles: DriftBottle[];
}

/**
 * 全屏弹幕组件属性接口
 *
 * 职责：定义FullscreenDanmaku组件的输入属性
 */
interface FullscreenDanmakuProps {
  isOpen: boolean;
  onClose: () => void;
  data: FullscreenDanmakuData;
  theme?: string;
}

/**
 * 弹幕类型开关配置
 *
 * 职责：定义每种弹幕类型的显示状态和配置
 */
interface DanmakuTypeToggle {
  type: DanmakuVariant;
  enabled: boolean;
  label: string;
  icon: React.ReactNode;
}

/**
 * 将漂流瓶数据转换为弹幕格式
 *
 * 职责：将DriftBottle类型转换为弹幕所需的格式
 *
 * @param bottles - 漂流瓶数据数组
 * @returns 格式化后的弹幕数据数组
 */
function formatBottlesForDanmaku(bottles: DriftBottle[]) {
  return bottles.map((bottle) => ({
    id: bottle.id,
    message: bottle.content,
  }));
}

/**
 * 全屏弹幕控制组件
 *
 * 职责：
 * 1. 管理全屏弹幕的显示/隐藏状态
 * 2. 控制三种弹幕类型（鲜花、蜡烛、漂流瓶）的开关
 * 3. 调节弹幕滚动速度
 * 4. 整合并渲染多种类型的弹幕
 *
 * 单一职责说明：
 * - 本组件专注于全屏弹幕的控制逻辑和UI展示
 * - 具体的弹幕渲染由Danmaku组件负责
 * - 数据格式化由独立的工具函数负责
 */
export default function FullscreenDanmaku({
  isOpen,
  onClose,
  data,
  theme = "default",
}: FullscreenDanmakuProps) {
  const [speed, setSpeed] = useState<DanmakuSpeed>("slow");
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [typeToggles, setTypeToggles] = useState<DanmakuTypeToggle[]>([
    { type: "flower", enabled: true, label: "鲜花", icon: <Flower2 className="w-4 h-4" /> },
    { type: "candle", enabled: true, label: "蜡烛", icon: <Flame className="w-4 h-4" /> },
    { type: "bottle", enabled: true, label: "漂流瓶", icon: <Waves className="w-4 h-4" /> },
  ]);

  /**
   * 格式化后的弹幕数据
   *
   * 职责：将不同类型的数据统一转换为弹幕格式
   */
  const formattedData = useMemo(() => {
    return {
      flowers: data.flowers.map((f) => ({ id: f.id, message: f.message })),
      candles: data.candles.map((c) => ({ id: c.id, message: c.message })),
      bottles: formatBottlesForDanmaku(data.driftBottles),
    };
  }, [data]);

  /**
   * 切换弹幕类型开关
   *
   * 职责：切换指定类型弹幕的显示/隐藏状态
   *
   * @param type - 要切换的弹幕类型
   */
  const toggleType = (type: DanmakuVariant) => {
    setTypeToggles((prev) =>
      prev.map((t) => (t.type === type ? { ...t, enabled: !t.enabled } : t))
    );
  };

  /**
   * 获取速度选项列表
   *
   * 职责：提供速度选项供UI展示
   */
  const speedOptions: Array<{ value: DanmakuSpeed; label: string }> = [
    { value: "slow", label: "慢速" },
    { value: "normal", label: "中速" },
    { value: "fast", label: "快速" },
  ];

  /**
   * 检查是否至少有一种弹幕类型被启用
   *
   * 职责：确保至少有一种类型被选中，避免空显示
   */
  const hasEnabledType = typeToggles.some((t) => t.enabled);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* 半透明背景遮罩 */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          theme === "starry"
            ? "bg-slate-900/80"
            : "bg-memorial-900/70"
        )}
      />

      {/* 鲜花弹幕 */}
      {typeToggles.find((t) => t.type === "flower")?.enabled && !isPaused && (
        <Danmaku
          items={formattedData.flowers}
          variant="flower"
          speed={speed}
          maxItems={4}
          mode="fullscreen"
        />
      )}

      {/* 蜡烛弹幕 */}
      {typeToggles.find((t) => t.type === "candle")?.enabled && !isPaused && (
        <Danmaku
          items={formattedData.candles}
          variant="candle"
          speed={speed}
          maxItems={4}
          mode="fullscreen"
        />
      )}

      {/* 漂流瓶弹幕 */}
      {typeToggles.find((t) => t.type === "bottle")?.enabled && !isPaused && (
        <Danmaku
          items={formattedData.bottles}
          variant="bottle"
          speed={speed}
          maxItems={4}
          mode="fullscreen"
        />
      )}

      {/* 控制面板 - 可交互区域 */}
      <div className="absolute top-4 right-4 flex gap-2 pointer-events-auto">
        {/* 设置面板 */}
        {showSettings && (
          <div
            className={cn(
              "absolute top-12 right-0 rounded-xl p-4 shadow-xl min-w-[180px] animate-fade-in",
              theme === "starry"
                ? "bg-slate-800/90 backdrop-blur-md border border-slate-700"
                : "bg-white/90 backdrop-blur-md border border-memorial-200"
            )}
          >
            <div className="space-y-4">
              {/* 弹幕类型选择 */}
              <div>
                <p
                  className={cn(
                    "text-xs font-medium mb-2",
                    theme === "starry" ? "text-gray-400" : "text-memorial-500"
                  )}
                >
                  弹幕类型
                </p>
                <div className="space-y-2">
                  {typeToggles.map((toggle) => (
                    <button
                      key={toggle.type}
                      onClick={() => toggleType(toggle.type)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                        toggle.enabled
                          ? theme === "starry"
                            ? "bg-white/10 text-white"
                            : "bg-memorial-100 text-memorial-800"
                          : theme === "starry"
                          ? "text-gray-500 hover:text-gray-300"
                          : "text-memorial-400 hover:text-memorial-600"
                      )}
                    >
                      {toggle.icon}
                      <span>{toggle.label}</span>
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
                <div className="flex gap-1">
                  {speedOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSpeed(option.value)}
                      className={cn(
                        "flex-1 px-2 py-1.5 rounded-lg text-xs transition-colors",
                        speed === option.value
                          ? theme === "starry"
                            ? "bg-white/20 text-white"
                            : "bg-memorial-200 text-memorial-800"
                          : theme === "starry"
                          ? "text-gray-500 hover:text-gray-300"
                          : "text-memorial-400 hover:text-memorial-600"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 设置按钮 */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={cn(
            "p-2.5 rounded-full transition-colors",
            theme === "starry"
              ? "bg-slate-800/80 text-gray-300 hover:bg-slate-700/80 backdrop-blur-md"
              : "bg-white/80 text-memorial-600 hover:bg-white backdrop-blur-md shadow-md"
          )}
          title="弹幕设置"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* 播放/暂停按钮 */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className={cn(
            "p-2.5 rounded-full transition-colors",
            theme === "starry"
              ? "bg-slate-800/80 text-gray-300 hover:bg-slate-700/80 backdrop-blur-md"
              : "bg-white/80 text-memorial-600 hover:bg-white backdrop-blur-md shadow-md"
          )}
          title={isPaused ? "继续播放" : "暂停"}
        >
          {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
        </button>

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className={cn(
            "p-2.5 rounded-full transition-colors",
            theme === "starry"
              ? "bg-slate-800/80 text-gray-300 hover:bg-red-500/80 hover:text-white backdrop-blur-md"
              : "bg-white/80 text-memorial-600 hover:bg-red-500 hover:text-white backdrop-blur-md shadow-md"
          )}
          title="关闭全屏弹幕"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 提示文字 */}
      {!hasEnabledType && (
        <div
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center",
            theme === "starry" ? "text-gray-500" : "text-memorial-400"
          )}
        >
          <p className="text-sm">请至少开启一种弹幕类型</p>
        </div>
      )}
    </div>
  );
}
