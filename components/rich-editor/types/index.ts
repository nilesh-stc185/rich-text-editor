import type { RefObject } from 'react';

export type TextAlignment = 'left' | 'center' | 'right' | 'justify';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type FontSizeLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface EditorTheme {
  backgroundColor: string;
  color: string;
  caretColor: string;
  placeholderColor: string;
}

export interface ToolbarTheme {
  backgroundColor: string;
  iconTint: string;
  selectedIconTint: string;
  disabledIconTint: string;
}

export type ToolbarActionId =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikeThrough'
  | 'code'
  | 'subscript'
  | 'superscript'
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'heading4'
  | 'heading5'
  | 'heading6'
  | 'quote'
  | 'horizontalRule'
  | 'unorderedList'
  | 'orderedList'
  | 'indent'
  | 'outdent'
  | 'insertLink'
  | 'insertImage'
  | 'insertVideo'
  | 'justifyLeft'
  | 'justifyCenter'
  | 'justifyRight'
  | 'justifyFull'
  | 'foreColor'
  | 'hiliteColor'
  | 'fontSize'
  | 'fontName'
  | 'undo'
  | 'redo'
  | 'removeFormat'
  | 'keyboard'
  | 'paste'
  | 'copy'
  | 'table'
  | 'checkboxList';

export interface ToolbarConfig {
  enabledActions: ToolbarActionId[];
  fontSizes?: FontSizeLevel[];
  fontFamilies?: string[];
  customButtons?: CustomToolbarButton[];
}

export interface CustomToolbarButton {
  id: string;
  icon: React.ReactNode;
  onPress: () => void;
  label: string;
}

export type EditorMode = 'controlled' | 'uncontrolled';

export interface RichEditorProps {
  value?: string;
  defaultValue?: string;
  onChange?: (html: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  initialFocus?: boolean;
  pasteAsPlainText?: boolean;
  /** Convenience prop: directly control which toolbar actions are shown. */
  enabledActions?: ToolbarActionId[];
  toolbarConfig?: Partial<ToolbarConfig>;
  theme?: 'light' | 'dark' | 'system' | 'glass';
  editorTheme?: Partial<EditorTheme>;
  toolbarTheme?: Partial<ToolbarTheme>;
  onLinkPress?: (url: string) => void;
  /** Return image URL (https:) or data URI (data:image/...;base64,...). For local files use base64; WebView may block file://. Requires photo/storage permissions if using a device picker. */
  onImagePick?: () => Promise<string | null>;
  onVideoUrlRequest?: () => Promise<string | null>;
  onLinkInsert?: () => Promise<{ title: string; url: string } | null>;
  style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
  containerStyle?: import('react-native').StyleProp<import('react-native').ViewStyle>;
  toolbarStyle?: import('react-native').StyleProp<import('react-native').ViewStyle>;
  /** Optional custom toolbar renderer: replaces the default toolbar UI. */
  renderToolbar?: (props: {
    disabled: boolean;
    config?: Partial<ToolbarConfig>;
    theme: Partial<ToolbarTheme>;
    style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
  }) => React.ReactNode;
  stickyToolbar?: boolean;
  showWordCount?: boolean;
  onStatsChange?: (stats: EditorStats) => void;
  /** When true (default), hides the system text-selection toolbar (Cut/Copy/Paste/Open) so you use the editor toolbar for formatting. */
  hideSelectionMenu?: boolean;
  testID?: string;
  accessibilityLabel?: string;
}

export interface RichEditorRef {
  getHTML: () => Promise<string>;
  setHTML: (html: string) => void;
  clear: () => void;
  focus: () => void;
  blur: () => void;
  /** Imperative helper: trigger image insert flow (uses onImagePick + editor logic). */
  insertImageFromPicker?: () => Promise<void> | void;
  /** Imperative helper: trigger video insert flow (uses onVideoUrlRequest + editor logic). */
  insertVideoFromPicker?: () => Promise<void> | void;
}

export type RichEditorRefObject = RefObject<RichEditorRef | null>;

export interface EditorFormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikeThrough: boolean;
  subscript: boolean;
  superscript: boolean;
  [key: string]: boolean | undefined;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface EditorStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
}

