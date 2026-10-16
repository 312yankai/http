/**
 * 全站配置：只放「改一次、到处生效」的东西。
 * 页面正文内容直接写在 index.html 里（利于 SEO 与无 JS 环境）。
 *
 * ⚠️ 上线前需要替换的字段：name / domain / email / socials
 */
window.SITE_CONFIG = {
  // 站点与个人
  name: "Yankai",
  handle: "@312yankai",
  jobTitle: "独立开发者 · 工具作者",
  domain: "yankai.cc.cd",          // 不带动 http(s)://
  url: "https://yankai.cc.cd",     // 与 domain 保持一致
  email: "hi@yankai.cc.cd",
  location: "中国",

  // SEO
  title: "Yankai · 作品集",
  description: "个人作品集与技术工具展示：自动化脚本、逆向工具、数据可视化。",

  // 社交与外部链接（顺序即展示顺序，icon 可选：github / mail / rss / link）
  socials: [
    { label: "GitHub", url: "https://github.com/312yankai", icon: "github" },
    { label: "邮箱",   url: "mailto:hi@yankai.cc.cd",      icon: "mail" },
    { label: "博客",   url: "https://yankai.cc.cd/blog",   icon: "rss" }
  ]
};
