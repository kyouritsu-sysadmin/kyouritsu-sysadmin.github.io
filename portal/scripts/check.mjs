import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(
  fs.readFileSync(path.join(root, "portal.config.json"), "utf8"),
);
const output = process.env.BUILD_DIR || path.join(root, "dist");
let assetDirectory;
for (const locale of ["en", "ja"]) {
  const html = fs.readFileSync(
    path.join(output, locale === "ja" ? "ja/index.html" : "index.html"),
    "utf8",
  );
  const assetPath = html.match(/href="(\/assets\/[a-f0-9]{16})\/styles\.css"/)?.[1];
  assert(assetPath, "Homepage must load content-versioned styles");
  const directory = path.join(output, assetPath);
  if (assetDirectory) assert.equal(directory, assetDirectory, "Locales must share the same asset version");
  assetDirectory = directory;
  assert(html.includes(`src="${assetPath}/logo.svg"`), "Logo must use the same asset version");
  assert(html.includes(`<html lang="${locale}">`));
  assert(
    html.includes(`href="${locale === "ja" ? "/manuals/ja/" : "/manuals/"}"`),
    "Manuals must lead to the existing library",
  );
  assert.equal((html.match(/<article /g) || []).length, config.cards.length);
  assert.equal(
    (html.match(/type="button" disabled/g) || []).length,
    config.cards.filter((card) => card.status === "planned").length,
  );
  assert(!html.includes("undefined"));
  for (const asset of [
    "styles.css",
    "theme.css",
    "fonts/fonts.css",
    "logo.svg",
  ])
    assert(fs.existsSync(path.join(assetDirectory, asset)));
}
const fontStyles = fs.readFileSync(
  path.join(assetDirectory, "fonts/fonts.css"),
  "utf8",
);
for (const [, file] of fontStyles.matchAll(/url\(\.\/([^)]*)\)/g)) {
  const font = fs.readFileSync(path.join(assetDirectory, "fonts", file));
  assert.equal(
    font.subarray(0, 4).toString(),
    "wOF2",
    `Missing or invalid font: ${file}`,
  );
}
assert(fs.existsSync(path.join(output, ".nojekyll")));
console.log(
  "Verified both home pages, Manuals destinations, planned card states, and assets.",
);
