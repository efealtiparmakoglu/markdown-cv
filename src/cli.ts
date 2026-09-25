#!/usr/bin/env node
/* CLI: markdown-cv <input.md> [-o out.html] [-t theme] [-c] */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { renderPage, type ThemeName } from "./render.ts";

const USAGE = `markdown-cv v1.0.0 — Markdown CV to themed single-file HTML

USAGE
  markdown-cv <input.md> [options]

OPTIONS
  -o, --out <file>      output HTML (default: <input>.html)
  -t, --theme <name>    classic | modern | mono (default: classic)
  -c, --compact         shrink spacing so long CVs fit one page
  -h, --help            show this help
  -V, --version         print version

Print to PDF with the browser (Ctrl+P / Cmd+P) — the output carries
print-optimized styles. No external services.`;

function fail(message: string): never {
  console.error(`markdown-cv: ${message}`);
  console.error(`markdown-cv: run 'markdown-cv --help' for usage`);
  process.exit(2);
}

const THEMES: ThemeName[] = ["classic", "modern", "mono"];

function main(argv: string[]): void {
  let input: string | null = null;
  let output: string | null = null;
  let theme: ThemeName = "classic";
  let compact = false;
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i] as string;
    const value = (): string => {
      i += 1;
      const next = argv[i];
      if (next === undefined) fail(`${arg} requires a value`);
      return next as string;
    };
    switch (arg) {
      case "-o":
      case "--out":
        output = value();
        break;
      case "-t":
      case "--theme": {
        const raw = value();
        if (!THEMES.includes(raw as ThemeName)) {
          fail(`unknown theme "${raw}" (classic | modern | mono)`);
        }
        theme = raw as ThemeName;
        break;
      }
      case "-c":
      case "--compact":
        compact = true;
        break;
      case "-h":
      case "--help":
        console.log(USAGE);
        return;
      case "-V":
      case "--version":
        console.log("markdown-cv 1.0.0");
        return;
      default:
        if (arg.startsWith("-")) fail(`unknown option "${arg}"`);
        if (input) fail(`unexpected extra argument "${arg}"`);
        input = arg;
    }
    i += 1;
  }
  if (!input) fail("missing input markdown file");
  if (!existsSync(input)) fail(`input file not found: ${input}`);

  const markdown = readFileSync(input, "utf8");
  const outPath = output ?? input.replace(/\.md$/i, "") + ".html";
  writeFileSync(outPath, renderPage(markdown, { theme, compact }));
  console.log(
    `${outPath} written (${theme}${compact ? ", compact" : ""}) — print to PDF from any browser`,
  );
}

main(process.argv.slice(2));
