import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { analyzeProductRisk } from "./riskEngine.js";

const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || "127.0.0.1";
const ROOT = normalize(join(import.meta.dirname, ".."));
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "POST" && req.url === "/api/analyze-image") {
      await handleAnalyze(req, res);
      return;
    }

    if (req.method === "GET") {
      await serveStatic(req, res);
      return;
    }

    sendJson(res, 405, { error: "method_not_allowed" });
  } catch (error) {
    sendJson(res, 500, { error: "server_error", message: error.message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Risk tool running at http://${HOST}:${PORT}`);
});

async function handleAnalyze(req, res) {
  const body = await readJsonBody(req);
  const images = Array.isArray(body.images) ? body.images.slice(0, 5) : [];
  const manualTitle = String(body.title || "");
  const manualDescription = String(body.description || "");

  if (!process.env.OPENAI_API_KEY) {
    const report = analyzeProductRisk({
      platform: body.platform,
      title: manualTitle,
      description: manualDescription,
    });
    sendJson(res, 200, {
      mode: "manual",
      extraction: {
        extracted_title: manualTitle,
        extracted_description: manualDescription,
        visible_text: manualDescription,
        confidence: "no_api_key",
      },
      report,
      notice: "OPENAI_API_KEY is not configured. Used manual text only.",
    });
    return;
  }

  if (!images.length && !manualTitle && !manualDescription) {
    sendJson(res, 400, { error: "empty_input", message: "Provide images or text." });
    return;
  }

  const extraction = images.length
    ? await extractProductTextWithVision({ images, manualTitle, manualDescription })
    : {
        extracted_title: manualTitle,
        extracted_description: manualDescription,
        visible_text: manualDescription,
        confidence: "text_only",
      };

  const report = analyzeProductRisk({
    platform: body.platform,
    title: manualTitle || extraction.extracted_title,
    description: [manualDescription, extraction.extracted_description, extraction.visible_text].filter(Boolean).join("\n"),
  });

  sendJson(res, 200, { mode: images.length ? "vision" : "manual", extraction, report });
}

async function extractProductTextWithVision({ images, manualTitle, manualDescription }) {
  const content = [
    {
      type: "input_text",
      text: [
        "你是电商商品截图信息抽取助手，只抽取截图可见信息，不判断风险。",
        "请识别商品标题、主图/详情页/聊天页中的可见文字、平台提示、价格和交付承诺。",
        "不要输出规避平台审核的方法。看不清的内容留空或写不确定。",
        manualTitle ? `用户补充标题：${manualTitle}` : "",
        manualDescription ? `用户补充文字：${manualDescription}` : "",
      ].filter(Boolean).join("\n"),
    },
    ...images.map((image) => ({ type: "input_image", image_url: image })),
  ];

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      input: [{ role: "user", content }],
      text: {
        format: {
          type: "json_schema",
          name: "product_screenshot_extraction",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              extracted_title: { type: "string" },
              extracted_description: { type: "string" },
              visible_text: { type: "string" },
              confidence: { type: "string", enum: ["high", "medium", "low", "text_only", "no_api_key"] },
            },
            required: ["extracted_title", "extracted_description", "visible_text", "confidence"],
          },
        },
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || "OpenAI vision request failed");
  }

  return JSON.parse(extractOutputText(data));
}

function extractOutputText(data) {
  if (data.output_text) return data.output_text;
  const output = data.output || [];
  for (const item of output) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) return content.text;
      if (content.text) return content.text;
    }
  }
  throw new Error("No text output returned from OpenAI.");
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const filePath = normalize(join(ROOT, requested));

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const data = await readFile(filePath);
    res.writeHead(200, { "Content-Type": MIME[extname(filePath)] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

async function readJsonBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 18 * 1024 * 1024) {
      throw new Error("Request body too large.");
    }
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}
