import { test } from "node:test";
import assert from "node:assert/strict";
import { convert, extractName, inline, escapeHtml } from "../src/markdown.ts";
import { renderPage } from "../src/render.ts";

const SAMPLE = `# Ada Lovelace
ada@example.com | +90 555 0101

## Experience

- **Senior Engineer** at Analytical Engines (1843-1852)
  - wrote the first algorithm
  - saw the *potential* beyond calculation

## Skills

1. mathematics
2. note-taking
3. \`mechanical looms\`

---

[Portfolio](https://ada.example)`;

test("escapeHtml escapes entities", () => {
  assert.equal(escapeHtml("<b>&"), "&lt;b&gt;&amp;");
});

test("inline: bold, italic, code, links", () => {
  assert.equal(inline("**bold** and *em*"), "<strong>bold</strong> and <em>em</em>");
  assert.equal(inline("`x = 1`"), "<code>x = 1</code>");
  assert.equal(
    inline("[site](https://x.example)"),
    '<a href="https://x.example">site</a>',
  );
});

test("inline escapes html before styling", () => {
  const html = inline("<script>alert(1)</script>");
  assert.ok(!html.includes("<script>"), html);
  assert.ok(html.includes("&lt;script&gt;"));
});

test("convert: headings, lists, paragraph, rule", () => {
  const { html, headings } = convert(SAMPLE);
  assert.ok(html.includes('<h1 id="ada-lovelace">Ada Lovelace</h1>'));
  assert.ok(html.includes("<h2"), "experience heading");
  assert.ok(html.includes("<strong>Senior Engineer</strong>"));
  assert.ok(html.includes("<em>potential</em>"));
  assert.ok(html.includes("<code>mechanical looms</code>"));
  assert.ok(html.includes("<ul>"));
  assert.ok(html.includes("<ol>"));
  assert.ok(html.includes("<hr>"));
  assert.ok(html.includes("<p>ada@example.com | +90 555 0101</p>"));
  assert.equal(headings.length, 3);
  assert.deepEqual(headings.map((h) => h.level), [1, 2, 2]);
});

test("extractName picks the first h1", () => {
  assert.equal(extractName(SAMPLE), "Ada Lovelace");
  assert.equal(extractName("no heading here"), "Curriculum Vitae");
});

test("renderPage wraps in a themed document", () => {
  const page = renderPage(SAMPLE, { theme: "modern", compact: false });
  assert.ok(page.startsWith("<!doctype html>"));
  assert.ok(page.includes("<title>Ada Lovelace</title>"));
  assert.ok(page.includes("#0f766e"), "modern accent color");
  assert.ok(page.includes("Ada Lovelace"));
});

test("three themes produce different css", () => {
  const pages = (["classic", "modern", "mono"] as const).map((theme) =>
    renderPage(SAMPLE, { theme, compact: false }),
  );
  const unique = new Set(pages);
  assert.equal(unique.size, 3);
});

test("compact mode shrinks and adds print zoom", () => {
  const normal = renderPage(SAMPLE, { theme: "classic", compact: false });
  const compact = renderPage(SAMPLE, { theme: "classic", compact: true });
  assert.ok(compact.includes("zoom"), "compact must use zoom");
  assert.ok(!normal.includes("zoom: 0.82"));
});

test("print media rules present", () => {
  const page = renderPage(SAMPLE, { theme: "classic", compact: true });
  assert.ok(page.includes("@media print"));
});
