/* Markdown → HTML converter, scoped to the constructs a CV uses:
 * headings, paragraphs, bullet/numbered lists, bold/italic/inline-code,
 * links, horizontal rules. Zero dependencies. */

export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function inline(text: string): string {
  let out = escapeHtml(text);
  // inline code first (protect from other substitutions)
  out = out.replace(/`([^`]+)`/g, (_m, code: string) => `<code>${code}</code>`);
  // bold then italic
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  // links [text](url)
  out = out.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_m, label: string, url: string) => `<a href="${url}">${label}</a>`,
  );
  return out;
}

export interface Heading {
  level: number;
  text: string;
  id: string;
}

export interface ConvertResult {
  html: string;
  headings: Heading[];
}

/** Convert Markdown text to an HTML fragment. */
export function convert(markdown: string): ConvertResult {
  const lines = markdown.split("\n");
  const out: string[] = [];
  const headings: Heading[] = [];
  let listOpen: "ul" | "ol" | null = null;
  let paragraph: string[] = [];

  const closeList = (): void => {
    if (listOpen) {
      out.push(`</${listOpen}>`);
      listOpen = null;
    }
  };
  const closeParagraph = (): void => {
    if (paragraph.length > 0) {
      out.push(`<p>${inline(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };
  const slug = (text: string): string =>
    text.toLowerCase().replaceAll(" ", "-").replace(/[^\w-]/g, "");

  for (const raw of lines) {
    const line = raw.trimEnd();
    // headings
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      closeParagraph();
      closeList();
      const level = heading[1]!.length;
      const text = inline(heading[2] as string);
      const id = slug(heading[2] as string);
      headings.push({ level, text: heading[2] as string, id });
      out.push(`<h${level} id="${id}">${text}</h${level}>`);
      continue;
    }
    // horizontal rule
    if (/^---+\s*$/.test(line)) {
      closeParagraph();
      closeList();
      out.push("<hr>");
      continue;
    }
    // bullets
    if (/^[-*]\s+/.test(line)) {
      closeParagraph();
      if (listOpen !== "ul") {
        closeList();
        out.push("<ul>");
        listOpen = "ul";
      }
      out.push(`<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`);
      continue;
    }
    // numbered list
    const numbered = /^\d+\.\s+(.*)$/.exec(line);
    if (numbered) {
      closeParagraph();
      if (listOpen !== "ol") {
        closeList();
        out.push("<ol>");
        listOpen = "ol";
      }
      out.push(`<li>${inline(numbered[1] as string)}</li>`);
      continue;
    }
    // blank line closes the paragraph
    if (line.trim() === "") {
      closeParagraph();
      continue;
    }
    // contact line (starts with an email or phone indicator) stays plain
    paragraph.push(line.trim());
  }
  closeParagraph();
  closeList();
  return { html: out.join("\n"), headings };
}

/** Extract the person's name: first level-1 heading. */
export function extractName(markdown: string): string {
  const heading = /^#\s+(.+)$/m.exec(markdown);
  return heading ? (heading[1] as string) : "Curriculum Vitae";
}
