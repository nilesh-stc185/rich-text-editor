import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { EditorStats } from './types';

export interface WordCountFooterProps {
  stats: EditorStats;
  theme?: 'light' | 'dark' | 'glass';
  style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
}

export function WordCountFooter({ stats, theme = 'light', style }: WordCountFooterProps) {
  const isDark = theme === 'dark';
  const isGlass = theme === 'glass';

  const textStyle = [
    styles.text,
    isDark && styles.textDark,
    isGlass && styles.textGlass,
  ];

  return (
    <View style={[styles.wrapper, isDark && styles.wrapperDark, isGlass && styles.wrapperGlass, style]}>
      <Text style={textStyle}>
        {stats.words} {stats.words === 1 ? 'word' : 'words'}
      </Text>
      <Text style={[styles.sep, textStyle]}>·</Text>
      <Text style={textStyle}>
        {stats.characters} characters
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  wrapperDark: {
    borderTopColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  wrapperGlass: {
    borderTopColor: 'rgba(148, 163, 184, 0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  text: {
    fontSize: 12,
    color: '#64748b',
  },
  textDark: {
    color: '#94a3b8',
  },
  textGlass: {
    color: '#475569',
  },
  sep: {
    marginHorizontal: 6,
  },
});
