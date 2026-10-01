const FORBIDDEN_BLOCKS = /<(script|style|iframe|object|embed|form|meta|link)[^>]*>[\s\S]*?<\/\1\s*>/gi;
const FORBIDDEN_SINGLE_TAGS = /<(script|style|iframe|object|embed|form|input|button|meta|link)\b[^>]*\/?\s*>/gi;
const EVENT_ATTRIBUTES = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const SCRIPT_URLS = /\s+(href|src)\s*=\s*(["'])\s*(?:javascript|data):[^"']*\2/gi;

export function sanitizeRichText(value: string): string {
  return value
    .replace(FORBIDDEN_BLOCKS, '')
    .replace(FORBIDDEN_SINGLE_TAGS, '')
    .replace(EVENT_ATTRIBUTES, '')
    .replace(SCRIPT_URLS, '');
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function inlineMarkdown(value: string): string {
  return value
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>')
    .replace(/(?<!_)_([^_\n]+?)_(?!_)/g, '<em>$1</em>');
}

export function markdownToHtml(value: string): string {
  if (!value.trim()) return '';
  const lines = escapeHtml(value).split(/\r?\n/);
  const output: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const closeList = () => {
    if (listType) output.push(`</${listType}>`);
    listType = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const unordered = line.match(/^\s*[-*]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+\.\s+(.+)$/);
    const nextList = unordered ? 'ul' : ordered ? 'ol' : null;
    if (nextList) {
      if (listType !== nextList) {
        closeList();
        output.push(`<${nextList}>`);
        listType = nextList;
      }
      output.push(`<li>${inlineMarkdown((unordered?.[1] ?? ordered?.[1])!)}</li>`);
      continue;
    }

    closeList();
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      output.push(`<h${heading[1].length}>${inlineMarkdown(heading[2])}</h${heading[1].length}>`);
    } else if (/^&gt;\s+/.test(line)) {
      output.push(`<blockquote>${inlineMarkdown(line.replace(/^&gt;\s+/, ''))}</blockquote>`);
    } else if (line.trim()) {
      output.push(`<p>${inlineMarkdown(line)}</p>`);
    } else {
      output.push('<p><br></p>');
    }
  }
  closeList();
  return output.join('');
}

export function normalizeRichText(value: string): string {
  const looksLikeHtml = /<\/?(?:p|div|br|strong|b|em|i|h[1-6]|blockquote|ul|ol|li)\b/i.test(value);
  return sanitizeRichText(looksLikeHtml ? value : markdownToHtml(value));
}

export function richTextToPlainText(value: string): string {
  return normalizeRichText(value)
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(?:p|div|h[1-6]|blockquote|li)>/gi, '\n')
    .replace(/<li\b[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
