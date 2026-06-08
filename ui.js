import { analyzeProductRisk } from "./riskEngine.js";

const els = {
  platform: document.querySelector("#platform"),
  screenshots: document.querySelector("#screenshots"),
  previewGrid: document.querySelector("#previewGrid"),
  title: document.querySelector("#title"),
  description: document.querySelector("#description"),
  analyzeBtn: document.querySelector("#analyzeBtn"),
  sampleBtn: document.querySelector("#sampleBtn"),
  clearBtn: document.querySelector("#clearBtn"),
  riskLabel: document.querySelector("#riskLabel"),
  scoreRing: document.querySelector("#scoreRing"),
  scoreValue: document.querySelector("#scoreValue"),
  decisionCard: document.querySelector("#decisionCard"),
  decisionTitle: document.querySelector("#decisionTitle"),
  platformNote: document.querySelector("#platformNote"),
  riskTags: document.querySelector("#riskTags"),
  tagCount: document.querySelector("#tagCount"),
  detectedTerms: document.querySelector("#detectedTerms"),
  termCount: document.querySelector("#termCount"),
  reasons: document.querySelector("#reasons"),
  suggestions: document.querySelector("#suggestions"),
  rewriteTitle: document.querySelector("#rewriteTitle"),
  rewriteDescription: document.querySelector("#rewriteDescription"),
};

const LEVEL_CLASS = {
  low: "level-low",
  medium: "level-medium",
  high: "level-high",
  critical: "level-critical",
};

els.screenshots.addEventListener("change", renderPreviews);
els.analyzeBtn.addEventListener("click", runAnalysis);
els.sampleBtn.addEventListener("click", fillSample);
els.clearBtn.addEventListener("click", clearAll);

function renderPreviews() {
  els.previewGrid.innerHTML = "";
  const files = [...els.screenshots.files].slice(0, 8);

  files.forEach((file) => {
    const url = URL.createObjectURL(file);
    const item = document.createElement("figure");
    item.className = "preview-item";
    item.innerHTML = `
      <img src="${url}" alt="${escapeHtml(file.name)}" />
      <figcaption>${escapeHtml(file.name)}</figcaption>
    `;
    item.querySelector("img").addEventListener("load", () => URL.revokeObjectURL(url), { once: true });
    els.previewGrid.append(item);
  });
}

function runAnalysis() {
  renderReport(analyzeLocally());
}

function renderReport(report) {
  document.body.classList.remove(...Object.values(LEVEL_CLASS));
  document.body.classList.add(LEVEL_CLASS[report.level]);

  els.riskLabel.textContent = report.levelLabel;
  els.scoreValue.textContent = report.score;
  els.scoreRing.style.setProperty("--score", report.score);
  els.decisionTitle.textContent = report.canList ? "可谨慎上架，建议按提示优化" : "不建议上架，先处理高危问题";
  els.platformNote.textContent = report.platformNote;
  els.decisionCard.dataset.level = report.level;

  renderPills(els.riskTags, report.riskTags, "tag");
  renderPills(els.detectedTerms, report.detectedTerms, "term");
  els.tagCount.textContent = report.riskTags.length;
  els.termCount.textContent = report.detectedTerms.length;

  renderList(els.reasons, report.reasons.length ? report.reasons : ["未命中明显高危规则，仍需确认版权、授权和交付边界。"]);
  renderList(els.suggestions, report.suggestions);
  els.rewriteTitle.textContent = report.safeRewrite.title;
  els.rewriteDescription.textContent = report.safeRewrite.description;
}

function renderPills(container, items, className) {
  container.className = items.length ? `${className}-list` : `${className}-list empty-state`;
  container.innerHTML = "";

  if (!items.length) {
    container.textContent = "暂无命中";
    return;
  }

  items.forEach((item) => {
    const pill = document.createElement("span");
    pill.textContent = item;
    container.append(pill);
  });
}

function renderList(container, items) {
  container.classList.remove("empty-state");
  container.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    container.append(li);
  });
}

function fillSample() {
  els.platform.value = "xianyu";
  els.title.value = "高清国外影视剧合集 百度云网盘资源 秒发";
  els.description.value = "热门院线电影、美剧、韩剧资源，自动发货，永久更新。扫码联系客服，微信领取提取码。";
  runAnalysis();
}

function clearAll() {
  els.platform.value = "xianyu";
  els.screenshots.value = "";
  els.previewGrid.innerHTML = "";
  els.title.value = "";
  els.description.value = "";
  renderReport(analyzeProductRisk({ platform: "xianyu" }));
}

function analyzeLocally() {
  return analyzeProductRisk({
    platform: els.platform.value,
    title: els.title.value,
    description: els.description.value,
  });
}


function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const chars = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return chars[char];
  });
}
