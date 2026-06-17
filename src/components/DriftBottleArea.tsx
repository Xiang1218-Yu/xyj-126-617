import { useState } from "react";
import { Link } from "react-router-dom";
import { Waves } from "lucide-react";
import type { DriftBottle } from "@/types";
import { cn } from "@/lib/utils";
import DriftBottleSendForm from "./DriftBottleSendForm";
import DriftBottleCard from "./DriftBottleCard";
import DriftBottleDetail from "./DriftBottleDetail";

interface DriftBottleAreaProps {
  /** 当前纪念页 ID */
  memorialId: string;
  /** 漂流瓶列表 */
  driftBottles: DriftBottle[];
  /** 发送漂流瓶回调 */
  onSendBottle: (content: string) => DriftBottle | null;
  /** 标记已读回调 */
  onMarkRead: (bottleId: string) => void;
  /** 主题 */
  theme?: string;
}

/**
 * 漂流瓶区域主组件
 *
 * 负责组合发送表单、瓶子列表、详情弹窗等子组件，
 * 管理全局状态（展开的瓶子、发送动画等）。
 * 遵循单一职责原则：只做状态管理和子组件编排。
 */
export default function DriftBottleArea({
  driftBottles,
  onSendBottle,
  onMarkRead,
  theme = "default",
}: DriftBottleAreaProps) {
  const [showSendForm, setShowSendForm] = useState(false);
  const [sentAnimation, setSentAnimation] = useState(false);
  const [sentTarget, setSentTarget] = useState<string>("");
  const [expandedBottleId, setExpandedBottleId] = useState<string | null>(null);

  const unreadBottles = driftBottles.filter((b) => !b.isRead);
  const readBottles = driftBottles.filter((b) => b.isRead);

  /** 当前展开的漂流瓶对象 */
  const expandedBottle = expandedBottleId
    ? driftBottles.find((b) => b.id === expandedBottleId) ?? null
    : null;

  /** 处理发送漂流瓶 */
  const handleSend = (content: string) => {
    const result = onSendBottle(content);
    if (result) {
      setShowSendForm(false);
      setSentTarget(result.toMemorialId);
      setSentAnimation(true);
      setTimeout(() => {
        setSentAnimation(false);
        setSentTarget("");
      }, 3000);
    }
  };

  /** 处理点击瓶子（展开详情 + 标记已读） */
  const handleOpenBottle = (bottle: DriftBottle) => {
    setExpandedBottleId(bottle.id);
    if (!bottle.isRead) {
      onMarkRead(bottle.id);
    }
  };

  const isDark = theme === "starry";

  return (
    <div className="theme-card rounded-2xl p-6 shadow-sm">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-6">
        <h3
          className={cn(
            "font-serif text-xl",
            isDark ? "text-gray-100" : "text-memorial-950"
          )}
        >
          <Waves
            className={cn(
              "w-5 h-5 inline mr-2",
              isDark ? "text-gray-400" : "text-memorial-500"
            )}
          />
          漂流寄语
        </h3>

        <div className="flex items-center gap-2">
          {/* 未读数量 */}
          {unreadBottles.length > 0 && (
            <span
              className={cn(
                "text-xs px-2.5 py-1 rounded-full font-medium",
                isDark
                  ? "bg-blue-500/20 text-blue-300"
                  : "bg-blue-100 text-blue-700"
              )}
            >
              {unreadBottles.length} 封未读
            </span>
          )}
        </div>
      </div>

      {/* 发送成功动画 */}
      {sentAnimation && (
        <div
          className={cn(
            "mb-6 p-4 rounded-xl text-center animate-fade-in",
            isDark
              ? "bg-cyan-900/30 border border-cyan-700/40"
              : "bg-cyan-50 border border-cyan-200"
          )}
        >
          <div className="text-3xl mb-2 drift-float">🍾</div>
          <p
            className={cn(
              "text-sm font-medium",
              isDark ? "text-cyan-200" : "text-cyan-700"
            )}
          >
            寄语瓶已随波漂走...
          </p>
          <Link
            to={`/memorial/${sentTarget}`}
            className={cn(
              "text-xs mt-1 inline-block underline",
              isDark
                ? "text-cyan-400 hover:text-cyan-200"
                : "text-cyan-600 hover:text-cyan-800"
            )}
          >
            去看看它漂到了哪里
          </Link>
        </div>
      )}

      {/* 漂流瓶列表 */}
      {driftBottles.length > 0 && (
        <div className="mb-6 space-y-3 max-h-72 overflow-y-auto">
          {unreadBottles.map((bottle, index) => (
            <DriftBottleCard
              key={bottle.id}
              bottle={bottle}
              index={index}
              theme={theme}
              onClick={handleOpenBottle}
            />
          ))}

          {readBottles.map((bottle, index) => (
            <DriftBottleCard
              key={bottle.id}
              bottle={bottle}
              index={index}
              unreadCount={unreadBottles.length}
              theme={theme}
              onClick={handleOpenBottle}
            />
          ))}
        </div>
      )}

      {/* 空状态提示 */}
      {driftBottles.length === 0 && !sentAnimation && (
        <div
          className={cn(
            "text-center py-8 mb-4 rounded-xl",
            isDark
              ? "bg-slate-700/30"
              : "bg-gradient-to-b from-blue-50/50 to-cyan-50/50"
          )}
        >
          <div className="text-3xl mb-2 opacity-60 drift-float">🍾</div>
          <p
            className={cn(
              "text-sm",
              isDark ? "text-gray-500" : "text-memorial-400"
            )}
          >
            还没有漂流瓶漂来这里
          </p>
          <p
            className={cn(
              "text-xs mt-1",
              isDark ? "text-gray-600" : "text-memorial-300"
            )}
          >
            写一封寄语，让它随波漂流到另一个纪念页吧
          </p>
        </div>
      )}

      {/* 发送表单 / 发送按钮 */}
      {showSendForm ? (
        <DriftBottleSendForm
          theme={theme}
          onSend={handleSend}
          onCancel={() => setShowSendForm(false)}
        />
      ) : (
        <button
          onClick={() => setShowSendForm(true)}
          className={cn(
            "w-full flex items-center justify-center gap-2 text-white py-3.5 rounded-xl transition-colors font-medium",
            isDark
              ? "bg-cyan-700 hover:bg-cyan-600"
              : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          )}
        >
          <Waves className="w-5 h-5" />
          写一封漂流寄语
        </button>
      )}

      {/* 详情弹窗 */}
      {expandedBottle && (
        <DriftBottleDetail
          bottle={expandedBottle}
          theme={theme}
          onClose={() => setExpandedBottleId(null)}
        />
      )}

      {/* 漂浮动画样式 */}
      <style>{`
        @keyframes driftFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-4px) rotate(2deg); }
          75% { transform: translateY(2px) rotate(-1deg); }
        }
        .drift-float {
          animation: driftFloat 3s ease-in-out infinite;
          display: inline-block;
        }
      `}</style>
    </div>
  );
}
