import type { DriftBottle } from "@/types";
import { cn } from "@/lib/utils";

interface DriftBottleCardProps {
  /** 漂流瓶数据 */
  bottle: DriftBottle;
  /** 序号，用于动画延迟 */
  index: number;
  /** 未读瓶子总数（用于已读动画延迟偏移） */
  unreadCount?: number;
  /** 主题 */
  theme: string;
  /** 点击回调 */
  onClick: (bottle: DriftBottle) => void;
}

/** 已读瓶子配色方案 */
const BOTTLE_COLORS = [
  "bg-blue-50 border-blue-200",
  "bg-cyan-50 border-cyan-200",
  "bg-teal-50 border-teal-200",
  "bg-indigo-50 border-indigo-200",
  "bg-sky-50 border-sky-200",
];

/** 已读瓶子暗色配色方案 */
const DARK_BOTTLE_COLORS = [
  "bg-blue-900/20 border-blue-700/40 text-gray-200",
  "bg-cyan-900/20 border-cyan-700/40 text-gray-200",
  "bg-teal-900/20 border-teal-700/40 text-gray-200",
  "bg-indigo-900/20 border-indigo-700/40 text-gray-200",
  "bg-sky-900/20 border-sky-700/40 text-gray-200",
];

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
 * 漂流瓶卡片组件
 *
 * 负责单条漂流瓶的展示，区分未读和已读两种样式。
 * 遵循单一职责原则：只处理单个漂流瓶的渲染和交互。
 */
export default function DriftBottleCard({
  bottle,
  index,
  unreadCount = 0,
  theme,
  onClick,
}: DriftBottleCardProps) {
  const isDark = theme === "starry";
  const isUnread = !bottle.isRead;

  /** 未读瓶子样式 */
  if (isUnread) {
    return (
      <button
        onClick={() => onClick(bottle)}
        className={cn(
          "w-full text-left p-4 rounded-xl border transition-all animate-fade-in",
          isDark
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
              isDark ? "text-blue-200" : "text-blue-700"
            )}
          >
            来自远方的寄语
          </span>
          <span
            className={cn(
              "ml-auto text-xs px-2 py-0.5 rounded-full",
              isDark
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
            isDark ? "text-gray-300" : "text-memorial-700"
          )}
        >
          {bottle.content}
        </p>
        <div
          className={cn(
            "text-xs mt-2",
            isDark ? "text-gray-500" : "text-memorial-400"
          )}
        >
          来自「{bottle.fromMemorialName}」的纪念页 · {formatDate(bottle.createdAt)}
        </div>
      </button>
    );
  }

  /** 已读瓶子样式 */
  return (
    <div
      className={cn(
        "p-3 rounded-xl border animate-fade-in",
        isDark
          ? DARK_BOTTLE_COLORS[index % DARK_BOTTLE_COLORS.length]
          : BOTTLE_COLORS[index % BOTTLE_COLORS.length]
      )}
      style={{
        animationDelay: `${(unreadCount + index) * 0.05}s`,
        opacity: 0,
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">🌊</span>
        <span
          className={cn(
            "text-xs",
            isDark ? "text-gray-400" : "text-memorial-500"
          )}
        >
          来自「{bottle.fromMemorialName}」
        </span>
        <span
          className={cn(
            "text-xs ml-auto",
            isDark ? "text-gray-500" : "text-memorial-400"
          )}
        >
          {formatDate(bottle.createdAt)}
        </span>
      </div>
      <p
        className={cn(
          "text-sm leading-relaxed",
          isDark ? "text-gray-300" : "text-memorial-700"
        )}
      >
        {bottle.content}
      </p>
    </div>
  );
}
