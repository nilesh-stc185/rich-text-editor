import React, { useRef, useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Alert,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { RichEditor, type RichEditorRef, type EditorStats, type ToolbarActionId } from '../components/rich-editor';

const SAMPLE_HTML = `
<p>This is a <strong>sample</strong> rich text with <em>formatting</em>.</p>
<p>Features: headings, lists, links, images, and more.</p>
<h2>Headings</h2>
<p>Use the toolbar to format your content.</p>
<ul><li>Bullet one</li><li>Bullet two</li></ul>
`;

export function RichEditorExampleScreen() {
  const editorRef = useRef<RichEditorRef>(null);
  const [htmlPreview, setHtmlPreview] = useState('');
  const [lastHtml, setLastHtml] = useState('');
  const [stats, setStats] = useState<EditorStats>({ words: 0, characters: 0, charactersNoSpaces: 0 });
  const [insertMenuOpen, setInsertMenuOpen] = useState(false);
  const [isDarkOverride, setIsDarkOverride] = useState<boolean | null>(null);
  const systemScheme = useColorScheme();
  const { width } = useWindowDimensions();

  const isDark = isDarkOverride ?? (systemScheme === 'dark');
  const showSidePanel = width >= 900;

  const handleChange = useCallback((html: string) => {
    setLastHtml(html);
    setHtmlPreview(html.slice(0, 200) + (html.length > 200 ? '...' : ''));
  }, []);

  const handleGetHtml = useCallback(async () => {
    const html = await editorRef.current?.getHTML();
    if (html !== undefined) {
      Alert.alert('HTML (first 500 chars)', html.slice(0, 500));
    }
  }, []);

  const handleClear = useCallback(() => {
    editorRef.current?.clear();
    setHtmlPreview('');
    setLastHtml('');
  }, []);

  const handleFocus = useCallback(() => {
    editorRef.current?.focus();
  }, []);

  const handleImagePick = useCallback(async (): Promise<string | null> => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.8,
      includeBase64: true,
    });

    if (result.didCancel || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    if (asset?.base64) {
      const mime = asset.type && asset.type.startsWith('image/') ? asset.type : 'image/jpeg';
      return `data:${mime};base64,${asset.base64}`;
    }

    return asset?.uri ?? null;
  }, []);

  const handleLinkInsert = useCallback((): Promise<{ title: string; url: string } | null> => {
    return new Promise((resolve) => {
      Alert.alert(
        'Insert Link',
        'In production, use a modal with title + URL inputs.',
        [{ text: 'OK', onPress: () => resolve(null) }]
      );
    });
  }, []);

  const handleVideoUrlRequest = useCallback(async (): Promise<string | null> => {
    const result = await launchImageLibrary({
      mediaType: 'video',
      selectionLimit: 1,
      quality: 1,
    });

    if (result.didCancel || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    const uri = asset?.uri ?? '';
    if (!uri) return null;

    if (uri.startsWith('file://')) {
      Alert.alert(
        'Local video preview',
        'Local file videos cannot be embedded directly inside the editor WebView. Using a sample HTTPS video URL for preview. In a real app, upload the video and use its HTTPS URL here.'
      );
      return 'https://www.w3schools.com/html/mov_bbb.mp4';
    }

    return uri;
  }, []);

  const readingTimeMinutes = useMemo(() => {
    if (!stats.words) return 0;
    return Math.max(1, Math.round(stats.words / 200));
  }, [stats.words]);

  const handleToggleTheme = useCallback(() => {
    setIsDarkOverride((prev) => {
      if (prev === null) return !(systemScheme === 'dark');
      return !prev;
    });
  }, [systemScheme]);

  const outlineHeadings = useMemo(() => {
    const matches = Array.from(lastHtml.matchAll(/<h([1-6])[^>]*>(.*?)<\/h\1>/gi));
    return matches.map((m) => {
      const level = Number(m[1]);
      const raw = m[2].replace(/<[^>]*>/g, '').trim();
      return { level, title: raw || `Heading ${level}` };
    });
  }, [lastHtml]);

  const palette = isDark
    ? {
        background: '#020617',
        panel: 'rgba(15, 23, 42, 0.78)',
        border: 'rgba(148, 163, 184, 0.35)',
        subtleBorder: 'rgba(148, 163, 184, 0.2)',
        primary: '#6366F1',
        primarySoft: 'rgba(99, 102, 241, 0.18)',
        textPrimary: '#E5E7EB',
        textSecondary: '#9CA3AF',
        badgeBg: 'rgba(34, 197, 94, 0.12)',
        badgeText: '#BBF7D0',
      }
    : {
        background: '#E5ECFF',
        panel: 'rgba(255, 255, 255, 0.82)',
        border: 'rgba(148, 163, 184, 0.35)',
        subtleBorder: 'rgba(148, 163, 184, 0.2)',
        primary: '#4F46E5',
        primarySoft: 'rgba(79, 70, 229, 0.12)',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        badgeBg: 'rgba(34, 197, 94, 0.12)',
        badgeText: '#166534',
      };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.backgroundLayer} pointerEvents="none">
        <View
          style={[
            styles.glowOrb,
            {
              backgroundColor: palette.primarySoft,
              top: -120,
              left: -80,
            },
          ]}
        />
        <View
          style={[
            styles.glowOrb,
            {
              backgroundColor: palette.primarySoft,
              bottom: -160,
              right: -60,
            },
          ]}
        />
      </View>
      <View style={styles.shell}>

        <View style={styles.mainRow}>
          <View
            style={[
              styles.editorCard,
              {
                backgroundColor: palette.panel,
                borderColor: palette.border,
              },
            ]}
          >
            <View style={styles.editorHeaderRow}>
              <View style={styles.editorHeaderActions}>
              <Pressable
              onPress={handleToggleTheme}
              style={({ pressed }) => [
                styles.toggle,
                {
                  backgroundColor: palette.panel,
                  borderColor: palette.border,
                },
                pressed && styles.btnPressed,
              ]}
            >
              <Text style={[styles.toggleLabel, { color: 'white' }]}>
                {isDark ? 'Dark' : 'Light'}
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.iconBtn,
                { backgroundColor: '#534f4f', borderColor: palette.border },
                pressed && styles.btnPressed,
              ]}
              onPress={handleGetHtml}
            >
              <Text style={[styles.iconBtnText, { color: 'white' }]}>HTML</Text>
            </Pressable>
               
                <Pressable
                  style={({ pressed }) => [
                    styles.smallBtn,
                    { backgroundColor: palette.primary, borderColor: 'transparent' },
                    pressed && styles.btnPressed,
                  ]}
                  onPress={handleFocus}
                >
                  <Text style={[styles.smallBtnText, { color: '#fff' }]}>Focus</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.smallBtn,
                    { backgroundColor: '#33625f', borderColor: palette.border },
                    pressed && styles.btnPressed,
                  ]}
                  onPress={handleClear}
                >
                  <Text style={[styles.smallBtnText, { color: "white" }]}>Clear</Text>
                </Pressable>
                
              </View>
            </View>

            <View style={styles.editorBody}>
              <RichEditor
                ref={editorRef}
                defaultValue={SAMPLE_HTML}
                onChange={handleChange}
                placeholder="Start writing your thoughts…"
                theme={isDark ? 'dark' : 'light'}
                showWordCount={false}
                toolbarConfig={{
                  enabledActions: [
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
                  ] as ToolbarActionId[],
                }}
                onImagePick={handleImagePick}
                onLinkInsert={handleLinkInsert}
                onVideoUrlRequest={handleVideoUrlRequest}
                stickyToolbar
                containerStyle={styles.editorContainer}
                testID="rich-editor"
                accessibilityLabel="Rich text editor"
                onStatsChange={setStats}
              />

              <View style={styles.floatingInsertWrapper}>
                <Pressable
                  style={({ pressed }) => [
                    styles.insertButton,
                    {
                      backgroundColor: palette.panel,
                      borderColor: palette.border,
                    },
                    pressed && styles.insertButtonPressed,
                  ]}
                  onPress={() => setInsertMenuOpen((prev) => !prev)}
                >
                  <Text style={[styles.insertButtonText, { color: palette.primary }]}>＋</Text>
                </Pressable>
                {insertMenuOpen && (
                  <View
                    style={[
                      styles.insertMenu,
                      {
                        backgroundColor: palette.panel,
                        borderColor: palette.border,
                      },
                    ]}
                  >
                    <Pressable
                      style={({ pressed }) => [
                        styles.insertMenuItem,
                        pressed && styles.insertMenuItemPressed,
                      ]}
                      onPress={async () => {
                        setInsertMenuOpen(false);
                        await editorRef.current?.insertImageFromPicker?.();
                      }}
                    >
                      <Text style={[styles.insertMenuItemText, { color: palette.textPrimary }]}>
                        Image
                      </Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [
                        styles.insertMenuItem,
                        pressed && styles.insertMenuItemPressed,
                      ]}
                      onPress={async () => {
                        setInsertMenuOpen(false);
                        await editorRef.current?.insertVideoFromPicker?.();
                      }}
                    >
                      <Text style={[styles.insertMenuItemText, { color: palette.textPrimary }]}>
                        Video
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>

            {htmlPreview.length > 0 && (
              <View
                style={[
                  styles.preview,
                  {
                    backgroundColor: palette.panel,
                    borderColor: palette.subtleBorder,
                  },
                ]}
              >
                <Text style={[styles.previewLabel, { color: palette.textSecondary }]}>Content preview</Text>
                <Text style={[styles.previewText, { color: palette.textPrimary }]} numberOfLines={2}>
                  {htmlPreview}
                </Text>
              </View>
            )}
          </View>

          {showSidePanel && (
            <View
              style={[
                styles.sidePanel,
                {
                  backgroundColor: palette.panel,
                  borderColor: palette.border,
                },
              ]}
            >
              <Text style={[styles.sideTitle, { color: palette.textPrimary }]}>Document</Text>
              <View style={styles.sideSection}>
                <Text style={[styles.sideSectionLabel, { color: palette.textSecondary }]}>Stats</Text>
                <View style={styles.statsRow}>
                  <View
                    style={[
                      styles.statCard,
                      { backgroundColor: palette.primarySoft, borderColor: palette.subtleBorder },
                    ]}
                  >
                    <Text style={[styles.statLabel, { color: palette.textSecondary }]}>Words</Text>
                    <Text style={[styles.statValue, { color: palette.textPrimary }]}>{stats.words}</Text>
                  </View>
                  <View
                    style={[
                      styles.statCard,
                      { backgroundColor: palette.primarySoft, borderColor: palette.subtleBorder },
                    ]}
                  >
                    <Text style={[styles.statLabel, { color: palette.textSecondary }]}>Read time</Text>
                    <Text style={[styles.statValue, { color: palette.textPrimary }]}>
                      {readingTimeMinutes ? `${readingTimeMinutes} min` : '—'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.sideSection}>
                <Text style={[styles.sideSectionLabel, { color: palette.textSecondary }]}>Outline</Text>
                <View style={styles.outlineList}>
                  {outlineHeadings.length === 0 && (
                    <Text style={[styles.outlineEmpty, { color: palette.textSecondary }]}>
                      Start typing headings (H1–H6) to see your outline.
                    </Text>
                  )}
                  {outlineHeadings.map((item, idx) => (
                    <View key={`${item.title}-${idx}`} style={[styles.outlineItem, { paddingLeft: (item.level - 1) * 8 }]}>
                      <Text style={[styles.outlineHash, { color: palette.textSecondary }]}>#</Text>
                      <Text style={[styles.outlineText, { color: palette.textPrimary }]} numberOfLines={1}>
                        {item.title}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.sideSection}>
                <Text style={[styles.sideSectionLabel, { color: palette.textSecondary }]}>Assistant</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.aiCard,
                    { backgroundColor: palette.primarySoft, borderColor: palette.subtleBorder },
                    pressed && styles.btnPressed,
                  ]}
                >
                  <Text style={[styles.aiTitle, { color: palette.textPrimary }]}>Ask AI about this draft</Text>
                  <Text style={[styles.aiSubtitle, { color: palette.textSecondary }]}>
                    Summaries, ideas, tone tweaks, and more.
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        <View
          style={[
            styles.statusBar,
            {
              backgroundColor: palette.panel,
              borderTopColor: palette.subtleBorder,
            },
          ]}
        >
          <View style={styles.statusLeft}>
            <Text style={[styles.statusText, { color: palette.textSecondary }]}>
              {stats.words} words ·{' '}
              {readingTimeMinutes ? `${readingTimeMinutes} min read` : '—'}
            </Text>
          </View>
          <View style={styles.statusRight}>
            <View style={[styles.badge, { backgroundColor: palette.badgeBg }]}>
              <Text style={[styles.badgeText, { color: palette.badgeText }]}>Auto-saved</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: palette.primarySoft }]}>
              <Text style={[styles.badgeText, { color: palette.primary }]}>Draft</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  glowOrb: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 420,
    opacity: 0.9,
  },
  shell: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  header: {
    borderBottomWidth: 1,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '65%',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.9,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  toggle: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  iconBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  btnPressed: {
    opacity: 0.85,
  },
  iconBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  mainRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 18,
    paddingTop: 16,
  },
  editorContainer: {
    flex: 1,
    borderRadius: 24,
  },
  editorCard: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
  editorHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
  },
  editorTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  editorHint: {
    fontSize: 12,
    marginTop: 4,
  },
  editorHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  smallBtn: {
    minWidth: 70,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallBtnText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  editorBody: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 10,
  },
  floatingInsertWrapper: {
    position: 'absolute',
    bottom: 18,
    left: 18,
  },
  insertButton: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insertButtonPressed: {
    transform: [{ scale: 0.96 }],
  },
  insertButtonText: {
    fontSize: 20,
    fontWeight: '700',
  },
  insertMenu: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 4,
    minWidth: 130,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  insertMenuItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  insertMenuItemPressed: {
    opacity: 0.85,
  },
  insertMenuItemText: {
    fontSize: 13,
    fontWeight: '500',
  },
  preview: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    marginTop: 10,
  },
  previewLabel: {
    fontSize: 10,
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  previewText: {
    fontSize: 13,
    lineHeight: 18,
  },
  sidePanel: {
    width: 260,
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  sideTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  sideSection: {
    paddingTop: 8,
  },
  sideSectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  outlineList: {
    gap: 4,
  },
  outlineEmpty: {
    fontSize: 11,
  },
  outlineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  outlineHash: {
    fontSize: 11,
    opacity: 0.8,
  },
  outlineText: {
    fontSize: 12,
    flexShrink: 1,
  },
  aiCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  aiTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  aiSubtitle: {
    fontSize: 11,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 14,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 12,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
