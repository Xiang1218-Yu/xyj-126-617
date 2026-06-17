import { Link } from "react-router-dom";
import { X, Eye } from "lucide-react";
import type { DriftBottle } from "@/types";
import { cn } from "@/lib/utils";

interface DriftBottleDetailProps {
  /** 当前展开的漂流瓶 */
  bottle: DriftBottle;
  /** 主题 */
  theme: string;
  /** 关闭回调 */
  onClose: () => void;
}

/**
 * 格式化日期为 YYYY.MM.DD 格式
 * @param dateString - ISO 日期字符串
 * @returns 格式化后的日期
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * 漂流瓶详情弹窗
 *
 * 展示漂流瓶的完整内容，提供回访和收下寄语操作。
 * 遵循单一职责原则：只处理详情弹窗的展示和交互。
 */
export default function DriftBottleDetail({
  bottle,
  theme,
  onClose,
}: DriftBottleDetailProps) {
  const isDark = theme === "starry";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className={cn(
          "rounded-2xl p-6 max-w-sm w-full animate-fade-in",
          isDark ? "bg-slate-800" : "bg-white"
        )}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-4">
          <h4
            className={cn(
              "font-serif text-lg flex items-center gap-2",
              isDark ? "text-gray-100" : "text-memorial-950"
            )}
          >
            <span className="text-2xl">🍾</span>
            漂流寄语
          </h4>
          <button
            onClick={onClose}
            className={cn(
              "p-1 rounded-full transition-colors",
              isDark
                ? "hover:bg-white/10 text-gray-400"
                : "hover:bg-memorial-100 text-memorial-500"
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 寄语内容 */}
        <p
          className={cn(
            "text-sm leading-relaxed whitespace-pre-wrap mb-4",
            isDark ? "text-gray-300" : "text-memorial-700"
          )}
        >
          {bottle.content}
        </p>

        {/* 来源信息 */}
        <div
          className={cn(
            "text-xs flex items-center justify-between pt-3 border-t",
            isDark
              ? "text-gray-500 border-slate-600"
              : "text-memorial-400 border-memorial-100"
          )}
        >
          <span>来自「{bottle.fromMemorialName}」的纪念页</span>
          <span>{formatDate(bottle.createdAt)}</span>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 mt-4">
          <Link
            to={`/memorial/${bottle.fromMemorialId}`}
            onClick={onClose}
            className={cn(
              "flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl transition-colors text-sm font-medium",
              isDark
                ? "bg-blue-600/30 text-blue-200 hover:bg-blue-600/40 border border-blue-500/30"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
            )}
          >
            <Eye className="w-4 h-4" />
            回访
          </Link>
          <button
            onClick={onClose}
            className={cn(
              "flex-1 py-2.5 rounded-xl transition-colors text-sm",
              isDark
                ? "bg-white/10 text-gray-300 hover:bg-white/15"
                : "bg-memorial-50 text-memorial-700 hover:bg-memorial-100"
            )}
          >
            收下寄语
          </button>
        </div>
      </div>
    </div>
  );
}
