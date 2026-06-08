import test from "node:test";
import assert from "node:assert/strict";
import { analyzeProductRisk } from "./riskEngine.js";

test("marks pirated video resources as critical risk", () => {
  const report = analyzeProductRisk({
    title: "高清国外影视剧合集 百度云网盘资源 秒发",
    description: "热门院线电影、韩剧、美剧资源，自动发货，永久更新。",
    platform: "xianyu",
  });

  assert.equal(report.level, "critical");
  assert.equal(report.canList, false);
  assert.ok(report.score >= 90);
  assert.ok(report.riskTags.includes("版权/盗版风险"));
  assert.ok(report.riskTags.includes("影视资源风险"));
});

test("flags external traffic and business-like wording", () => {
  const report = analyzeProductRisk({
    title: "PPT资料模板包",
    description: "扫码联系客服，微信领取，支持自动发货、售后答疑、七天无理由。",
    platform: "xianyu",
  });

  assert.equal(report.level, "high");
  assert.ok(report.riskTags.includes("站外引流风险"));
  assert.ok(report.riskTags.includes("经营性描述风险"));
  assert.ok(report.suggestions.some((item) => item.includes("二维码") || item.includes("站外")));
});

test("keeps original self-made study template as lower risk", () => {
  const report = analyzeProductRisk({
    title: "自用整理 Excel 记账表模板",
    description: "个人原创整理，包含家庭预算表、月度收支表和使用说明，不含品牌素材。",
    platform: "xiaohongshu",
  });

  assert.equal(report.level, "low");
  assert.equal(report.canList, true);
  assert.ok(report.score < 35);
  assert.ok(report.suggestions.some((item) => item.includes("原创")));
});
