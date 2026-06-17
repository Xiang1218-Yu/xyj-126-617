import { useState, useCallback } from "react";

/**
 * AI寄语生成器Hook
 * 职责：生成不同风格的漂流瓶寄语内容
 * 遵循单一职责原则：只负责AI寄语的生成逻辑，不涉及UI渲染
 */

/** 寄语风格类型 */
export type MessageStyle =
  | "warm"      // 温暖治愈
  | "poetic"    // 诗意文艺
  | "simple"    // 简洁朴实
  | "hopeful";  // 充满希望

/** 生成状态 */
interface GenerateState {
  isGenerating: boolean;
  currentMessage: string;
  error: string | null;
}

/**
 * 预设寄语模板库
 * 按风格分类，模拟AI生成的不同风格寄语
 */
const MESSAGE_TEMPLATES: Record<MessageStyle, string[]> = {
  warm: [
    "愿风带去我的思念，愿你在另一个世界安好。那些温暖的回忆，会一直陪伴着我。",
    "时光匆匆，但您的爱从未离开。愿您在彼岸花开处，笑容依旧灿烂。",
    "把思念折成纸船，让它随波漂向有你的远方。愿您一切都好，我们终会再见。",
    "每当风起时，我知道那是您在轻轻抚摸我的头发。谢谢您，一直都在。",
    "您留下的温暖，足够我走过漫长的岁月。愿天堂没有病痛，只有永恒的安宁。",
  ],
  poetic: [
    "青山不老，绿水长流。斯人已逝，风骨长存。愿您在云水深处，安然自得。",
    "浮生若梦，刹那芳华。您是人间四月天，永远明媚，永远温暖。",
    "岁月如河，生命如歌。您的旋律，将永远在我心中轻轻回响。",
    "鸿雁传书，鱼传尺素。这一瓶思念，愿能漂到有您的彼岸。",
    "落花人独立，微雨燕双飞。思念如潮水，悠悠无尽期。",
  ],
  simple: [
    "想你了，一切都好吗？",
    "愿你在那边一切安好。",
    "谢谢您，我会好好生活。",
    "思念如昔，愿您安息。",
    "天上的星星，有一颗是您。",
  ],
  hopeful: [
    "您的爱如同种子，在我心中生根发芽。我会带着您的期望，勇敢地走下去。",
    "生命有尽，思念无期。但我相信，每一次怀念，都是重逢的预告。",
    "您教会我的坚强，是我一生的财富。我会好好的，请您放心。",
    "离别不是终点，而是另一种开始。愿我们在各自的旅途上，都能安好。",
    "您的笑容是我心中永远的光，照亮我前行的路。谢谢您，我爱您。",
  ],
};

/**
 * AI寄语生成器Hook
 * @returns 生成状态和操作方法
 */
export function useAIMessageGenerator() {
  const [state, setState] = useState<GenerateState>({
    isGenerating: false,
    currentMessage: "",
    error: null,
  });

  /**
   * 生成指定风格的寄语
   * @param style - 寄语风格
   * @returns 生成的寄语内容
   */
  const generateMessage = useCallback(async (style: MessageStyle = "warm"): Promise<string> => {
    setState((prev) => ({ ...prev, isGenerating: true, error: null }));

    try {
      // 模拟AI生成的延迟效果
      await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 500));

      const templates = MESSAGE_TEMPLATES[style];
      const randomIndex = Math.floor(Math.random() * templates.length);
      const message = templates[randomIndex];

      setState((prev) => ({
        ...prev,
        isGenerating: false,
        currentMessage: message,
      }));

      return message;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "生成失败，请重试";
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        error: errorMessage,
      }));
      throw err;
    }
  }, []);

  /**
   * 随机生成任意风格的寄语
   * @returns 生成的寄语内容
   */
  const generateRandomMessage = useCallback(async (): Promise<string> => {
    const styles: MessageStyle[] = ["warm", "poetic", "simple", "hopeful"];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    return generateMessage(randomStyle);
  }, [generateMessage]);

  /**
   * 清除当前生成的寄语
   */
  const clearMessage = useCallback(() => {
    setState((prev) => ({ ...prev, currentMessage: "" }));
  }, []);

  return {
    ...state,
    generateMessage,
    generateRandomMessage,
    clearMessage,
  };
}

export default useAIMessageGenerator;
