/**
 * Lightweight HTML sanitization for rich editor output.
 * Prevents XSS by allowlisting tags and stripping dangerous attributes.
 * For strict compliance, consider integrating a full HTML sanitizer (e.g. sanitize-html in Node export).
 */

const ALLOWED_TAGS = new Set([
  'p', 'br', 'div', 'span', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
  'code', 'pre', 'sub', 'sup', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'hr', 'ul', 'ol', 'li', 'a', 'img', 'figure', 'figcaption',
  'table', 'thead', 'tbody', 'tr', 'th', 'td', 'video', 'source',
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'target', 'rel']),
  img: new Set(['src', 'alt', 'width', 'height', 'style']),
  video: new Set(['src', 'controls', 'width', 'height', 'poster', 'style']),
  source: new Set(['src', 'type']),
  span: new Set(['style', 'class']),
  div: new Set(['style', 'class']),
  p: new Set(['style', 'class']),
  td: new Set(['style', 'colspan', 'rowspan']),
  th: new Set(['style', 'colspan', 'rowspan']),
};

const FORBIDDEN_ATTR_PREFIXES = ['on', 'form', 'action', 'javascript:', 'data-'];
const FORBIDDEN_TAGS = new Set(['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'meta', 'link', 'style']);

function isAllowedTag(tagName: string): boolean {
  return ALLOWED_TAGS.has(tagName.toLowerCase());
}

function isForbiddenTag(tagName: string): boolean {
  return FORBIDDEN_TAGS.has(tagName.toLowerCase());
}

function isAllowedAttr(tagName: string, attrName: string, attrValue: string): boolean {
  const lower = attrName.toLowerCase();
  const valueLower = (attrValue || '').toLowerCase();
  if (valueLower.includes('javascript:') || valueLower.includes('vbscript:')) return false;
  for (const p of FORBIDDEN_ATTR_PREFIXES) {
    if (lower.startsWith(p)) return false;
  }
  const allowed = ALLOWED_ATTRS[tagName.toLowerCase()];
  if (allowed) return allowed.has(lower);
  return ['style', 'class'].includes(lower);
}

const URL_PROTOCOL_WHITELIST = ['http:', 'https:', 'data:'];

function isValidUrl(url: string): boolean {
  if (typeof url !== 'string' || url.trim() === '') return false;
  try {
    const parsed = new URL(url, 'https://dummy.invalid');
    if (!URL_PROTOCOL_WHITELIST.includes(parsed.protocol)) return false;
    if (parsed.protocol === 'data:') return true;
    return parsed.host !== 'dummy.invalid';
  } catch {
    return false;
  }
}

function sanitizeAttrValue(tagName: string, attrName: string, value: string): string {
  const lower = attrName.toLowerCase();
  if ((lower === 'href' || lower === 'src') && !isValidUrl(value)) return '';
  return value;
}

/**
 * Sanitizes HTML string for safe display/storage.
 * Removes script, event handlers, and invalid URLs on a and img.
 */
export function sanitizeHTML(html: string): string {
  if (typeof html !== 'string') return '';

  let out = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe\b[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object\b[\s\S]*?<\/object>/gi, '')
    .replace(/<embed\b[\s\S]*?>/gi, '')
    .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s+on\w+\s*=\s*[^\s>]+/gi, '');

  const forbiddenTagRegex = new RegExp(
    `<(?:${[...FORBIDDEN_TAGS].join('|')})\\b[^>]*>(?:[\\s\\S]*?)</(?:${[...FORBIDDEN_TAGS].join('|')})>`,
    'gi'
  );
  out = out.replace(forbiddenTagRegex, '');

  return out.trim();
}

/**
 * Validates image URL for insert. Use before passing to editor.
 */
export function validateImageUrl(url: string): boolean {
  return typeof url === 'string' && isValidUrl(url);
}

/**
 * Validates video URL for insert.
 */
export function validateVideoUrl(url: string): boolean {
  return typeof url === 'string' && isValidUrl(url);
}
