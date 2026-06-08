# 虚拟产品风险评测工具

这是一个纯静态网页 MVP，用于评测虚拟产品截图和商品文案的违规风险。

当前免费版不需要服务器、不需要海外网络、不调用 OpenAI。截图只用于预览，学员需要把截图里的商品标题、详情页文字粘贴到输入框后再评测。

## 运行

直接打开 `index.html`，或用任意静态服务器预览：

```bash
node app/server.mjs
```

打开：

```text
http://127.0.0.1:4173
```

## 免费部署

### GitHub Pages

1. 新建一个 GitHub 仓库。
2. 上传 `index.html` 和 `app/` 文件夹。
3. 进入仓库 `Settings` -> `Pages`。
4. Source 选择 `Deploy from a branch`。
5. Branch 选择 `main`，目录选择 `/root`。
6. 保存后等待 GitHub 生成访问链接。

### Cloudflare Pages

1. 登录 Cloudflare。
2. 进入 `Workers & Pages` -> `Create` -> `Pages`。
3. 连接 GitHub 仓库。
4. Framework preset 选择 `None`。
5. Build command 留空。
6. Output directory 填 `/`。
7. 部署完成后使用 Cloudflare 给出的免费域名。

## 自动识图升级

如果以后要支持上传截图后自动识别文字，需要增加后端服务，并接入 OpenAI 视觉模型。免费静态部署不能安全保存 API key，所以不建议在前端直接放 key。

## 规则位置

核心规则在：

```text
app/riskEngine.js
```

每条规则包含：

- 风险标签
- 权重分数
- 命中词
- 风险原因
- 优化建议

## 测试

```bash
node --test app/riskEngine.test.mjs
```
