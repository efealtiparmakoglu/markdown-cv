/* Editor logic: markdown textarea -> themed iframe preview, save button.
 * The preview document carries the print styles, so Ctrl+P inside the
 * iframe produces the PDF. renderPage comes from render.ts (inlined by
 * the single-file build). */

import { extractName, renderPage } from "./render.ts";

const SAMPLE = `# Your Name
you@example.com | +90 555 0101 | [site](https://example.com)

## Experience

- **Role** at Company (2020-2026)
  - what you built
  - what you *shipped*

## Skills

1. skill one
2. skill two

---

## References

Available on request.`;

let theme: ThemeName = "classic";
let compact = false;
let lastHtml = "";
let lastName = "cv";

function renderPreview(): void {
  const input = document.getElementById("input") as HTMLTextAreaElement;
  const frame = document.getElementById("preview") as HTMLIFrameElement;
  lastHtml = renderPage(input.value, { theme, compact, title: extractName(input.value) });
  lastName = extractName(input.value) || "cv";
  const doc = frame.contentDocument;
  if (doc) {
    doc.open();
    doc.write(lastHtml);
    doc.close();
  }
  document.title = `${lastName} — markdown-cv`;
  try {
    localStorage.setItem("markdown-cv-input", input.value);
    localStorage.setItem("markdown-cv-theme", theme);
    localStorage.setItem("markdown-cv-compact", compact ? "1" : "0");
  } catch {
    /* private mode */
  }
}

function setup(): void {
  const input = document.getElementById("input") as HTMLTextAreaElement;
  input.value = localStorage.getItem("markdown-cv-input") ?? SAMPLE;
  theme = (localStorage.getItem("markdown-cv-theme") as ThemeName) ?? "classic";
  compact = localStorage.getItem("markdown-cv-compact") === "1";
  (document.getElementById("theme") as HTMLSelectElement).value = theme;
  (document.getElementById("compact") as HTMLInputElement).checked = compact;

  const repaint = (): void => {
    theme = (document.getElementById("theme") as HTMLSelectElement).value as ThemeName;
    compact = (document.getElementById("compact") as HTMLInputElement).checked;
    renderPreview();
  };
  document.getElementById("theme")?.addEventListener("change", repaint);
  document.getElementById("compact")?.addEventListener("change", repaint);
  document.getElementById("save")?.addEventListener("click", () => {
    const blob = new Blob([lastHtml], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${lastName}.html`;
    link.click();
  });
  input.addEventListener("input", renderPreview);
  try {
    renderPreview();
  } catch (error) {
    document.body.dataset.error = String(error);
  }
  document.body.dataset.qa =
    `preview=${document.getElementById("preview") ? "yes" : "no"}`;
}

if (typeof document !== "undefined" && document.getElementById("input")) {
  setup();
}
