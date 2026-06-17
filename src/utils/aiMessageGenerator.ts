/**
 * AI 寄语生成器
 *
 * 基于模板组合的方式生成纪念寄语，无需后端 API。
 * 通过随机组合前缀、主体、后缀三个部分，产生风格多样的寄语。
 */

/** 寄语风格类型 */
export type MessageStyle = "warm" | "remembrance" | "blessing" | "philosophy";

/** 温暖风格模板 */
const WARM_TEMPLATES = {
  prefixes: [
    "愿时光温柔以待，",
    "在记忆的深处，",
    "那些温暖的时光，",
    "岁月流转，",
    "回首往昔，",
    "在心的一隅，",
    "微风轻拂，",
    "阳光洒落，",
  ],
  bodies: [
    "您的笑容依然清晰如昨",
    "您留下的爱从未远去",
    "每一个思念都是一次重逢",
    "那些陪伴的日子是最珍贵的礼物",
    "您的温暖仍在照亮我们的路",
    "每一个回忆都是一盏明灯",
    "您的善良如同春风般永恒",
    "那些叮嘱仍在耳畔回响",
  ],
  suffixes: [
    "，永远怀念。",
    "，愿您安好。",
    "，此情永存。",
    "，感恩有你。",
    "，思念无尽。",
    "，爱不曾走远。",
    "，心中永驻。",
    "，岁月为证。",
  ],
};

/** 追忆风格模板 */
const REMEMBRANCE_TEMPLATES = {
  prefixes: [
    "追忆往昔，",
    "翻开记忆的相册，",
    "在思念的河流中，",
    "回望来时路，",
    "站在时光的岸边，",
    "细数过往，",
    "在岁月的书页间，",
    "凝望星空，",
  ],
  bodies: [
    "您的身影是永恒的风景",
    "那些故事依然鲜活如初",
    "每一段回忆都值得珍藏",
    "您的教诲是前行的灯塔",
    "那些平凡的日子因您而闪耀",
    "您的坚韧是我们永远的榜样",
    "每一个瞬间都刻着您的印记",
    "那些话语至今仍在指引方向",
  ],
  suffixes: [
    "，铭记于心。",
    "，永世不忘。",
    "，铭记永远。",
    "，岁月长存。",
    "，此生难忘。",
    "，魂牵梦萦。",
    "，永不磨灭。",
    "，世代传颂。",
  ],
};

/** 祈福风格模板 */
const BLESSING_TEMPLATES = {
  prefixes: [
    "双手合十，",
    "虔诚祈愿，",
    "在烛光中默念，",
    "仰望苍穹，",
    "心怀感恩，",
    "焚香祝祷，",
    "静心祈福，",
    "合十默祷，",
  ],
  bodies: [
    "愿您在彼岸花开的世界安详",
    "愿天国的光芒永远照耀您",
    "愿您不再有病痛与忧愁",
    "愿来世的路上铺满鲜花",
    "愿您在另一个世界幸福安宁",
    "愿佛光普照，庇佑您安息",
    "愿清风明月伴您左右",
    "愿星河璀璨照亮您的归途",
  ],
  suffixes: [
    "，阿弥陀佛。",
    "，愿得解脱。",
    "，福泽绵长。",
    "，往生净土。",
    "，安息主怀。",
    "，永享安宁。",
    "，功德圆满。",
    "，离苦得乐。",
  ],
};

/** 哲思风格模板 */
const BLESSING_PHILOSOPHY = {
  prefixes: [
    "生命如河，",
    "花开花落，",
    "云卷云舒，",
    "潮起潮落，",
    "月圆月缺，",
    "四季轮回，",
    "天地之间，",
    "万物归一，",
  ],
  bodies: [
    "离别是另一种形式的重逢",
    "生命的意义在于被铭记",
    "爱是穿越时空的力量",
    "存在过的痕迹永远不会消失",
    "每一次思念都是生命的延续",
    "逝去并非终结而是转化",
    "记忆是永恒的桥梁",
    "思念让爱跨越生死的界限",
  ],
  suffixes: [
    "，此为真谛。",
    "，如是观照。",
    "，万物皆然。",
    "，道法自然。",
    "，生生不息。",
    "，循环不止。",
    "，归于宁静。",
    "，永恒如初。",
  ],
};

/** 所有风格模板映射 */
const STYLE_TEMPLATES: Record<MessageStyle, typeof WARM_TEMPLATES> = {
  warm: WARM_TEMPLATES,
  remembrance: REMEMBRANCE_TEMPLATES,
  blessing: BLESSING_TEMPLATES,
  philosophy: BLESSING_PHILOSOPHY,
};

/** 风格中文名称映射 */
export const STYLE_LABELS: Record<MessageStyle, string> = {
  warm: "温暖",
  remembrance: "追忆",
  blessing: "祈福",
  philosophy: "哲思",
};

/** 风格图标映射 */
export const STYLE_ICONS: Record<MessageStyle, string> = {
  warm: "💛",
  remembrance: "🕯️",
  blessing: "🙏",
  philosophy: "🌙",
};

/**
 * 从数组中随机选取一个元素
 * @param arr - 待选取的数组
 * @returns 随机选中的元素
 */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 根据指定风格生成一条寄语
 * @param style - 寄语风格
 * @returns 生成的寄语文本
 */
export function generateMessage(style: MessageStyle): string {
  const templates = STYLE_TEMPLATES[style];
  const prefix = pickRandom(templates.prefixes);
  const body = pickRandom(templates.bodies);
  const suffix = pickRandom(templates.suffixes);
  return `${prefix}${body}${suffix}`;
}

/**
 * 随机生成一条寄语（随机风格）
 * @returns 生成的寄语文本
 */
export function generateRandomMessage(): string {
  const styles: MessageStyle[] = ["warm", "remembrance", "blessing", "philosophy"];
  return generateMessage(pickRandom(styles));
}

/**
 * 生成多条不同风格的寄语
 * @param count - 生成数量，默认 3 条
 * @returns 寄语数组
 */
export function generateMultipleMessages(count: number = 3): string[] {
  const styles: MessageStyle[] = ["warm", "remembrance", "blessing", "philosophy"];
  const messages: string[] = [];
  const usedStyles = new Set<MessageStyle>();

  for (let i = 0; i < count; i++) {
    let style: MessageStyle;
    do {
      style = pickRandom(styles);
    } while (usedStyles.has(style) && usedStyles.size < styles.length);
    usedStyles.add(style);
    messages.push(generateMessage(style));
  }

  return messages;
}
