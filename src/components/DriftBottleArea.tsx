import { useState } from "react";
import { Link } from "react-router-dom";
import { Waves, Send, X, Eye, Sparkles, RefreshCw } from "lucide-react";
import type { DriftBottle } from "@/types";
import { AIMessageGenerator, type MessageStyle } from "@/utils/aiMessageGenerator";
import { cn } from "@/lib/utils";

/**
 * 漂流瓶区域组件属性接口
 */
interface DriftBottleAreaProps {
  /** 纪念页ID */
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
 * 漂流瓶区域组件
 *
 * 功能职责：
 * 1. 展示收到的漂流瓶列表
 * 2. 提供发送漂流瓶的表单
 * 3. 支持AI生成寄语功能
 * 4. 支持查看漂流瓶详情弹窗
 *
 * 设计原则：单一职责 - 只负责漂流瓶相关UI和交互，数据管理由父组件/store负责
 */
export default function DriftBottleArea({
  driftBottles,
  onSendBottle,
  onMarkRead,
  theme = "default",
}: DriftBottleAreaProps) {
  /** 是否显示发送表单 */
  const [showSendForm, setShowSendForm] = useState(false);
  /** 输入内容 */
  const [content, setContent] = useState("");
  /** 是否正在发送 */
  const [isSending, setIsSending] = useState(false);
  /** 是否正在AI生成 */
  const [isGenerating, setIsGenerating] = useState(false);
  /** 发送成功动画 */
  const [sentAnimation, setSentAnimation] = useState(false);
  /** 发送目标纪念页ID */
  const [sentTarget, setSentTarget] = useState<string>("");
  /** 当前展开的漂流瓶ID */
  const [expandedBottle, setExpandedBottle] = useState<string | null>(null);

  /** 未读漂流瓶 */
  const unreadBottles = driftBottles.filter((b) => !b.isRead);
  /** 已读漂流瓶 */
  const readBottles = driftBottles.filter((b) => b.isRead);

  /**
   * 处理发送漂流瓶
   */
  const handleSend = () => {
    if (!content.trim()) return;
    setIsSending(true);

    const result = onSendBottle(content.trim());
    if (result) {
      setContent("");
      setShowSendForm(false);
      setSentTarget(result.toMemorialId);
      setSentAnimation(true);
      setTimeout(() => {
        setSentAnimation(false);
        setSentTarget("");
      }, 3000);
    }
    setIsSending(false);
  };

  /**
   * 处理AI生成寄语
   *
   * 调用AI寄语生成器生成一条漂流瓶寄语
   */
  const handleGenerateAIMessage = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      const message = await AIMessageGenerator.generate("driftBottle");
      setContent(message);
    } catch (error) {
      console.error("AI生成寄语失败:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 处理打开漂流瓶
   */
  const handleOpenBottle = (bottle: DriftBottle) => {
    setExpandedBottle(bottle.id);
    if (!bottle.isRead) {
      onMarkRead(bottle.id);
    }
  };

  /**
   * 格式化日期
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
  };

  /** 浅色主题瓶子颜色 */
  const bottleColors = [
    "bg-blue-50 border-blue-200",
    "bg-cyan-50 border-cyan-200",
    "bg-teal-50 border-teal-200",
    "bg-indigo-50 border-indigo-200",
    "bg-sky-50 border-sky-200",
  ];

  /** 深色主题瓶子颜色 */
  const darkBottleColors = [
    "bg-blue-900/20 border-blue-700/40 text-gray-200",
    "bg-cyan-900/20 border-cyan-700/40 text-gray-200",
    "bg-teal-900/20 border-teal-700/40 text-gray-200",
    "bg-indigo-900/20 border-indigo-700/40 text-gray-200",
    "bg-sky-900/20 border-sky-700/40 text-gray-200",
  ];

  return (
    <div className="theme-card rounded-2xl p-6 shadow-sm">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-6">
        <h3
          className={cn(
            "font-serif text-xl",
            theme === "starry" ? "text-gray-100" : "text-memorial-950"
          )}
        >
          <Waves
            className={cn(
              "w-5 h-5 inline mr-2",
              theme === "starry" ? "text-gray-400" : "text-memorial-500"
            )}
          />
          漂流寄语
        </h3>
        {unreadBottles.length > 0 && (
          <span
            className={cn(
              "text-xs px-2.5 py-1 rounded-full font-medium",
              theme === "starry"
                ? "bg-blue-500/20 text-blue-300"
                : "bg-blue-100 text-blue-700"
            )}
          >
            {unreadBottles.length} 封未读
          </span>
        )}
      </div>

      {/* 发送成功动画提示 */}
      {sentAnimation && (
        <div
          className={cn(
            "mb-6 p-4 rounded-xl text-center animate-fade-in",
            theme === "starry"
              ? "bg-cyan-900/30 border border-cyan-700/40"
              : "bg-cyan-50 border border-cyan-200"
          )}
        >
          <div className="text-3xl mb-2 drift-float">🍾</div>
          <p
            className={cn(
              "text-sm font-medium",
              theme === "starry" ? "text-cyan-200" : "text-cyan-700"
            )}
          >
            寄语瓶已随波漂走...
          </p>
          <Link
            to={`/memorial/${sentTarget}`}
            className={cn(
              "text-xs mt-1 inline-block underline",
              theme === "starry"
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
          {/* 未读漂流瓶 */}
          {unreadBottles.map((bottle, index) => (
            <div key={bottle.id}>
              <button
                onClick={() => handleOpenBottle(bottle)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all animate-fade-in",
                  theme === "starry"
                    ? "bg-blue-900/30 border-blue-600/50 hover:border-blue-500/60"
                    : "bg-blue-50 border-blue-300 hover:border-blue-400 hover:shadow-sm"
                )}
                style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg drift-float">🍾</span>
                  <span
                    className={cn(
                      "font-medium text-sm",
                      theme === "starry" ? "text-blue-200" : "text-blue-700"
                    )}
                  >
                    来自远方的寄语
                  </span>
                  <span
                    className={cn(
                      "ml-auto text-xs px-2 py-0.5 rounded-full",
                      theme === "starry"
                        ? "bg-blue-500/30 text-blue-200"
                        : "bg-blue-200 text-blue-700"
                    )}
                  >
                    未读
                  </span>
                </div>
                <p
                  className={cn(
                    "text-sm line-clamp-2",
                    theme === "starry" ? "text-gray-300" : "text-memorial-700"
                  )}
                >
                  {bottle.content}
                </p>
                <div
                  className={cn(
                    "text-xs mt-2",
                    theme === "starry" ? "text-gray-500" : "text-memorial-400"
                  )}
                >
                  来自「{bottle.fromMemorialName}」的纪念页 ·{" "}
                  {formatDate(bottle.createdAt)}
                </div>
              </button>

              {/* 漂流瓶详情弹窗 */}
              {expandedBottle === bottle.id && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in">
                  <div
                    className={cn(
                      "rounded-2xl p-6 max-w-sm w-full animate-fade-in",
                      theme === "starry" ? "bg-slate-800" : "bg-white"
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4
                        className={cn(
                          "font-serif text-lg flex items-center gap-2",
                          theme === "starry" ? "text-gray-100" : "text-memorial-950"
                        )}
                      >
                        <span className="text-2xl">🍾</span>
                        漂流寄语
                      </h4>
                      <button
                        onClick={() => setExpandedBottle(null)}
                        className={cn(
                          "p-1 rounded-full transition-colors",
                          theme === "starry"
                            ? "hover:bg-white/10 text-gray-400"
                            : "hover:bg-memorial-100 text-memorial-500"
                        )}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p
                      className={cn(
                        "text-sm leading-relaxed whitespace-pre-wrap mb-4",
                        theme === "starry" ? "text-gray-300" : "text-memorial-700"
                      )}
                    >
                      {bottle.content}
                    </p>
                    <div
                      className={cn(
                        "text-xs flex items-center justify-between pt-3 border-t",
                        theme === "starry"
                          ? "text-gray-500 border-slate-600"
                          : "text-memorial-400 border-memorial-100"
                      )}
                    >
                      <span>来自「{bottle.fromMemorialName}」的纪念页</span>
                      <span>{formatDate(bottle.createdAt)}</span>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Link
                        to={`/memorial/${bottle.fromMemorialId}`}
                        onClick={() => setExpandedBottle(null)}
                        className={cn(
                          "flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl transition-colors text-sm font-medium",
                          theme === "starry"
                            ? "bg-blue-600/30 text-blue-200 hover:bg-blue-600/40 border border-blue-500/30"
                            : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                        )}
                      >
                        <Eye className="w-4 h-4" />
                        回访
                      </Link>
                      <button
                        onClick={() => setExpandedBottle(null)}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl transition-colors text-sm",
                          theme === "starry"
                            ? "bg-white/10 text-gray-300 hover:bg-white/15"
                            : "bg-memorial-50 text-memorial-700 hover:bg-memorial-100"
                        )}
                      >
                        收下寄语
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* 已读漂流瓶 */}
          {readBottles.map((bottle, index) => (
            <div
              key={bottle.id}
              className={cn(
                "p-3 rounded-xl border animate-fade-in",
                theme === "starry"
                  ? darkBottleColors[index % darkBottleColors.length]
                  : bottleColors[index % bottleColors.length]
              )}
              style={{
                animationDelay: `${(unreadBottles.length + index) * 0.05}s`,
                opacity: 0,
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">🌊</span>
                <span
                  className={cn(
                    "text-xs",
                    theme === "starry" ? "text-gray-400" : "text-memorial-500"
                  )}
                >
                  来自「{bottle.fromMemorialName}」
                </span>
                <span
                  className={cn(
                    "text-xs ml-auto",
                    theme === "starry" ? "text-gray-500" : "text-memorial-400"
                  )}
                >
                  {formatDate(bottle.createdAt)}
                </span>
              </div>
              <p
                className={cn(
                  "text-sm leading-relaxed",
                  theme === "starry" ? "text-gray-300" : "text-memorial-700"
                )}
              >
                {bottle.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 空状态 */}
      {driftBottles.length === 0 && !sentAnimation && (
        <div
          className={cn(
            "text-center py-8 mb-4 rounded-xl",
            theme === "starry"
              ? "bg-slate-700/30"
              : "bg-gradient-to-b from-blue-50/50 to-cyan-50/50"
          )}
        >
          <div className="text-3xl mb-2 opacity-60 drift-float">🍾</div>
          <p
            className={cn(
              "text-sm",
              theme === "starry" ? "text-gray-500" : "text-memorial-400"
            )}
          >
            还没有漂流瓶漂来这里
          </p>
          <p
            className={cn(
              "text-xs mt-1",
              theme === "starry" ? "text-gray-600" : "text-memorial-300"
            )}
          >
            写一封寄语，让它随波漂流到另一个纪念页吧
          </p>
        </div>
      )}

      {/* 发送表单 */}
      {showSendForm ? (
        <div className="space-y-3">
          {/* 文本输入区 */}
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="写下你想寄托的匿名寄语，它会随波漂到另一个纪念页..."
              rows={4}
              maxLength={200}
              className={cn(
                "w-full px-4 py-3 border rounded-xl focus:outline-none transition-all resize-none text-sm",
                theme === "starry"
                  ? "bg-slate-700 text-gray-100 placeholder-gray-400 border-slate-600 focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400"
                  : "border-memorial-200 focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
              )}
            />
          </div>

          {/* AI生成按钮 */}
          <button
            onClick={handleGenerateAIMessage}
            disabled={isGenerating}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all text-sm font-medium border",
              isGenerating
                ? "opacity-70 cursor-not-allowed"
                : theme === "starry"
                ? "bg-purple-500/20 border-purple-500/30 text-purple-200 hover:bg-purple-500/30"
                : "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
            )}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>AI正在生成寄语...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>AI 帮我写寄语</span>
              </>
            )}
          </button>

          {/* 底部操作栏 */}
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "text-xs",
                theme === "starry" ? "text-gray-500" : "text-memorial-400"
              )}
            >
              {content.length}/200 · 匿名寄语
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowSendForm(false);
                  setContent("");
                }}
                className={cn(
                  "px-4 py-2 text-sm transition-colors",
                  theme === "starry"
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-memorial-500 hover:text-memorial-700"
                )}
              >
                取消
              </button>
              <button
                onClick={handleSend}
                disabled={isSending || !content.trim()}
                className={cn(
                  "inline-flex items-center gap-2 text-white py-2.5 px-5 rounded-xl transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed",
                  theme === "starry"
                    ? "bg-cyan-600 hover:bg-cyan-500"
                    : "bg-blue-600 hover:bg-blue-500"
                )}
              >
                <Send className="w-4 h-4" />
                投放漂流瓶
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowSendForm(true)}
          className={cn(
            "w-full flex items-center justify-center gap-2 text-white py-3.5 rounded-xl transition-colors font-medium",
            theme === "starry"
              ? "bg-cyan-700 hover:bg-cyan-600"
              : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          )}
        >
          <Waves className="w-5 h-5" />
          写一封漂流寄语
        </button>
      )}

      {/* 漂流瓶浮动动画 */}
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
