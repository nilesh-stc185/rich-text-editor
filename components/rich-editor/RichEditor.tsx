import React, {
  useRef,
  useCallback,
  useState,
  useImperativeHandle,
  forwardRef,
  useMemo,
  useEffect,
} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  Clipboard,
} from 'react-native';
import { EditorCore } from './core/EditorCore';
import type { EditorCoreRef } from './core/EditorCore';
import { EditorToolbar } from './toolbar/EditorToolbar';
import type { RichEditorProps, RichEditorRef, ToolbarConfig } from './types';
import { useDebouncedCallback } from './hooks/useDebouncedCallback';
import { sanitizeHTML } from './utils/sanitize';
import { getEditorStats } from './utils/editorStats';
import { getEditorTheme, getToolbarTheme, GLASS_CONTAINER, GLASS_TOOLBAR_WRAPPER } from './themes';
import { WordCountFooter } from './WordCountFooter';
import type { EditorStats } from './types';
import { CONTENT_SYNC_DEBOUNCE_MS } from './utils/constants';
import type { RichEditor as LibRichEditorType } from 'react-native-pell-rich-editor';

const RichEditorComponent = forwardRef<RichEditorRef, RichEditorProps>(function RichEditorComponent(
  {
    value,
    defaultValue = '',
    onChange,
    onFocus,
    onBlur,
    placeholder = '',
    disabled = false,
    initialFocus = false,
    pasteAsPlainText = false,
    enabledActions,
    toolbarConfig,
    theme: themeProp = 'system',
    editorTheme: editorThemeOverride,
    toolbarTheme: toolbarThemeOverride,
    onLinkPress,
    onImagePick,
    onVideoUrlRequest,
    onLinkInsert,
    style,
    containerStyle,
    toolbarStyle,
    renderToolbar,
    stickyToolbar = true,
    showWordCount = false,
    onStatsChange,
    hideSelectionMenu = true,
    testID,
    accessibilityLabel,
  },
  ref
) {
  const colorScheme = (useColorScheme() ?? 'light') === 'dark' ? 'dark' : 'light';
  const resolvedTheme = themeProp === 'system' ? colorScheme : themeProp;
  const editorTheme = useMemo(
    () => ({ ...getEditorTheme(themeProp, colorScheme), ...editorThemeOverride }),
    [themeProp, colorScheme, editorThemeOverride,]
  );
  const toolbarTheme = useMemo(
    () => ({ ...getToolbarTheme(themeProp, colorScheme), ...toolbarThemeOverride }),
    [themeProp, colorScheme, toolbarThemeOverride]
  );

  const isGlass = themeProp === 'glass';

  const coreRef = useRef<EditorCoreRef>(null);
  const nativeEditorRef = useRef<LibRichEditorType | null>(null);
  const lastHtmlRef = useRef(value ?? defaultValue);
  const isControlled = value !== undefined;

  const [internalValue, setInternalValue] = useState(defaultValue);
  const [editorStats, setEditorStats] = useState<EditorStats>(() =>
    getEditorStats(value ?? defaultValue)
  );
  const displayValue = isControlled ? (value ?? '') : internalValue;

  const debouncedOnChange = useDebouncedCallback(
    useCallback(
      (value: unknown) => {
        const html = typeof value === 'string' ? value : String(value ?? '');
        const sanitized = sanitizeHTML(html);
        lastHtmlRef.current = sanitized;
        if (!isControlled) setInternalValue(sanitized);
        onChange?.(sanitized);
      },
      [onChange, isControlled]
    ),
    CONTENT_SYNC_DEBOUNCE_MS
  );

  const handleChange = useCallback(
    (html: string) => {
      lastHtmlRef.current = html;
      if (!isControlled) setInternalValue(html);
      const stats = getEditorStats(html);
      setEditorStats(stats);
      onStatsChange?.(stats);
      debouncedOnChange(html);
    },
    [isControlled, debouncedOnChange, onStatsChange]
  );

  useEffect(() => {
    if (isControlled && value !== undefined && value !== lastHtmlRef.current) {
      lastHtmlRef.current = value;
      coreRef.current?.setContentHTML(value);
    }
  }, [isControlled, value]);

  const getEditor = useCallback(() => nativeEditorRef.current, []);

  const handleEditorReady = useCallback(() => {
    coreRef.current?.registerToolbar?.(() => {});
  }, []);

  const handlePressAddImage = useCallback(async () => {
    const url = await onImagePick?.();
    if (!url) return;
    coreRef.current?.focus();
    setTimeout(() => {
      coreRef.current?.insertImage(url);
    }, 150);
  }, [onImagePick]);

  const handleInsertLink = useCallback(async () => {
    const result = await onLinkInsert?.();
    if (result) coreRef.current?.insertLink(result.title, result.url);
  }, [onLinkInsert]);

  const handleInsertVideo = useCallback(async () => {
    const url = await onVideoUrlRequest?.();
    if (!url) return;
    coreRef.current?.focus();
    const safeUrl = url.trim();
    if (!safeUrl) return;
    const videoHtml = `<video controls style="max-width: 100%; border-radius: 12px; margin: 12px 0;"><source src="${safeUrl}" /></video>`;
    requestAnimationFrame(() => {
      coreRef.current?.insertHTML(videoHtml);
    });
  }, [onVideoUrlRequest]);

  useImperativeHandle(
    ref,
    () => ({
      getHTML: async () => {
        const html = await coreRef.current?.getContentHtml?.();
        const out = html ?? lastHtmlRef.current;
        return sanitizeHTML(out);
      },
      setHTML: (html: string) => {
        lastHtmlRef.current = html;
        coreRef.current?.setContentHTML(html);
        if (!isControlled) setInternalValue(html);
      },
      clear: () => {
        const empty = '';
        lastHtmlRef.current = empty;
        coreRef.current?.setContentHTML(empty);
        if (!isControlled) setInternalValue(empty);
        onChange?.(empty);
      },
      focus: () => coreRef.current?.focus(),
      blur: () => coreRef.current?.blur(),
      insertImageFromPicker: async () => {
        await handlePressAddImage();
      },
      insertVideoFromPicker: async () => {
        await handleInsertVideo();
      },
    }),
    [isControlled, onChange, handlePressAddImage, handleInsertVideo]
  );

  const handleLinkPress = useCallback(
    (url: string) => {
      onLinkPress?.(url);
    },
    [onLinkPress]
  );

  const handlePasteFromClipboard = useCallback(() => {
    Clipboard.getString()
      .then((text) => {
        if (!text.trim()) return;
        coreRef.current?.focus();
        requestAnimationFrame(() => {
          coreRef.current?.insertText(text);
        });
      })
      .catch(() => {});
  }, []);

  const handleCopy = useCallback(async () => {
    const html = await coreRef.current?.getContentHtml?.() ?? lastHtmlRef.current;
    const plain = html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (plain) Clipboard.setString(plain);
  }, []);

  const DEFAULT_TABLE_HTML = `<table style="border-collapse: collapse; width: 100%; margin: 12px 0;"><tr><td style="border: 1px solid #cbd5e1; padding: 8px;">Cell 1</td><td style="border: 1px solid #cbd5e1; padding: 8px;">Cell 2</td></tr><tr><td style="border: 1px solid #cbd5e1; padding: 8px;">Cell 3</td><td style="border: 1px solid #cbd5e1; padding: 8px;">Cell 4</td></tr></table>`;

  const handleInsertTable = useCallback(() => {
    coreRef.current?.focus();
    requestAnimationFrame(() => {
      coreRef.current?.insertHTML(DEFAULT_TABLE_HTML);
    });
  }, []);

  const content = (
    <>
      {stickyToolbar && (
        renderToolbar
          ? renderToolbar({
              disabled,
              config:
                enabledActions || toolbarConfig
                  ? {
                      ...(toolbarConfig ?? {}),
                      ...(enabledActions ? { enabledActions } : {}),
                    }
                  : undefined,
              theme: toolbarTheme,
              style: [isGlass && GLASS_TOOLBAR_WRAPPER, toolbarStyle],
            })
          : (
            <EditorToolbar
              getEditor={getEditor}
              disabled={disabled}
              config={
                enabledActions || toolbarConfig
                  ? {
                      ...(toolbarConfig ?? {}),
                      ...(enabledActions ? { enabledActions } : {}),
                    }
                  : undefined
              }
              theme={toolbarTheme}
              onPressAddImage={onImagePick ? handlePressAddImage : undefined}
              onInsertLink={onLinkInsert ? handleInsertLink : undefined}
              onInsertVideo={onVideoUrlRequest ? handleInsertVideo : undefined}
              onPasteFromClipboard={handlePasteFromClipboard}
              onCopy={handleCopy}
              onInsertTable={handleInsertTable}
              style={[isGlass && GLASS_TOOLBAR_WRAPPER, toolbarStyle]}
            />
          )
      )}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        scrollEventThrottle={16}
        testID={testID ? `${testID}-scroll` : undefined}
        accessibilityLabel={accessibilityLabel ? `${accessibilityLabel} content` : undefined}
      >
        <EditorCore
          ref={coreRef}
          nativeRef={nativeEditorRef}
          initialContentHTML={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          initialFocus={initialFocus}
          pasteAsPlainText={pasteAsPlainText}
          editorStyle={editorTheme}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onLink={handleLinkPress}
          onCursorPosition={undefined}
          editorInitializedCallback={handleEditorReady}
          useContainer={true}
          menuItems={hideSelectionMenu ? [] : undefined}
        />
      </ScrollView>
      {showWordCount && (
        <WordCountFooter
          stats={editorStats}
          theme={themeProp === 'glass' ? 'glass' : themeProp === 'dark' ? 'dark' : 'light'}
        />
      )}
    </>
  );

  return (
    <View
      style={[
        styles.container,
        isGlass && GLASS_CONTAINER,
        containerStyle,
        style,
      ]}
      testID={testID}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {content}
      </KeyboardAvoidingView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 600,
  },
  keyboardView: {
    flex: 1,
    height: '100%',
  },
  scroll: {
    flex: 1,
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    height: '100%',
  },
});

export { RichEditorComponent as RichEditor };
