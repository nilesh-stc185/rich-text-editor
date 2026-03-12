import type { ValidationResult } from '../types';
import { validateImageUrl, validateVideoUrl } from '../utils/sanitize';

const MAX_HTML_LENGTH = 5_000_000;

export function validateEditorContent(html: string): ValidationResult {
  const errors: string[] = [];
  if (typeof html !== 'string') {
    errors.push('Content must be a string');
    return { valid: false, errors };
  }
  if (html.length > MAX_HTML_LENGTH) {
    errors.push(`Content exceeds maximum length (${MAX_HTML_LENGTH} characters)`);
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateImageInsert(url: string): ValidationResult {
  const errors: string[] = [];
  if (!validateImageUrl(url)) {
    errors.push('Invalid or unsupported image URL');
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateVideoInsert(url: string): ValidationResult {
  const errors: string[] = [];
  if (!validateVideoUrl(url)) {
    errors.push('Invalid or unsupported video URL');
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}
