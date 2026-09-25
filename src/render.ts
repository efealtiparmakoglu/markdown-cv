/* Page assembly: wrap converted HTML in a themed, print-ready document.
 * "compact" mode shrinks type/spacing so long CVs print on one page. */

import { convert, extractName, type ConvertResult } from "./markdown.ts";

export type ThemeName = "classic" | "modern" | "mono";

interface ThemeStyle {
  accent: string;
  font: string;
  headingSize: string;
  background: string;
  text: string;
  ruleStyle: string;
}

const THEMES: Record<ThemeName, ThemeStyle> = {
  classic: {
    accent: "#1a3c6e",
    font: "Georgia, 'Times New Roman', serif",
    headingSize: "20px",
    background: "#ffffff",
    text: "#1a1a1a",
    ruleStyle: "1px solid #1a3c6e",
  },
  modern: {
    accent: "#0f766e",
    font: "system-ui, -apple-system, sans-serif",
    headingSize: "22px",
    background: "#fbfdfb",
    text: "#14201d",
    ruleStyle: "2px solid #0f766e",
  },
  mono: {
    accent: "#333333",
    font: "ui-monospace, 'Cascadia Mono', monospace",
    headingSize: "18px",
    background: "#fefefe",
    text: "#222222",
    ruleStyle: "1px dashed #333333",
  },
};

export interface PageOptions {
  theme: ThemeName;
  compact: boolean;
  title?: string;
}

export function renderPage(markdown: string, options: PageOptions): string {
  const style = THEMES[options.theme] ?? THEMES.classic;
  const result: ConvertResult = convert(markdown);
  const name = options.title ?? extractName(markdown);
  const scale = options.compact ? "compact" : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${name}</title>
<style>
  body {
    font-family: ${style.font};
    background: ${style.background};
    color: ${style.text};
    max-width: 780px;
    margin: 0 auto;
    padding: 32px;
    line-height: 1.5;
  }
  h1 { color: ${style.accent}; font-size: 30px; margin: 0 0 4px; }
  h2 {
    color: ${style.accent}; font-size: ${style.headingSize};
    border-bottom: ${style.ruleStyle};
    padding-bottom: 3px; margin: 22px 0 8px;
  }
  h3 { margin: 14px 0 4px; font-size: 1.02em; }
  p { margin: 6px 0; }
  ul, ol { margin: 6px 0; padding-left: 22px; }
  li { margin: 2px 0; }
  a { color: ${style.accent}; }
  code {
    background: rgba(0,0,0,0.06);
    padding: 1px 5px; border-radius: 3px;
    font-size: 0.92em;
  }
  hr { border: none; border-top: ${style.ruleStyle}; margin: 18px 0; }
  ${options.compact ? ".compact .cv-scaler { zoom: 0.82; }" : ""}
  @media print {
    body { padding: 0; }
    h2 { break-after: avoid; }
    li { break-inside: avoid; }
    ${options.compact ? "body { zoom: 0.8; }" : ""}
  }
</style>
</head>
<body class="${scale}">
<div class="cv-scaler">
${result.html}
</div>
</body>
</html>
`;
}
