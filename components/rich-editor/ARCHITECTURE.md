# Rich Editor – Architecture

## Overview

The Rich Editor is built with **clean architecture** and **SOLID** principles: the UI is separated from formatting, validation, and state. It is suitable for LMS, CMS, blog editors, and course-creation tools.

## Library Choice: react-native-pell-rich-editor

**Why this library:**

- **Actively maintained** (releases through 2025), high weekly npm downloads (~32k).
- **iOS and Android** support; works with current React Native and WebView.
- **Feature set** matches requirements: bold, italic, underline, lists, headings, blockquote, code, links, images, video, alignment, colors, undo/redo, etc.
- **Ref API**: `setContentHTML`, `insertImage`, `insertLink`, `insertVideo`, `focusContentEditor`, `blurContentEditor`, `registerToolbar`, `getContentHtml` (deprecated but still usable).
- **WebView-based**: Editing runs inside a WebView. Trade-off: full WYSIWYG and HTML output; we mitigate performance with debouncing and minimal bridge traffic.

**Alternatives considered:** Native-only editors (less mature for full HTML). Other WebView wrappers (lower adoption or stale). This library offered the best balance of maintenance, adoption, and features.

## Folder Structure

```
/components/rich-editor
  /core           – Editor engine wrapper, formatting map, validation
  /toolbar        – Toolbar UI and lib toolbar integration
  /hooks          – useDebouncedCallback, optional useEditorFormatState
  /types          – Shared TypeScript types and config
  /utils          – constants, sanitize
  themes.ts       – Light/dark/system editor and toolbar themes
  RichEditor.tsx  – Main component (state, ref API, composition)
  index.ts        – Public API
```

- **Core**: No UI logic; only wrapping the lib, mapping actions, and validating content/URLs.
- **Toolbar**: Renders the lib’s `RichToolbar` with our config and theme.
- **Hooks**: Reusable (e.g. debounce for onChange).
- **Types**: Single place for props, ref, theme, and toolbar config.
- **Utils**: Sanitization and constants (e.g. debounce delay).

## Data Flow

1. **Controlled**: Parent passes `value` and `onChange`. We call `setContentHTML(value)` when `value` changes; we debounce `onChange(html)` from the editor.
2. **Uncontrolled**: Parent can pass `defaultValue`. Internal state holds HTML; we still debounce and optionally call `onChange`.
3. **Ref**: `getHTML()` returns sanitized content (cached from last onChange or from `getContentHtml()`). `setHTML`, `clear`, `focus`, `blur` delegate to the core ref.

We avoid storing large HTML in React state on every keystroke: we use a ref for the latest HTML and sync to the parent only after a debounced delay.

## Performance

- **Debounced updates**: `CONTENT_SYNC_DEBOUNCE_MS` (e.g. 350ms) for `onChange` so we don’t serialize or pass huge HTML on every keypress.
- **Minimal re-renders**: Callbacks are memoized with `useCallback`; theme objects with `useMemo`. Toolbar and core receive stable props.
- **No heavy work on JS thread**: Formatting and content are handled inside the WebView; we only receive HTML in callbacks.
- **Large content**: The WebView manages the DOM; we don’t re-render the whole tree on each change. For 10k+ words, debouncing and ref-based caching keep the JS side light.

## Security

- **Sanitization**: `sanitizeHTML()` strips script, iframe, event handlers, and other dangerous markup before output or parent sync.
- **URL checks**: `validateImageUrl` / `validateVideoUrl` ensure only allowed protocols (e.g. http, https, data) for media.
- **Paste**: Optional `pasteAsPlainText` to avoid pasted HTML; when pasting is allowed, sanitization is applied on the synced content.

## Trade-offs

| Area           | Choice              | Trade-off                                                |
|----------------|---------------------|----------------------------------------------------------|
| Engine         | WebView (Pell)       | Full HTML/WYSIWYG vs. native feel; we optimize the bridge. |
| getHTML        | Cache + optional lib| Fast from cache; optional async from lib if needed.     |
| Toolbar        | Lib toolbar + config| Quick feature parity; custom toolbar can replace later.  |
| Theme          | system + overrides   | Good defaults; apps can override per-screen.           |

## Extensibility

- **Toolbar**: `toolbarConfig.enabledActions` and optional custom buttons (via lib’s `iconMap` / `renderAction` if needed).
- **Theming**: `editorTheme` and `toolbarTheme` overrides; `theme: 'light' | 'dark' | 'system'`.
- **Media/link**: `onImagePick`, `onVideoUrlRequest`, `onLinkInsert` allow custom pickers/modals; validation and sanitization stay in utils/core.

## Testing

- **Core/validation/sanitize**: Pure functions; easy to unit test without React or WebView.
- **Hooks**: Test with `@testing-library/react-hooks` or in a small test component.
- **Component**: Integration tests can mount `RichEditor` with a mock ref and assert on `onChange` and ref methods.
