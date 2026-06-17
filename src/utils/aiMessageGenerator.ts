/**
 * AI寄语生成器
 *
 * 功能职责：
 * 1. 提供多种风格的寄语模板
 * 2. 根据场景（漂流瓶、鲜花、蜡烛）生成合适的寄语
 * 3. 模拟AI生成过程（带延迟效果）
 *
 * 设计原则：单一职责 - 只负责寄语内容生成，不涉及UI渲染
 */

/** 寄语风格类型 */
export type MessageStyle =
  | "warm"      // 温馨暖心
  | "elegant"   // 典雅诗意
  | "hopeful"   // 充满希望
  | "peaceful"  // 宁静安详
  | "memorial"; // 深切缅怀

/** 寄语场景类型 */
export type MessageScene = "driftBottle" | "flower" | "candle";

/**
 * 不同风格的寄语模板库
 * 每种场景下有多条模板，随机选取增加多样性
 */
const MESSAGE_TEMPLATES: Record<MessageScene, Record<MessageStyle, string[]>> = {
  driftBottle: {
    warm: [
      "愿这封寄语漂洋过海，抵达你的心田。思念如潮水，永不停息。",
      "把想说的话装进瓶子，让它随波逐流，或许有一天，你能感受到我的心意。",
      "每一朵浪花都是我对你的思念，愿海风捎去我的祝福。",
      "漂流瓶载着我的思念，在时光的海洋里飘荡，只为抵达你的彼岸。",
    ],
    elegant: [
      "浮生若梦，思念如潮。愿此瓶寄语，穿越山海，抵达君心。",
      "潮起潮落，思念不息。将心语托付流水，愿故人安息，生者安好。",
      "海上生明月，天涯共此时。愿漂流瓶承载我的思念，送达你的身边。",
      "逝者如斯夫，不舍昼夜。愿这份追思随波而去，抵达永恒的彼岸。",
    ],
    hopeful: [
      "虽然你已离去，但你的爱永远留在我心中。愿这份寄语能温暖另一个灵魂。",
      "生命虽有尽头，但思念永恒。愿每一个收到这封信的人，都能感受到爱与希望。",
      "把悲伤化作祝福，让思念传递温暖。愿世界充满爱与和平。",
      "你的离去教会我珍惜当下，愿这份心意能给别人带去力量。",
    ],
    peaceful: [
      "愿你在另一个世界安详自在，无病无灾。我会好好生活，不负此生。",
      "岁月静好，思念绵长。愿你安息，愿我坚强。",
      "人生自古谁无死，留取丹心照汗青。愿你在天堂安好。",
      "生如夏花之绚烂，死如秋叶之静美。愿你永远活在我心中。",
    ],
    memorial: [
      "亲爱的，好久不见。你在那边还好吗？我时常想起我们在一起的时光。",
      "又是一年清明时节，雨纷纷，情深深。对你的思念从未减少半分。",
      "你走了以后，我学会了坚强，但每当夜深人静，还是会忍不住想你。",
      "如果有来生，我们还要做亲人/朋友。这辈子，谢谢你的陪伴。",
    ],
  },
  flower: {
    warm: [
      "送上一束鲜花，寄托无尽思念。愿你在天堂一切安好。",
      "花香缕缕，情意绵绵。这束花代表我对你永远的怀念。",
      "每一朵花都承载着我的思念，愿它能送到你的身边。",
      "鲜花会凋零，但对你的记忆永远鲜活。",
    ],
    elegant: [
      "繁花似锦，思念如诗。以花为祭，愿君安息。",
      "花开有时，思念无期。敬献此花，以表追思。",
      "春色满园关不住，一缕思念入梦来。",
      "落花人独立，微雨燕双飞。愿你在另一个世界花开不败。",
    ],
    hopeful: [
      "花开花落皆是生命的轮回，愿你在另一个世界开启新的旅程。",
      "每一朵花都代表一个美好的祝愿，愿你收到这份来自人间的祝福。",
      "鲜花象征着生命的美好，愿你的灵魂如花朵般永远绽放。",
      "将悲伤埋进土壤，让思念开出花朵。愿我们都能在思念中成长。",
    ],
    peaceful: [
      "愿你如花朵般安详，在宁静中永恒绽放。",
      "生如夏花，逝如秋叶。愿你在花海中安息。",
      "花香伴你远行，愿路途平坦，无惊无扰。",
      "一花一世界，一叶一菩提。愿你早登极乐，离苦得乐。",
    ],
    memorial: [
      "这是你最喜欢的花，我给你带来了。你看到了吗？",
      "记得你总说花儿最能代表心意，今天我用这种方式想念你。",
      "每年的这个时候，我都会来看你，带上你最爱的花。",
      "你就像这些花一样，美丽而短暂，但永远留在我心里。",
    ],
  },
  candle: {
    warm: [
      "为你点燃一盏心灯，愿它照亮你前行的路。",
      "烛光虽微，情意却浓。这盏灯代表我对你永远的思念。",
      "愿这盏灯能温暖你的世界，就像你曾经温暖我的心一样。",
      "灯火不灭，思念不止。你永远活在我心中。",
    ],
    elegant: [
      "秉烛夜游，思念悠悠。愿此烛光，照亮归途。",
      "一盏孤灯照长夜，万般思念寄明月。",
      "烛火摇曳，情思缱绻。愿君安息，万古长青。",
      "春蚕到死丝方尽，蜡炬成灰泪始干。",
    ],
    hopeful: [
      "这盏灯不仅是为你而点，也是为照亮我前行的路。谢谢你曾经的陪伴。",
      "烛光代表希望，愿你在另一个世界找到属于你的光明。",
      "黑暗中，这盏灯为你而亮。愿你不再孤单，不再害怕。",
      "每一盏灯都是一个心愿，愿你的灵魂得到安息与升华。",
    ],
    peaceful: [
      "愿这盏长明灯，陪伴你永远安详。",
      "灯火通明，照见五蕴皆空。愿你离苦得乐，往生净土。",
      "以灯为供，以心为祭。愿你在宁静中得到永恒的安息。",
      "一灯能破千年暗，一智能灭万年愚。愿智慧之光永照你心。",
    ],
    memorial: [
      "这盏灯是为你点的，希望你在那边不会孤单。",
      "还记得你总说，有灯的地方就有家。今天我为你点了这盏灯。",
      "每年的今天，我都会为你点一盏灯，告诉你我很好，也希望你好。",
      "你就像这盏灯一样，虽然微弱，却照亮了我整个人生。",
    ],
  },
};

/**
 * 从模板中随机选取一条寄语
 *
 * @param scene - 寄语场景（漂流瓶/鲜花/蜡烛）
 * @param style - 寄语风格
 * @returns 随机选取的寄语内容
 */
function getRandomMessage(scene: MessageScene, style: MessageStyle): string {
  const templates = MESSAGE_TEMPLATES[scene][style];
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
}

/**
 * 随机获取一种寄语风格
 */
function getRandomStyle(): MessageStyle {
  const styles: MessageStyle[] = ["warm", "elegant", "hopeful", "peaceful", "memorial"];
  return styles[Math.floor(Math.random() * styles.length)];
}

/**
 * AI寄语生成器类
 *
 * 职责：
 * - 模拟AI生成寄语的过程（含加载延迟）
 * - 提供多种风格和场景的寄语生成
 * - 生成结果具有随机性，增加趣味性
 */
export class AIMessageGenerator {
  /** 最小生成延迟（毫秒） */
  private static readonly MIN_DELAY = 800;

  /** 最大生成延迟（毫秒） */
  private static readonly MAX_DELAY = 1500;

  /**
   * 生成指定场景和风格的寄语
   *
   * @param scene - 寄语场景
   * @param style - 寄语风格（可选，不传则随机）
   * @returns 生成的寄语内容
   */
  static async generate(
    scene: MessageScene,
    style?: MessageStyle
  ): Promise<string> {
    // 模拟AI生成延迟
    const delay =
      this.MIN_DELAY + Math.random() * (this.MAX_DELAY - this.MIN_DELAY);

    await new Promise((resolve) => setTimeout(resolve, delay));

    const selectedStyle = style || getRandomStyle();
    return getRandomMessage(scene, selectedStyle);
  }

  /**
   * 批量生成多条寄语
   *
   * @param scene - 寄语场景
   * @param count - 生成数量
   * @returns 寄语数组
   */
  static async generateMultiple(
    scene: MessageScene,
    count: number
  ): Promise<string[]> {
    const messages: string[] = [];
    const usedStyles = new Set<MessageStyle>();
    const styles: MessageStyle[] = ["warm", "elegant", "hopeful", "peaceful", "memorial"];

    for (let i = 0; i < count; i++) {
      // 尽量使用不同的风格
      let style: MessageStyle;
      if (usedStyles.size < styles.length) {
        const available = styles.filter((s) => !usedStyles.has(s));
        style = available[Math.floor(Math.random() * available.length)];
        usedStyles.add(style);
      } else {
        style = getRandomStyle();
      }

      const message = await this.generate(scene, style);
      messages.push(message);
    }

    return messages;
  }

  /**
   * 获取所有可用的寄语风格及其说明
   */
  static getStyleOptions(): { value: MessageStyle; label: string; description: string }[] {
    return [
      { value: "warm", label: "温馨暖心", description: "温暖真挚，直抵人心" },
      { value: "elegant", label: "典雅诗意", description: "辞藻优美，富有诗意" },
      { value: "hopeful", label: "充满希望", description: "积极向上，传递力量" },
      { value: "peaceful", label: "宁静安详", description: "平和淡然，抚慰心灵" },
      { value: "memorial", label: "深切缅怀", description: "真情实感，催人泪下" },
    ];
  }
}
