const RULES = [
  {
    id: "adult",
    tag: "低俗/涉黄风险",
    weight: 100,
    severity: "block",
    patterns: ["涉黄", "成人资源", "原味", "偷拍视频", "擦边写真", "你懂的"],
    reason: "商品疑似包含低俗、色情或擦边内容，这类内容通常属于平台红线。",
    suggestion: "不要上架涉黄、低俗、擦边或暗示性资源类商品。",
  },
  {
    id: "deepfake",
    tag: "AI换脸风险",
    weight: 100,
    severity: "block",
    patterns: ["ai换脸", "AI换脸", "换脸视频", "明星换脸", "一键脱衣"],
    reason: "AI换脸、伪造人像或侵犯人格权益的服务风险极高。",
    suggestion: "放弃 AI 换脸、伪造身份、侵犯肖像或隐私的产品方向。",
  },
  {
    id: "copyright",
    tag: "版权/盗版风险",
    weight: 42,
    severity: "high",
    patterns: ["盗版", "破解版", "破解", "搬运", "付费课程", "课程合集", "教程合集", "素材合集", "无授权", "低价课", "电子书合集", "院线电影", "影视剧合集"],
    reason: "商品描述疑似涉及未授权搬运、课程、软件或素材售卖。",
    suggestion: "只售卖自有版权、原创整理或已获授权的内容，并保留授权或原创证明。",
  },
  {
    id: "video",
    tag: "影视资源风险",
    weight: 55,
    severity: "block",
    patterns: ["影视资源", "影视剧", "电影资源", "院线电影", "美剧", "韩剧", "日剧", "网剧合集", "高清电影", "追剧资源"],
    reason: "影视、院线、剧集资源通常涉及版权，平台处罚和权利人投诉风险都很高。",
    suggestion: "不要售卖影视剧、电影、综艺、网盘观影资源或相关下载服务。",
  },
  {
    id: "cloud",
    tag: "网盘资源风险",
    weight: 30,
    severity: "high",
    patterns: ["百度云", "百度网盘", "阿里云盘", "夸克网盘", "网盘资源", "网盘链接", "云盘资源", "提取码"],
    reason: "网盘交付常与版权资源、站外引流和交付纠纷绑定。",
    suggestion: "避免使用网盘资源售卖表达；如为原创资料，改为明确的原创资料交付说明。",
  },
  {
    id: "member",
    tag: "会员/充值风险",
    weight: 45,
    severity: "high",
    patterns: ["会员充值", "低价充值", "代充", "直充", "svip", "Svip", "SVIP", "苹果音乐", "Apple Music", "影视会员", "网盘会员", "话费充值"],
    reason: "会员、充值、代充类商品容易涉及非官方渠道、售后纠纷或欺诈投诉。",
    suggestion: "没有官方授权、正规票据和稳定售后能力时，不建议做会员充值或代充类产品。",
  },
  {
    id: "finance",
    tag: "金融/投资风险",
    weight: 75,
    severity: "block",
    patterns: ["炒股", "荐股", "内部消息", "股票资料", "虚拟货币", "币圈", "博彩", "彩票预测", "投资秘籍"],
    reason: "金融投资、荐股、虚拟货币和博彩相关内容容易触发监管与平台禁售规则。",
    suggestion: "不要售卖投资荐股、虚拟货币、博彩预测或暗示稳赚的资料服务。",
  },
  {
    id: "privacy",
    tag: "实名/隐私风险",
    weight: 85,
    severity: "block",
    patterns: ["电话卡", "实名号", "改实名", "解实名", "账号买卖", "定位查询", "查档", "开盒", "隐私查询"],
    reason: "实名、账号、电话卡和隐私查询类商品涉及个人信息与平台红线。",
    suggestion: "放弃实名、账号、隐私数据、电话卡倒卖或查询服务。",
  },
  {
    id: "medical",
    tag: "医疗/保健资质风险",
    weight: 70,
    severity: "high",
    patterns: ["医疗器械", "药品", "处方药", "减肥药", "壮阳", "保健品", "治疗", "根治", "诊断"],
    reason: "医疗、药品和保健功效类商品通常需要资质，且宣传限制严格。",
    suggestion: "没有对应经营资质和合规证明时，不要售卖或宣传医疗、药品、保健功效产品。",
  },
  {
    id: "traffic",
    tag: "站外引流风险",
    weight: 42,
    severity: "high",
    patterns: ["微信", "vx", "V信", "加我", "私聊领取", "扫码", "二维码", "公众号", "外链", "链接领取", "联系客服领取"],
    reason: "商品页或沟通中出现站外联系方式、二维码、外链，容易被判定为引流。",
    suggestion: "删除二维码、微信号、外链、站外领取等内容，交付和售后尽量留在平台内完成。",
  },
  {
    id: "business",
    tag: "经营性描述风险",
    weight: 24,
    severity: "medium",
    patterns: ["自动发货", "秒发", "永久更新", "售后答疑", "七天无理由", "一手货源", "多规格", "长期更新", "批量"],
    reason: "经营性话术可能让个人闲置商品被识别为持续经营商品。",
    suggestion: "如果定位个人闲置，减少经营性承诺；若实际经营，应按平台商家规则补齐资质和售后责任。",
  },
  {
    id: "absolute",
    tag: "夸大宣传风险",
    weight: 16,
    severity: "medium",
    patterns: ["最好", "最佳", "最强", "顶级", "稳赚", "暴利", "包过", "100%有效", "永久有效"],
    reason: "绝对化、夸大或收益承诺表达容易触发审核和投诉。",
    suggestion: "改为客观描述内容范围、适用人群、交付形式和真实限制。",
  },
];

const LEVELS = [
  { level: "critical", label: "极高风险", min: 90, canList: false },
  { level: "high", label: "高风险", min: 65, canList: false },
  { level: "medium", label: "中风险", min: 35, canList: true },
  { level: "low", label: "低风险", min: 0, canList: true },
];

const PLATFORM_NOTES = {
  xianyu: "闲鱼场景重点关注个人闲置与经营性卖家的边界、引流、版权投诉和重复售卖。",
  xiaohongshu: "小红书场景重点关注电子资源类目资质、原创证明、交付举证和内容种草合规。",
  taobao: "淘宝场景重点关注知识产权投诉、授权链路、商品详情证据和交易售后。",
  generic: "通用场景重点关注版权、禁售类目、引流、夸大宣传和交付纠纷。",
};

function normalizeText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(items) {
  return [...new Set(items)];
}

function findMatches(text, patterns) {
  const lowerText = text.toLowerCase();
  return patterns.filter((pattern) => lowerText.includes(String(pattern).toLowerCase()));
}

function getLevel(score, hasBlockRule) {
  if (hasBlockRule && score >= 75) {
    return LEVELS[0];
  }
  return LEVELS.find((item) => score >= item.min) || LEVELS.at(-1);
}

export function analyzeProductRisk(input = {}) {
  const title = normalizeText(input.title);
  const description = normalizeText(input.description);
  const ocrText = normalizeText(input.ocrText);
  const platform = input.platform || "generic";
  const combined = [title, description, ocrText].filter(Boolean).join(" ");

  const hits = RULES.map((rule) => {
    const matches = findMatches(combined, rule.patterns);
    return matches.length ? { ...rule, matches } : null;
  }).filter(Boolean);

  const scoreFromRules = hits.reduce((sum, rule) => sum + rule.weight, 0);
  const score = Math.min(100, scoreFromRules);
  const hasBlockRule = hits.some((rule) => rule.severity === "block");
  const level = getLevel(score, hasBlockRule);
  const cleanSuggestions = [
    ...hits.map((rule) => rule.suggestion),
    "补充商品来源、原创说明、授权证明或交付边界，方便平台审核和售后举证。",
  ];

  if (!hits.some((rule) => rule.id === "copyright")) {
    cleanSuggestions.push("如果商品包含模板、素材、课程或品牌元素，务必确认版权和商用授权。");
  }

  if (score < 35) {
    cleanSuggestions.push("保留原创底稿、制作记录或授权文件，商品页写清楚交付内容和不包含的范围。");
  }

  return {
    score,
    level: level.level,
    levelLabel: level.label,
    canList: level.canList && !hasBlockRule,
    platform,
    platformNote: PLATFORM_NOTES[platform] || PLATFORM_NOTES.generic,
    riskTags: unique(hits.map((rule) => rule.tag)),
    detectedTerms: unique(hits.flatMap((rule) => rule.matches)),
    reasons: hits.map((rule) => rule.reason),
    suggestions: unique(cleanSuggestions),
    safeRewrite: buildSafeRewrite({ title, description, hits }),
    ruleHits: hits.map((rule) => ({
      id: rule.id,
      tag: rule.tag,
      weight: rule.weight,
      severity: rule.severity,
      matches: rule.matches,
    })),
  };
}

function buildSafeRewrite({ title, description, hits }) {
  const highRisk = hits.some((rule) => rule.severity === "block" || rule.id === "copyright" || rule.id === "member");
  if (highRisk) {
    return {
      title: "不建议改写上架",
      description: "该商品方向本身存在较高违规或侵权风险，建议更换为原创资料、合规服务或有授权证明的产品。",
    };
  }

  const baseTitle = title || "个人自用整理资料";
  const baseDescription = description || "个人整理内容，包含使用说明和交付范围。";

  return {
    title: baseTitle
      .replace(/自动发货|秒发|永久更新|七天无理由|售后答疑/g, "")
      .replace(/\s+/g, " ")
      .trim(),
    description: `${baseDescription.replace(/微信|二维码|扫码|外链|加我|私聊领取/g, "平台内沟通")}\n建议补充：资料来源、原创/授权说明、交付清单、适用范围和售后边界。`,
  };
}

export { RULES };
