import { defaultEditorActions, type EditorActionId } from '@/constants/editor-actions';
import type { ThemeId } from '@/constants/theme';

export type WritingMode = 'essay' | 'diary';

export type Note = {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
  mode?: WritingMode;
  diaryDate?: number;
};

export type VaultSettings = {
  preventScreenCapture: boolean;
  themeId: ThemeId;
  editorActions: EditorActionId[];
  writingMode: WritingMode;
};

export type VaultData = {
  version: 1;
  notes: Note[];
  settings: VaultSettings;
};

export const emptyVault: VaultData = {
  version: 1,
  notes: [],
  settings: {
    preventScreenCapture: true,
    themeId: 'wood',
    editorActions: defaultEditorActions,
    writingMode: 'essay',
  },
};

