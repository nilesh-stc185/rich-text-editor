import { useState, useCallback, useRef, useEffect } from 'react';
import type { EditorFormatState } from '../types';
import type { RichEditor } from 'react-native-pell-rich-editor';

const DEFAULT_FORMAT_STATE: EditorFormatState = {
  bold: false,
  italic: false,
  underline: false,
  strikeThrough: false,
  subscript: false,
  superscript: false,
};

function selectionToFormatState(items: (string | { type: string; value: string })[]): EditorFormatState {
  const state = { ...DEFAULT_FORMAT_STATE };
  if (!Array.isArray(items)) return state;
  for (const item of items) {
    if (typeof item === 'string') {
      (state as Record<string, boolean>)[item] = true;
    } else if (item && typeof item === 'object' && 'type' in item) {
      (state as Record<string, boolean>)[item.type] = true;
    }
  }
  return state;
}

export function useEditorFormatState(editorRef: React.RefObject<RichEditor | null>) {
  const [formatState, setFormatState] = useState<EditorFormatState>(DEFAULT_FORMAT_STATE);
  const listenerRef = useRef<((items: (string | { type: string; value: string })[]) => void) | null>(null);

  const register = useCallback((editor: RichEditor | null) => {
    if (!editor || !editor.registerToolbar) return;
    const listener = (items: (string | { type: string; value: string })[]) => {
      setFormatState(selectionToFormatState(items));
    };
    listenerRef.current = listener;
    editor.registerToolbar(listener);
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor) register(editor);
    return () => {
      listenerRef.current = null;
    };
  }, [editorRef, register]);

  return { formatState, register };
}
