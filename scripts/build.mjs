import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run } from "./shared.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "_site");
// Never allow an old or partially built artifact to be published.
fs.rmSync(output, { recursive: true, force: true });
run("npm", ["run", "typecheck"], path.join(root, "my-docs"));
run("npm", ["run", "build"], path.join(root, "portal"));
run("npm", ["run", "build"], path.join(root, "my-docs"));
try {
  fs.cpSync(path.join(root, "portal/dist"), output, { recursive: true });
  fs.cpSync(path.join(root, "my-docs/build"), path.join(output, "manuals"), {
    recursive: true,
  });
  // GitHub Pages looks for the custom error page at the artifact root.
  fs.copyFileSync(path.join(output, "manuals/404.html"), path.join(output, "404.html"));
  run(process.execPath, ["scripts/check.mjs"], root);
} catch (error) {
  fs.rmSync(output, { recursive: true, force: true });
  throw error;
}
console.log("Combined production site ready in _site/.");
