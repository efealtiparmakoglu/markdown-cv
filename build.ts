#!/usr/bin/env node
/* Live preview build: strips ui.ts + markdown.ts into an editor page
 * where you type markdown on the left and see the themed CV on the
 * right. Single-file, offline. */

import { stripTypeScriptTypes } from "node:module";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const ROOT = new URL(".", import.meta.url).pathname;

const coreJs = stripTypeScriptTypes(readFileSync(ROOT + "src/markdown.ts", "utf8"), {
  mode: "strip",
});
const renderJs = stripTypeScriptTypes(readFileSync(ROOT + "src/render.ts", "utf8"), {
  mode: "strip",
});
let appJs = stripTypeScriptTypes(readFileSync(ROOT + "src/editor.ts", "utf8"), {
  mode: "strip",
});
appJs = appJs.replace(/^import\s*{[\s\S]*?}\s*from\s*"\.\/render\.ts";\n/m, "");
appJs = "// markdown.ts + render.ts (inlined)\n" + coreJs + "\n" + renderJs + "\n" + appJs;
// strip-mode keeps import statements; the combined bundle has everything,
// so drop any remaining local .ts imports
appJs = appJs.replace(/^import\s*{[\s\S]*?}\s*from\s*"\.\/[\w-]+\.ts";\n/gm, "");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>markdown-cv editor — offline</title>
<style>
  :root { color-scheme: dark; }
  body {
    font-family: ui-monospace, monospace;
    background: #101418; color: #d7dde3;
    margin: 0; padding: 16px; display: flex; flex-direction: column; gap: 10px;
  }
  h1 { font-size: 18px; margin: 0; }
  .row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .cols { display: flex; gap: 14px; align-items: stretch; }
  textarea {
    width: 46vw; height: 78vh; font: inherit; font-size: 13px;
    background: #1b2129; color: #d7dde3; border: 1px solid #2c343c;
  }
  iframe {
    width: 46vw; height: 78vh; background: white;
    border: 1px solid #2c343c;
  }
  select, button {
    font: inherit; background: #1b2129; color: #d7dde3;
    border: 1px solid #2c343c; padding: 5px 10px; cursor: pointer;
  }
  #download { display: none; }
</style>
</head>
<body>
  <h1>markdown-cv editor <small>(offline)</small></h1>
  <div class="row noprint">
    <select id="theme">
      <option value="classic">classic</option>
      <option value="modern">modern</option>
      <option value="mono">mono</option>
    </select>
    <label><input type="checkbox" id="compact"> compact (one page)</label>
    <button id="save">save HTML</button>
  </div>
  <div class="cols">
    <textarea id="input" spellcheck="false"></textarea>
    <iframe id="preview" title="preview"></iframe>
  </div>
<script type="module">
${appJs}
</script>
</body>
</html>`;

mkdirSync(ROOT + "dist", { recursive: true });
writeFileSync(ROOT + "dist/index.html", html);
console.log(`dist/index.html written (${html.length} bytes) — live editor, works offline`);
