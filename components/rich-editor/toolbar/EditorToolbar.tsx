import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { RichToolbar } from 'react-native-pell-rich-editor';
import type { RichEditor } from 'react-native-pell-rich-editor';
import { getLibActionId } from '../core/formatting';
import type { ToolbarConfig, ToolbarTheme, ToolbarActionId } from '../types';
import { TOOLBAR_MIN_HEIGHT } from '../utils/constants';

const HEADING_LABELS: Record<string, string> = {
  heading2: 'H2',
  heading3: 'H3',
  heading4: 'H4',
  heading5: 'H5',
  heading6: 'H6',
};

const PASTE_LABEL = 'Paste';
const TEXT_LABELS: Record<string, string> = {
  subscript: 'Sub',
  superscript: 'Sup',
  horizontalRule: '—',
  paragraph: 'P',
  copy: 'Copy',
  table: 'Table',
  checkboxList: '☑',
};

export interface EditorToolbarProps {
  getEditor: () => RichEditor | null;
  disabled?: boolean;
  config?: Partial<ToolbarConfig>;
  theme?: Partial<ToolbarTheme>;
  onPressAddImage?: () => void;
  onInsertLink?: () => void;
  onInsertVideo?: () => void;
  onPasteFromClipboard?: () => void;
  onCopy?: () => void;
  onInsertTable?: () => void;
  style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
  flatContainerStyle?: import('react-native').StyleProp<import('react-native').ViewStyle>;
}

const DEFAULT_ACTIONS: ToolbarActionId[] = [
  'bold',
  'italic',
  'underline',
  'strikeThrough',
  'subscript',
  'superscript',
  'unorderedList',
  'orderedList',
  'checkboxList',
  'indent',
  'outdent',
  'insertLink',
  'insertImage',
  'insertVideo',
  'heading1',
  'heading2',
  'heading3',
  'heading4',
  'heading5',
  'heading6',
  'paragraph',
  'quote',
  'code',
  'horizontalRule',
  'justifyLeft',
  'justifyCenter',
  'justifyRight',
  'justifyFull',
  'foreColor',
  'hiliteColor',
  'undo',
  'redo',
  'removeFormat',
  'paste',
  'copy',
  'table',
];

function EditorToolbar({
  getEditor,
  disabled = false,
  config,
  theme,
  onPressAddImage,
  onInsertLink,
  onInsertVideo,
  onPasteFromClipboard,
  onCopy,
  onInsertTable,
  style,
  flatContainerStyle,
}: EditorToolbarProps) {
  const actions = useMemo(() => {
    const enabled = config?.enabledActions ?? DEFAULT_ACTIONS;
    return enabled.map((id) => getLibActionId(id));
  }, [config?.enabledActions]);

  const iconTint = theme?.iconTint ?? '#71787F';
  const selectedIconTint = theme?.selectedIconTint ?? '#0066cc';
  const disabledIconTint = theme?.disabledIconTint ?? '#cccccc';

  const iconMap = useMemo(() => {
    const map: Record<string, (icon: { tintColor: string; iconSize: number }) => React.ReactNode> = {};
    (Object.keys(HEADING_LABELS) as (keyof typeof HEADING_LABELS)[]).forEach((key) => {
      const label = HEADING_LABELS[key];
      map[key] = ({ tintColor, iconSize }) => (
        <Text style={[styles.headingIcon, { color: tintColor, fontSize: Math.max(12, iconSize - 4) }]}>
          {label}
        </Text>
      );
    });
    map.paste = ({ tintColor, iconSize }) => (
      <Text style={[styles.headingIcon, { color: tintColor, fontSize: Math.max(12, iconSize - 4) }]}>
        {PASTE_LABEL}
      </Text>
    );
    (Object.keys(TEXT_LABELS) as (keyof typeof TEXT_LABELS)[]).forEach((key) => {
      const label = TEXT_LABELS[key];
      map[key] = ({ tintColor, iconSize }) => (
        <Text style={[styles.headingIcon, { color: tintColor, fontSize: Math.max(11, iconSize - 5) }]}>
          {label}
        </Text>
      );
    });
    return map;
  }, []);

  return (
    <View style={[styles.wrapper, style]} accessibilityRole="toolbar">
      <RichToolbar
        getEditor={getEditor}
        disabled={disabled}
        actions={actions}
        iconTint={iconTint}
        selectedIconTint={selectedIconTint}
        disabledIconTint={disabledIconTint}
        iconMap={iconMap}
        onPressAddImage={onPressAddImage}
        onInsertLink={onInsertLink}
        insertVideo={onInsertVideo}
        paste={onPasteFromClipboard}
        copy={onCopy}
        table={onInsertTable}
        style={[styles.toolbar, theme?.backgroundColor ? { backgroundColor: theme.backgroundColor } : undefined]}
        flatContainerStyle={flatContainerStyle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    minHeight: TOOLBAR_MIN_HEIGHT,
  },
  toolbar: {},
  headingIcon: {
    fontWeight: '700',
    minWidth: 100,
    marginHorizontal: 10,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
});

export { EditorToolbar };
