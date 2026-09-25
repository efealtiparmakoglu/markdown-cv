# markdown-cv

Markdown CV → themed single-file HTML → PDF via the browser's print
dialog. Zero dependencies: the Markdown converter is hand-written for
the constructs a CV uses, and the single-file editor build uses Node's
native TypeScript stripping.

```text
$ npm test                    # 9 tests
$ npm run build               # live editor -> dist/index.html
$ node src/cli.ts cv.md -o cv.html --theme modern -c
cv.html written (modern, compact) — print to PDF from any browser
```

## Converter scope

Hand-written for CV constructs: `#`/`##`/`###` headings (anchored),
bullet + numbered lists, `**bold**`, `*italic*`, `` `code` `` ,
`[links](url)`, `---` rules, plain paragraphs. Inline HTML in the
source is escaped before styling — a `<script>` in the CV can't inject
anything.

## Themes & one-page mode

Three built-in themes — **classic** (serif), **modern** (sans, teal
accent), **mono** (monospace) — each with accent color, font and rule
styling. `--compact` shrinks spacing and zooms slightly so long CVs
print on a single page; print media rules keep headings with their
content and avoid splitting list items.

## CLI + live editor

The CLI converts files. `npm run build` also produces a live editor
page: type Markdown on the left, watch the themed CV update on the
right, "save HTML" downloads the result. Everything runs offline.

## Development

```console
$ npm test
$ npm run build
$ node src/cli.ts sample.md -o sample.html --theme mono
```

## License

MIT — see [LICENSE](LICENSE).
