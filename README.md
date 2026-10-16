# yankai.cc.cd · 个人作品集站点

纯静态站点：HTML + CSS + 原生 JS，**零依赖、零构建**。托管于 Cloudflare Pages。

```
site/
├─ index.html        首页（所有正文内容都在这里改）
├─ 404.html          错误页
├─ css/style.css     全站样式（含深/浅色主题变量）
├─ js/config.js      ← 站名/域名/邮箱/社交链接，只改这一个文件
├─ js/main.js        交互：主题切换、导航、动画、筛选
├─ _headers          Cloudflare Pages 响应头（安全 + 缓存策略）
├─ robots.txt        爬虫规则
└─ sitemap.xml       站点地图
```

---

## 1. 上线前还需替换的内容

域名（`yankai.cc.cd`）已全部填好。**剩下这几处需要你自己填**：

| 位置 | 当前占位值 | 改成 |
|---|---|---|
| `js/config.js` → `name` | `你的名字` | 你的显示名 |
| `js/config.js` → `handle` | `@yourhandle` | 你的 ID |
| `js/config.js` → `email` | `hi@yankai.cc.cd` | 真实邮箱 |
| `js/config.js` → `socials[0].url` | `github.com/yourname` | 你的 GitHub |
| `index.html` 正文 | 全文 `你的名字` | 同上 |
| `index.html` JSON-LD | `name` / `email` / `sameAs` | 同上 |
| `index.html` 项目/技能/经历 | 占位文案 | 真实内容 |

批量替换：

```bash
cd site
grep -rn "你的名字\|yourname\|yourhandle" .
```

改完全局搜索 `你的名字` 应为 0 结果。

---

## 2. 本地预览

```bash
cd site
python -m http.server 8777
# 打开 http://127.0.0.1:8777
```

---

## 3. 部署到 Cloudflare Pages（域名 yankai.cc.cd）

### 方式一：Git 集成（推荐，改代码自动重新部署）

1. 把 `site/` 内容推到 GitHub 仓库（`site/` 里的文件放仓库根目录）。
2. 打开 <https://dash.cloudflare.com> → 左侧 **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**。
3. 选中该仓库，构建配置填：

   | 项 | 值 |
   |---|---|
   | Production branch | `main` |
   | Framework preset | `None` |
   | Build command | *留空* |
   | Build output directory | `/`（若文件在仓库的 `site/` 子目录，则填 `site`）|

4. **Save and Deploy**，等 30 秒左右拿到 `xxx.pages.dev` 临时地址，先访问确认页面正常。
5. 进入项目 **Custom domains** → **Set up a custom domain** → 输入 `yankai.cc.cd` → Continue。
6. 若你的 DNS 已托管在 Cloudflare（推荐）：会自动加好 CNAME 记录，等待状态变 **Active** 即可，HTTPS 证书自动签发。
   若 DNS 在别处：Cloudflare 会给出一个 CNAME 目标（形如 `xxx.pages.dev`），到你的域名管理后台把 `yankai.cc.cd` 的 **CNAME** 指过去。
7. 建议同时在 Cloudflare 加一条 `www.yankai.cc.cd` 的 CNAME 指向同一目标，并在 Pages 里也添加该自定义域名。

> 免费额度：每月 500 次构建、无限带宽与请求，个人站完全够用。

### 方式二：命令行直传（不接 Git）

```bash
npm i -g wrangler      # 或 npx wrangler
cd site
wrangler login
wrangler pages deploy . --project-name=yankai-site
```

之后在 Cloudflare 后台按上面第 5–7 步绑定域名。

---

## 4. 绑定域名后的检查清单

- [ ] `https://yankai.cc.cd` 能打开，样式/脚本 200
- [ ] `http://` 自动跳 `https://`
- [ ] `https://yankai.cc.cd/404-test` 落到自定义 404 页
- [ ] `https://yankai.cc.cd/robots.txt` 与 `/sitemap.xml` 可访问
- [ ] 手机端打开正常（导航变抽屉菜单）
- [ ] 右上角主题切换按钮可用，刷新后记忆生效
- [ ] 到 [Google Search Console](https://search.google.com/search-console) 提交 `sitemap.xml`

---

## 5. 中国大陆访问说明

- `cc.cd` 域名 + Cloudflare（境外节点）**无法稳定直连大陆**，如需国内访问需换成可备案域名 + 境内服务器并完成 ICP 备案。
- 若日后要转国内：买内地轻量服务器 → 备案 → Nginx 指向站点目录：

```nginx
server {
    listen 80;
    server_name yankai.cc.cd www.yankai.cc.cd;
    root /var/www/site;
    index index.html;
    location / { try_files $uri $uri/ /404.html; }
}
```

`certbot --nginx -d yankai.cc.cd` 一键签 HTTPS。

---

## 6. 后续可选增强

- 加博客：新建 `blog/` 目录，复用 `css/style.css`，每篇一个 HTML，并把链接加进 `sitemap.xml`。
- 访问统计：Cloudflare Web Analytics（免费、无 Cookie）——在 Pages 项目里一键开启。
- 联系表单：静态站无后端，接 Formspree / Cloudflare Workers，或继续用 `mailto:`。
- 分享封面：放一张 `assets/og-cover.png`（1200×630），已是 `index.html` 里 `og:image` 的引用路径。
