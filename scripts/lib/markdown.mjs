/**
 * A small Markdown renderer for the blog, with no dependencies. It supports what a post needs:
 * headings, paragraphs, bullet and numbered lists, block quotes, fenced code, rules, links, images,
 * bold, italic and inline code. All text is HTML-escaped, and link addresses are limited to
 * http(s), mailto, relative paths and #anchors, so a post can never inject script.
 */
export const esc = (t) =>
  String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const safeUrl = (u) => (/^(https?:|mailto:|\/|\.{1,2}\/|#)/i.test(u) || /^[\w./-]+$/.test(u) ? u : '#');

export const slugify = (t) =>
  String(t)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

function inline(text) {
  const codes = [];
  let out = text.replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c);
    return `\u0000${codes.length - 1}\u0000`;
  });
  out = esc(out);
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, u) => `<img src="${safeUrl(u)}" alt="${alt}" loading="lazy" />`);
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, u) => {
    const external = /^https?:/i.test(u);
    return `<a href="${safeUrl(u)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>');
  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[Number(i)])}</code>`);
}

/** Splits `---` front matter from the body. Values are plain strings; `tags` becomes a list. */
export function parseFrontMatter(source) {
  const m = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: source };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!kv) continue;
    const v = kv[2].trim().replace(/^["']|["']$/g, '');
    if (kv[1] === 'tags') meta.tags = v.replace(/^\[|\]$/g, '').split(',').map((t) => t.trim()).filter(Boolean);
    else meta[kv[1]] = v;
  }
  return { meta, body: m[2] };
}

export function render(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let para = [];
  let list = null; // { tag, items }
  let quote = [];
  let code = null; // { lang, lines }

  const flushPara = () => {
    if (para.length) html.push(`<p>${inline(para.join(' '))}</p>`);
    para = [];
  };
  const flushList = () => {
    if (list) html.push(`<${list.tag}>${list.items.map((i) => `<li>${inline(i)}</li>`).join('')}</${list.tag}>`);
    list = null;
  };
  const flushQuote = () => {
    if (quote.length) html.push(`<blockquote><p>${inline(quote.join(' '))}</p></blockquote>`);
    quote = [];
  };
  const flushAll = () => {
    flushPara();
    flushList();
    flushQuote();
  };

  for (const line of lines) {
    if (code) {
      if (/^```\s*$/.test(line)) {
        html.push(`<pre><code${code.lang ? ` class="language-${esc(code.lang)}"` : ''}>${esc(code.lines.join('\n'))}</code></pre>`);
        code = null;
      } else code.lines.push(line);
      continue;
    }
    const fence = line.match(/^```\s*([\w+-]*)\s*$/);
    if (fence) {
      flushAll();
      code = { lang: fence[1], lines: [] };
      continue;
    }
    if (!line.trim()) {
      flushAll();
      continue;
    }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      flushAll();
      const level = Math.min(4, Math.max(2, h[1].length + (h[1].length === 1 ? 1 : 0))); // the page title is the h1
      html.push(`<h${level} id="${slugify(h[2])}">${inline(h[2])}</h${level}>`);
      continue;
    }
    if (/^(-{3,}|\*{3,})\s*$/.test(line)) {
      flushAll();
      html.push('<hr />');
      continue;
    }
    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    const ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (ul || ol) {
      flushPara();
      flushQuote();
      const tag = ul ? 'ul' : 'ol';
      if (list && list.tag !== tag) flushList();
      list = list || { tag, items: [] };
      list.items.push((ul || ol)[1]);
      continue;
    }
    const q = line.match(/^>\s?(.*)$/);
    if (q) {
      flushPara();
      flushList();
      quote.push(q[1]);
      continue;
    }
    flushList();
    flushQuote();
    para.push(line.trim());
  }
  if (code) html.push(`<pre><code>${esc(code.lines.join('\n'))}</code></pre>`);
  flushAll();
  return html.join('\n');
}

/** Words in the Markdown, ignoring code, for a reading-time estimate. */
export const wordCount = (markdown) => markdown.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length;
