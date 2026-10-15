import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { run, productionEnv } from "./shared.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "_site");
run(process.execPath, ["scripts/check.mjs"], path.join(root, "portal"), {
  ...productionEnv,
  BUILD_DIR: output,
});
run("npm", ["run", "check:build"], path.join(root, "my-docs"), {
  ...productionEnv,
  BUILD_DIR: path.join(output, "manuals"),
});
for (const route of ["", "ja", "manuals", "manuals/ja"]) {
  const html = fs.readFileSync(path.join(output, route, "index.html"), "utf8");
  assert(!/https?:\/\/(localhost|127\.0\.0\.1)(?=[:/])/.test(html), `Preview URL in ${route}`);
  // Validate root-relative links and assets against the combined artifact.
  for (const [, href] of html.matchAll(/(?:href|src)="(\/[^"#?]*)[^"]*"/g)) {
    if (href.startsWith("//")) continue;
    const target = path.join(output, decodeURIComponent(href));
    assert(fs.existsSync(target), `Missing local destination in ${route}: ${href}`);
    if (fs.statSync(target).isDirectory())
      assert(fs.existsSync(path.join(target, "index.html")), `Missing page: ${href}`);
  }
}
assert(fs.existsSync(path.join(output, "404.html")));
assert(fs.existsSync(path.join(output, ".nojekyll")));
console.log("Verified combined homepage/manuals routes, assets, and production URLs.");
