import React, { useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { RichEditor as LibRichEditor } from 'react-native-pell-rich-editor';
import type { RichEditorProps } from 'react-native-pell-rich-editor';
import type { RichEditor as LibRichEditorType } from 'react-native-pell-rich-editor';
import type { EditorTheme } from '../types';
import { EDITOR_MIN_HEIGHT } from '../utils/constants';

export interface EditorCoreRef {
  setContentHTML: (html: string) => void;
  focus: () => void;
  blur: () => void;
  insertImage: (url: string, style?: string) => void;
  insertVideo: (url: string, style?: string) => void;
  insertLink: (title: string, url: string) => void;
  insertHTML: (html: string) => void;
  insertText: (text: string) => void;
  setFontSize: (size: 1 | 2 | 3 | 4 | 5 | 6 | 7) => void;
  setForeColor: (color: string) => void;
  setHiliteColor: (color: string) => void;
  setFontName: (name: string) => void;
  registerToolbar: (listener: (items: (string | { type: string; value: string })[]) => void) => void;
  getContentHtml: () => Promise<string>;
  commandDOM: (command: string) => void;
  command: (command: string) => void;
}

export interface EditorCoreProps {
  initialContentHTML?: string;
  placeholder?: string;
  disabled?: boolean;
  initialFocus?: boolean;
  pasteAsPlainText?: boolean;
  editorStyle?: Partial<EditorTheme>;
  onChange?: (html: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onCursorPosition?: (offsetY: number) => void;
  onHeightChange?: (height: number) => void;
  onLink?: (url: string) => void;
  onPaste?: (data: string) => void;
  editorInitializedCallback?: () => void;
  style?: React.ComponentProps<typeof LibRichEditor>['style'];
  useContainer?: boolean;
  /** Forward ref to the underlying lib RichEditor for toolbar integration */
  nativeRef?: React.RefObject<LibRichEditorType | null>;
  /** Custom selection menu items (if supported by underlying editor/TextInput). */
  menuCustomItems?: Array<{ label: string; key: string }>;
  /** iOS-only TextInput menu items; empty array hides system Cut/Copy/Paste menu. */
  menuItems?: string[];
}

const EditorCore = forwardRef<EditorCoreRef, EditorCoreProps>(function EditorCore(
  {
    initialContentHTML = '',
    placeholder = '',
    disabled = false,
    initialFocus = false,
    pasteAsPlainText = false,
    editorStyle,
    onChange,
    onFocus,
    onBlur,
    onCursorPosition,
    onHeightChange,
    onLink,
    onPaste,
    editorInitializedCallback,
    style,
    useContainer = true,
    nativeRef,
    menuCustomItems,
    menuItems,
  },
  ref
) {
  const internalRef = useRef<LibRichEditor>(null);
  const libRef = (nativeRef ?? internalRef) as React.MutableRefObject<LibRichEditor | null>;

  const editorStyleResolved: RichEditorProps['editorStyle'] = {
    backgroundColor: editorStyle?.backgroundColor ?? '#ffffff',
    color: editorStyle?.color ?? '#000033',
    caretColor: editorStyle?.caretColor ?? '#000033',
    placeholderColor: editorStyle?.placeholderColor ?? '#a9a9a9',
  };

  useImperativeHandle(
    ref,
    () => ({
      setContentHTML: (html: string) => libRef.current?.setContentHTML(html),
      focus: () => libRef.current?.focusContentEditor(),
      blur: () => libRef.current?.blurContentEditor(),
      insertImage: (url: string, styleAttr?: string) =>
        libRef.current?.insertImage(url, styleAttr),
      insertVideo: (url: string, styleAttr?: string) =>
        libRef.current?.insertVideo(url, styleAttr),
      insertLink: (title: string, url: string) =>
        libRef.current?.insertLink(title, url),
      insertHTML: (html: string) => libRef.current?.insertHTML(html),
      insertText: (text: string) => libRef.current?.insertText(text),
      setFontSize: (size) => libRef.current?.setFontSize(size),
      setForeColor: (color: string) => libRef.current?.setForeColor(color),
      setHiliteColor: (color: string) => libRef.current?.setHiliteColor(color),
      setFontName: (name: string) => libRef.current?.setFontName(name),
      registerToolbar: (listener) => libRef.current?.registerToolbar(listener),
      getContentHtml: () =>
        libRef.current?.getContentHtml?.() ?? Promise.resolve(''),
      commandDOM: (command: string) => libRef.current?.commandDOM(command),
      command: (command: string) => libRef.current?.command(command),
    }),
    []
  );

  const handleChange = useCallback(
    (html: string) => {
      onChange?.(html);
    },
    [onChange]
  );

  const libProps = {
    ref: nativeRef ?? internalRef,
    initialContentHTML,
    placeholder,
    disabled,
    initialFocus,
    pasteAsPlainText,
    editorStyle: editorStyleResolved,
    onChange: handleChange,
    onFocus,
    onBlur,
    onCursorPosition,
    onHeightChange,
    onLink,
    onPaste,
    editorInitializedCallback,
    style,
    useContainer,
    ...(menuItems !== undefined && { menuItems }),
    ...(menuCustomItems !== undefined && { menuItems: menuCustomItems.map((m) => m.label) }),
  } as React.ComponentProps<typeof LibRichEditor>;

  return (
    <View style={[styles.container, useContainer && { minHeight: EDITOR_MIN_HEIGHT }]}>
      <LibRichEditor {...libProps} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export { EditorCore };
