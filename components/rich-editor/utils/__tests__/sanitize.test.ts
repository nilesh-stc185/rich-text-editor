import { sanitizeHTML, validateImageUrl, validateVideoUrl } from '../sanitize';

describe('sanitizeHTML', () => {
  it('strips script tags', () => {
    const html = '<p>Hello</p><script>alert(1)</script><span>World</span>';
    expect(sanitizeHTML(html)).not.toContain('script');
  });

  it('strips event handlers', () => {
    const html = '<p onclick="alert(1)">Click</p>';
    expect(sanitizeHTML(html)).not.toContain('onclick');
  });

  it('allows safe tags', () => {
    const html = '<p><strong>Bold</strong></p>';
    expect(sanitizeHTML(html)).toContain('<p>');
    expect(sanitizeHTML(html)).toContain('strong');
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeHTML((null as unknown) as string)).toBe('');
    expect(sanitizeHTML((undefined as unknown) as string)).toBe('');
  });
});

describe('validateImageUrl', () => {
  it('accepts https URLs', () => {
    expect(validateImageUrl('https://example.com/img.png')).toBe(true);
  });

  it('accepts http URLs', () => {
    expect(validateImageUrl('http://example.com/img.png')).toBe(true);
  });

  it('rejects javascript URLs', () => {
    expect(validateImageUrl('javascript:alert(1)')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validateImageUrl('')).toBe(false);
  });
});

describe('validateVideoUrl', () => {
  it('accepts https URLs', () => {
    expect(validateVideoUrl('https://example.com/video.mp4')).toBe(true);
  });

  it('rejects invalid URLs (no protocol)', () => {
    expect(validateVideoUrl('not-a-url')).toBe(false);
  });
});
