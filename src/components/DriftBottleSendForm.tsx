import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  generateMessage,
  generateMultipleMessages,
  STYLE_LABELS,
  STYLE_ICONS,
  type MessageStyle,
} from "@/utils/aiMessageGenerator";

interface DriftBottleSendFormProps {
  /** 主题 */
  theme: string;
  /** 发送回调 */
  onSend: (content: string) => void;
  /** 取消回调 */
  onCancel: () => void;
}

/**
 * 漂流瓶发送表单
 *
 * 负责寄语输入、AI 寄语生成、字数统计和发送操作。
 * 遵循单一职责原则：只处理发送表单的 UI 和逻辑。
 */
export default function DriftBottleSendForm({
  theme,
  onSend,
  onCancel,
}: DriftBottleSendFormProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  /** 处理发送 */
  const handleSend = () => {
    if (!content.trim()) return;
    setIsSending(true);
    onSend(content.trim());
    setContent("");
    setIsSending(false);
  };

  /** 生成 AI 寄语建议 */
  const handleGenerateAi = (style?: MessageStyle) => {
    const suggestions = style
      ? [generateMessage(style)]
      : generateMultipleMessages(3);
    setAiSuggestions(suggestions);
    setShowAiPanel(true);
  };

  /** 选用 AI 建议的寄语 */
  const handleSelectSuggestion = (suggestion: string) => {
    setContent(suggestion);
    setShowAiPanel(false);
    setAiSuggestions([]);
  };

  const isDark = theme === "starry";

  return (
    <div className="space-y-3">
      {/* AI 寄语生成面板 */}
      {showAiPanel && (
        <div
          className={cn(
            "p-4 rounded-xl space-y-3 animate-fade-in",
            isDark
              ? "bg-slate-700/50 border border-slate-600"
              : "bg-gradient-to-b from-blue-50 to-cyan-50 border border-blue-200"
          )}
        >
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "text-xs font-medium flex items-center gap-1.5",
                isDark ? "text-cyan-300" : "text-blue-600"
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI 寄语灵感
            </span>
            <button
              onClick={() => {
                setShowAiPanel(false);
                setAiSuggestions([]);
              }}
              className={cn(
                "text-xs",
                isDark ? "text-gray-400 hover:text-gray-200" : "text-memorial-400 hover:text-memorial-600"
              )}
            >
              关闭
            </button>
          </div>

          {/* 风格选择按钮 */}
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(STYLE_LABELS) as MessageStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => handleGenerateAi(style)}
                className={cn(
                  "text-xs px-2.5 py-1.5 rounded-full border transition-colors",
                  isDark
                    ? "border-slate-500 text-gray-300 hover:border-cyan-400 hover:text-cyan-200"
                    : "border-blue-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50"
                )}
              >
                {STYLE_ICONS[style]} {STYLE_LABELS[style]}
              </button>
            ))}
            <button
              onClick={() => handleGenerateAi()}
              className={cn(
                "text-xs px-2.5 py-1.5 rounded-full border transition-colors",
                isDark
                  ? "border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20"
                  : "border-blue-400 text-blue-700 hover:bg-blue-100"
              )}
            >
              🎲 随机风格
            </button>
          </div>

          {/* AI 建议列表 */}
          {aiSuggestions.length > 0 && (
            <div className="space-y-2">
              {aiSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg text-sm leading-relaxed transition-all border",
                    isDark
                      ? "bg-slate-600/50 border-slate-500/50 text-gray-200 hover:border-cyan-400/50 hover:bg-slate-600"
                      : "bg-white border-blue-100 text-memorial-700 hover:border-blue-300 hover:shadow-sm"
                  )}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 输入区域 */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="写下你想寄托的匿名寄语，它会随波漂到另一个纪念页..."
        rows={3}
        maxLength={200}
        className={cn(
          "w-full px-4 py-3 border rounded-xl focus:outline-none transition-all resize-none text-sm",
          isDark
            ? "bg-slate-700 text-gray-100 placeholder-gray-400 border-slate-600 focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400"
            : "border-memorial-200 focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
        )}
      />

      {/* 底部操作栏 */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-xs",
            isDark ? "text-gray-500" : "text-memorial-400"
          )}
        >
          {content.length}/200 · 匿名寄语
        </span>
        <div className="flex gap-2">
          {/* AI 生成按钮 */}
          <button
            onClick={() => handleGenerateAi()}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors",
              isDark
                ? "bg-cyan-900/30 text-cyan-300 hover:bg-cyan-900/50 border border-cyan-700/40"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
            )}
            title="AI 生成寄语"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI 寄语
          </button>

          <button
            onClick={() => {
              onCancel();
              setContent("");
            }}
            className={cn(
              "px-4 py-2 text-sm transition-colors",
              isDark
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
              isDark
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
  );
}
