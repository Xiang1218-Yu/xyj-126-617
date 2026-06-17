/**
 * AI寄语生成器 - 基于模板的智能寄语生成
 *
 * 职责：
 * 1. 根据不同场景生成合适的寄语内容
 * 2. 提供多种风格的寄语模板
 * 3. 支持随机生成和指定主题生成
 */

/** 寄语风格类型 */
export type MessageStyle = "warm" | "poetic" | "simple" | "comforting" | "hopeful";

/** 寄语场景类型 */
export type MessageScene = "driftBottle" | "flower" | "candle" | "general";

/** 寄语模板结构 */
interface MessageTemplate {
  style: MessageStyle;
  scene: MessageScene[];
  templates: string[];
}

/**
 * 温馨风格寄语模板
 */
const warmTemplates: MessageTemplate = {
  style: "warm",
  scene: ["driftBottle", "flower", "candle", "general"],
  templates: [
    "愿这封寄语承载着我的思念，漂洋过海来到你身边。虽然我们相隔两个世界，但我的心永远与你同在。",
    "每一朵花都寄托着我对你的思念，愿你在另一个世界安好，永远被温柔以待。",
    "点亮这盏心灯，愿它照亮你前行的路，也温暖我对你的无尽思念。",
    "亲爱的，你在那边还好吗？时光流逝，但对你的思念从未减少半分。愿你安息，愿我坚强。",
    "把思念装进漂流瓶，让它带着我的祝福，漂向有你的远方。",
  ],
};

/**
 * 诗意风格寄语模板
 */
const poeticTemplates: MessageTemplate = {
  style: "poetic",
  scene: ["driftBottle", "flower", "candle", "general"],
  templates: [
    "君问归期未有期，巴山夜雨涨秋池。何当共剪西窗烛，却话巴山夜雨时。",
    "海上生明月，天涯共此时。情人怨遥夜，竟夕起相思。",
    "去年今日此门中，人面桃花相映红。人面不知何处去，桃花依旧笑春风。",
    "明月几时有，把酒问青天。不知天上宫阙，今夕是何年。",
    "蜡烛有心还惜别，替人垂泪到天明。愿这盏烛光，带去我无尽的思念。",
  ],
};

/**
 * 简约风格寄语模板
 */
const simpleTemplates: MessageTemplate = {
  style: "simple",
  scene: ["driftBottle", "flower", "candle", "general"],
  templates: [
    "愿你安息，永远怀念。",
    "思念如潮，永不停歇。",
    "你若安好，便是晴天。",
    "一路走好，来生再见。",
    "永远怀念，不曾忘记。",
  ],
};

/**
 * 慰藉风格寄语模板
 */
const comfortingTemplates: MessageTemplate = {
  style: "comforting",
  scene: ["driftBottle", "flower", "candle", "general"],
  templates: [
    "逝者已矣，生者如斯。愿你在天堂安息，也愿我们都能好好生活，不负你所望。",
    "生命虽有尽头，但爱与记忆永恒。你永远活在我们心中，从未真正离开。",
    "不要难过，我只是先去了另一个地方。请替我好好看看这个世界，替我好好生活。",
    "离别不是终点，而是另一种形式的开始。愿你在彼岸花开的世界，一切安好。",
    "把眼泪留给昨天，把思念藏在心底。带着你的期许，我会继续勇敢地走下去。",
  ],
};

/**
 * 希望风格寄语模板
 */
const hopefulTemplates: MessageTemplate = {
  style: "hopeful",
  scene: ["driftBottle", "flower", "candle", "general"],
  templates: [
    "你是夜空中最亮的星，照亮我前行的路。我会带着你的期望，努力活成你希望的样子。",
    "生命有限，但爱无限。你的精神将永远激励着我，让我成为更好的人。",
    "虽然你已不在身边，但你的教诲、你的爱、你的笑容，都将永远陪伴着我。",
    "把思念化作力量，把怀念化为勇气。我知道，你希望我幸福快乐地生活。",
    "愿这盏灯，照亮你回家的路，也照亮我心中的希望。我们终将重逢，在那花开的彼岸。",
  ],
};

/** 所有模板集合 */
const allTemplates: MessageTemplate[] = [
  warmTemplates,
  poeticTemplates,
  simpleTemplates,
  comfortingTemplates,
  hopefulTemplates,
];

/**
 * 随机获取数组中的一个元素
 *
 * @param arr - 源数组
 * @returns 随机选中的元素
 */
function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 根据风格和场景筛选可用模板
 *
 * @param style - 寄语风格
 * @param scene - 使用场景
 * @returns 筛选后的模板字符串数组
 */
function filterTemplates(style?: MessageStyle, scene: MessageScene = "general"): string[] {
  const filtered = allTemplates
    .filter((t) => !style || t.style === style)
    .filter((t) => t.scene.includes(scene))
    .flatMap((t) => t.templates);

  return filtered.length > 0 ? filtered : allTemplates.flatMap((t) => t.templates);
}

/**
 * 生成随机风格的AI寄语
 *
 * 职责：根据场景和可选的风格生成一条寄语
 *
 * @param scene - 使用场景（漂流瓶、鲜花、蜡烛等）
 * @param style - 指定的寄语风格，不传则随机
 * @returns 生成的寄语文本
 */
export function generateAIMessage(scene: MessageScene = "general", style?: MessageStyle): string {
  const availableTemplates = filterTemplates(style, scene);
  return getRandomItem(availableTemplates);
}

/**
 * 批量生成多条AI寄语
 *
 * 职责：生成多条不重复的寄语供用户选择
 *
 * @param count - 生成数量
 * @param scene - 使用场景
 * @param style - 寄语风格
 * @returns 生成的寄语文本数组
 */
export function generateAIMessages(
  count: number = 3,
  scene: MessageScene = "general",
  style?: MessageStyle
): string[] {
  const availableTemplates = filterTemplates(style, scene);
  const shuffled = [...availableTemplates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * 获取所有可用的寄语风格
 *
 * 职责：提供风格列表供UI展示
 *
 * @returns 风格信息数组
 */
export function getMessageStyles(): Array<{ id: MessageStyle; name: string; description: string }> {
  return [
    { id: "warm", name: "温馨", description: "温暖真挚，直抵人心" },
    { id: "poetic", name: "诗意", description: "古典诗意，意蕴悠长" },
    { id: "simple", name: "简约", description: "言简意赅，情深意重" },
    { id: "comforting", name: "慰藉", description: "抚慰心灵，给予力量" },
    { id: "hopeful", name: "希望", description: "积极向上，充满希望" },
  ];
}
