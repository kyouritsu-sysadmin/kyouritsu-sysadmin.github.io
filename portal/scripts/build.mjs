import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(
  fs.readFileSync(path.join(root, "portal.config.json"), "utf8"),
);
const output = path.join(root, "dist");
const text = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
const labels = {
  en: {
    title: "Home",
    skip: "Skip to content",
    workspace: "Internal site",
    heading: "Company resources",
    intro:
      "Reference material for Kyoritsu staff. The document library is available now; other sections will be added as their content is prepared.",
    resources: "Sections",
    available: "Available",
    planned: "In preparation",
    open: "Open",
    navigation: "Main navigation",
    language: "Language",
    note: "Content is maintained by each department. Contact System Administration to publish or correct a document.",
    footer: "Kyoritsu · Company resources",
    maintained: "Maintained by System Administration",
    home: "Home",
    manuals: "Manuals",
    section: "1 of 4 available",
    quick: "Direct links",
    libraryEn: "Document library (English)",
    libraryJa: "Document library (日本語)",
    guide: "How to use the library",
  },
  ja: {
    title: "ホーム",
    skip: "本文へスキップ",
    workspace: "社内サイト",
    heading: "社内リソース",
    intro:
      "共立の社員向け参照資料です。資料ライブラリは利用できます。その他のセクションは、内容の準備が整い次第追加します。",
    resources: "セクション",
    available: "利用可能",
    planned: "準備中",
    open: "開く",
    navigation: "メインナビゲーション",
    language: "言語",
    note: "内容は各部門が管理しています。資料の公開や修正はシステム管理までご連絡ください。",
    footer: "共立 · 社内リソース",
    maintained: "システム管理が管理",
    home: "ホーム",
    manuals: "マニュアル",
    section: "4件中1件が利用可能",
    quick: "直接リンク",
    libraryEn: "資料ライブラリ（English）",
    libraryJa: "資料ライブラリ（日本語）",
    guide: "ライブラリの使い方",
  },
};
const icons = {
  training: '<path d="m2 9 11-5 11 5-11 5zM6 11v7c4 4 10 4 14 0v-7M24 9v9"/>',
  map: '<path d="m3 6 7-3 6 3 7-3v18l-7 3-6-3-7 3zM10 3v18M16 6v18"/>',
  book: '<path d="M4 5h6a3 3 0 0 1 3 3v13a4 4 0 0 0-4-2H4zM22 5h-6a3 3 0 0 0-3 3v13a4 4 0 0 1 4-2h5z"/>',
  file: '<path d="M7 3h9l5 5v15H7zM16 3v6h5M10 13h8M10 17h6"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="15" y="4" width="7" height="7" rx="1"/><rect x="4" y="15" width="7" height="7" rx="1"/><rect x="15" y="15" width="7" height="7" rx="1"/>',
};
const ids = new Set();
for (const card of config.cards) {
  if (!/^[a-z0-9-]+$/.test(card.id) || ids.has(card.id))
    throw new Error(`Invalid/duplicate card ID: ${card.id}`);
  ids.add(card.id);
  if (!["available", "planned"].includes(card.status) || !icons[card.icon])
    throw new Error(`Invalid card: ${card.id}`);
  for (const locale of ["en", "ja"]) {
    if (!card.title?.[locale] || !card.description?.[locale])
      throw new Error(`Missing ${locale} card text: ${card.id}`);
    if (
      card.status === "available" &&
      (!card.button?.[locale] ||
        !/^(\/(?!\/)|https:\/\/)/.test(card.href?.[locale] || ""))
    )
      throw new Error(`Missing or unsafe card link: ${card.id}`);
  }
}
function cardMarkup(card, locale) {
  const available = card.status === "available";
  const ui = labels[locale];
  const arrow =
    '<span aria-hidden="true"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg></span>';
  return `<article class="resource-card ${available ? "available" : "planned"}" aria-labelledby="${card.id}-title">
    <div class="card-top"><div class="card-icon"><svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">${icons[card.icon]}</svg></div><span class="status ${available ? "live" : ""}">${ui[card.status]}</span></div>
    <h3 id="${card.id}-title">${text(card.title[locale])}</h3><p>${text(card.description[locale])}</p>
    <div class="card-action">${available ? `<a class="button" href="${text(card.href[locale])}">${text(card.button[locale])}${arrow}</a>` : `<button class="button" type="button" disabled aria-describedby="${card.id}-title">${ui.planned}</button>`}</div>
  </article>`;
}
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(path.join(output, "assets"), { recursive: true });
for (const file of ["styles.css", "theme.css", "logo.svg"])
  fs.copyFileSync(
    path.join(root, "src", file),
    path.join(output, "assets", file),
  );
fs.cpSync(path.join(root, "src/fonts"), path.join(output, "assets/fonts"), {
  recursive: true,
});
fs.writeFileSync(path.join(output, ".nojekyll"), "");
for (const locale of ["en", "ja"]) {
  const ui = labels[locale];
  const home = locale === "ja" ? "/ja/" : "/";
  const manuals = locale === "ja" ? "/manuals/ja/" : "/manuals/";
  const html = `<!doctype html>
<html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${ui.title} | Kyoritsu</title><meta name="description" content="${text(ui.intro)}"><link rel="canonical" href="${text(config.siteUrl + home)}"><link rel="alternate" hreflang="en" href="${text(config.siteUrl)}/"><link rel="alternate" hreflang="ja" href="${text(config.siteUrl)}/ja/"><link rel="icon" type="image/svg+xml" href="/assets/logo.svg"><link rel="stylesheet" href="/assets/styles.css"></head>
<body><a class="skip-link" href="#main">${ui.skip}</a>
<header class="site-header"><div class="header-inner"><a class="brand" href="${home}" aria-label="Kyoritsu ${ui.home}"><img src="/assets/logo.svg" width="34" height="34" alt=""><span>${text(config.name)}</span></a><nav aria-label="${ui.navigation}"><a href="${home}" class="active" aria-current="page">${ui.home}</a><a href="${manuals}">${ui.manuals}</a></nav><div class="language" role="group" aria-label="${ui.language}"><a href="/" lang="en" ${locale === "en" ? 'aria-current="page"' : ""}>EN</a><span aria-hidden="true">/</span><a href="/ja/" lang="ja" ${locale === "ja" ? 'aria-current="page"' : ""}>日本語</a></div></div></header>
<main id="main"><section class="hero" aria-labelledby="welcome"><div><p class="eyebrow">${ui.workspace}</p><h1 id="welcome">${ui.heading}</h1><p class="intro">${ui.intro}</p></div><p class="hero-detail"><span></span>${ui.note}</p><aside class="quick-links" aria-labelledby="quick"><h2 id="quick">${ui.quick}</h2><ul><li><a href="/manuals/" hreflang="en">${ui.libraryEn}</a></li><li><a href="/manuals/ja/" hreflang="ja">${ui.libraryJa}</a></li><li><a href="${locale === "ja" ? "/manuals/ja/sales/guides/getting-started/" : "/manuals/sales/guides/getting-started/"}">${ui.guide}</a></li></ul></aside></section>
<section class="resources" aria-labelledby="resources"><div class="section-heading"><h2 id="resources">${ui.resources}</h2><span>${ui.section}</span></div><div class="card-grid">${config.cards.map((card) => cardMarkup(card, locale)).join("\n")}</div></section>
</main><footer><div><span>${ui.footer}</span><span>${ui.maintained}</span></div></footer></body></html>`;
  const directory = path.join(output, locale === "ja" ? "ja" : "");
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, "index.html"), html);
}
console.log(
  `Built English and Japanese home pages with ${config.cards.length} resource cards in portal/dist.`,
);
