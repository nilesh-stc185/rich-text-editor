import type { EditorTheme, ToolbarTheme } from './types';

export const LIGHT_EDITOR_THEME: EditorTheme = {
  backgroundColor: '#ffffff',
  color: '#000033',
  caretColor: '#000033',
  placeholderColor: '#a9a9a9',
};

export const DARK_EDITOR_THEME: EditorTheme = {
  backgroundColor: '#1a1a1a',
  color: '#e0e0e0',
  caretColor: '#e0e0e0',
  placeholderColor: '#6b6b6b',
};

export const LIGHT_TOOLBAR_THEME: ToolbarTheme = {
  backgroundColor: '#f5f5f5',
  iconTint: '#71787F',
  selectedIconTint: '#0066cc',
  disabledIconTint: '#cccccc',
};

export const DARK_TOOLBAR_THEME: ToolbarTheme = {
  backgroundColor: '#2d2d2d',
  iconTint: '#b0b0b0',
  selectedIconTint: '#4da6ff',
  disabledIconTint: '#555555',
};

const GLASS_EDITOR_BG = 'rgba(248, 250, 252, 0.85)';
const GLASS_EDITOR_TEXT = '#1e293b';
const GLASS_EDITOR_CARET = '#6366f1';
const GLASS_EDITOR_PLACEHOLDER = '#94a3b8';

export const GLASS_EDITOR_THEME: EditorTheme = {
  backgroundColor: GLASS_EDITOR_BG,
  color: GLASS_EDITOR_TEXT,
  caretColor: GLASS_EDITOR_CARET,
  placeholderColor: GLASS_EDITOR_PLACEHOLDER,
};

const GLASS_TOOLBAR_BG = 'rgba(255, 255, 255, 0.78)';
const GLASS_ICON = '#475569';
const GLASS_ICON_SELECTED = '#6366f1';
const GLASS_ICON_DISABLED = '#cbd5e1';

export const GLASS_TOOLBAR_THEME: ToolbarTheme = {
  backgroundColor: GLASS_TOOLBAR_BG,
  iconTint: GLASS_ICON,
  selectedIconTint: GLASS_ICON_SELECTED,
  disabledIconTint: GLASS_ICON_DISABLED,
};

export function getEditorTheme(theme: 'light' | 'dark' | 'system' | 'glass', colorScheme: 'light' | 'dark'): EditorTheme {
  if (theme === 'glass') return GLASS_EDITOR_THEME;
  if (theme === 'dark') return DARK_EDITOR_THEME;
  if (theme === 'light') return LIGHT_EDITOR_THEME;
  return colorScheme === 'dark' ? DARK_EDITOR_THEME : LIGHT_EDITOR_THEME;
}

export function getToolbarTheme(theme: 'light' | 'dark' | 'system' | 'glass', colorScheme: 'light' | 'dark'): ToolbarTheme {
  if (theme === 'glass') return GLASS_TOOLBAR_THEME;
  if (theme === 'dark') return DARK_TOOLBAR_THEME;
  if (theme === 'light') return LIGHT_TOOLBAR_THEME;
  return colorScheme === 'dark' ? DARK_TOOLBAR_THEME : LIGHT_TOOLBAR_THEME;
}

export const GLASS_CONTAINER = {
  backgroundColor: 'rgba(255, 255, 255, 0.65)',
  borderRadius: 16,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.7)',
  overflow: 'hidden' as const,
  shadowColor: '#0f172a',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.12,
  shadowRadius: 24,
  elevation: 8,
};

export const GLASS_TOOLBAR_WRAPPER = {
  backgroundColor: 'rgba(255, 255, 255, 0.72)',
  borderBottomWidth: 1,
  borderBottomColor: 'rgba(148, 163, 184, 0.35)',
  paddingVertical: 6,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
};
