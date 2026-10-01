import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Bold, Check, Download, ImagePlus, Italic, List, ListOrdered, Quote, Redo2, Strikethrough, Underline, Undo2 } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { actions, RichEditor, RichToolbar, type IconRecord } from 'react-native-pell-rich-editor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/icon-button';
import type { EditorActionId } from '@/constants/editor-actions';
import { radii, spacing } from '@/constants/theme';
import { countWords, formatDiaryTimestamp } from '@/lib/date';
import { normalizeRichText, richTextToPlainText, sanitizeRichText } from '@/lib/rich-text';
import { useNotes } from '@/providers/notes-provider';
import { useAppTheme } from '@/providers/theme-provider';

const actionById: Record<EditorActionId, string> = {
  bold: actions.setBold, italic: actions.setItalic, heading2: actions.heading2, heading3: actions.heading3, heading4: actions.heading4, heading5: actions.heading5,
  blockquote: actions.blockquote, unorderedList: actions.insertBulletsList, orderedList: actions.insertOrderedList, strikethrough: actions.setStrikethrough,
  underline: actions.setUnderline, undo: actions.undo, redo: actions.redo,
};

const iconsByAction: Record<string, typeof Bold> = {
  [actions.setBold]: Bold, [actions.setItalic]: Italic, [actions.blockquote]: Quote, [actions.insertBulletsList]: List,
  [actions.insertOrderedList]: ListOrdered, [actions.setStrikethrough]: Strikethrough, [actions.setUnderline]: Underline,
  [actions.undo]: Undo2, [actions.redo]: Redo2, [actions.insertImage]: ImagePlus,
};

function iconFor(action: string) {
  return function ToolbarIcon({ tintColor }: IconRecord) {
    const heading = Object.entries({ [actions.heading2]: 'H2', [actions.heading3]: 'H3', [actions.heading4]: 'H4', [actions.heading5]: 'H5' }).find(([key]) => key === action)?.[1];
    if (heading) return <Text style={{ color: tintColor, fontSize: 15, fontWeight: '800' }}>{heading}</Text>;
    const Icon = iconsByAction[action] ?? Bold;
    return <Icon size={20} color={tintColor} strokeWidth={1.9} />;
  };
}

export default function EditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { vault, updateNote } = useNotes();
  const { palette } = useAppTheme();
  const note = useMemo(() => vault.notes.find((item) => item.id === id), [vault.notes, id]);
  const noteId = note?.id;
  const initialBody = useMemo(() => normalizeRichText(note?.body ?? ''), [note?.body]);
  const [title, setTitle] = useState(note?.title ?? '');
  const [body, setBody] = useState(initialBody);
  const [saving, setSaving] = useState(false);
  const lastSaved = useRef(`${note?.title ?? ''}\u0000${note?.body ?? ''}`);
  const latestDraft = useRef({ title, body });
  const richText = useRef<RichEditor>(null);
  const toolbarActions = useMemo(() => [...vault.settings.editorActions.map((item) => actionById[item]), actions.insertImage], [vault.settings.editorActions]);
  const iconMap = useMemo(() => Object.fromEntries(toolbarActions.map((action) => [action, iconFor(action)])), [toolbarActions]);

  useEffect(() => { latestDraft.current = { title, body }; }, [body, title]);
  useEffect(() => {
    if (!noteId) return;
    const snapshot = `${title}\u0000${body}`;
    if (snapshot === lastSaved.current) return;
    setSaving(true);
    const timer = setTimeout(() => { updateNote(noteId, { title, body }).then(() => { lastSaved.current = snapshot; }).finally(() => setSaving(false)); }, 450);
    return () => clearTimeout(timer);
  }, [body, noteId, title, updateNote]);
  useEffect(() => () => {
    if (!noteId) return;
    const draft = latestDraft.current;
    if (`${draft.title}\u0000${draft.body}` !== lastSaved.current) void updateNote(noteId, draft);
  }, [noteId, updateNote]);

  const insertPickedImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 1 });
      if (result.canceled) return;
      const asset = result.assets[0];
      const resize = asset.width > 1280 ? [{ resize: { width: 1280 } }] : [];
      const processed = await manipulateAsync(asset.uri, resize, { compress: 0.68, format: SaveFormat.JPEG, base64: true });
      if (!processed.base64) throw new Error('missing-base64');
      if (processed.base64.length > 2_000_000) {
        Alert.alert('图片过大', '这张图压缩后仍然过大，为了保持文稿保存稳定，请选择更小的图片。');
        return;
      }
      richText.current?.insertImage(`data:image/jpeg;base64,${processed.base64}`, 'max-width:100%;height:auto;border-radius:12px;margin:10px 0;');
    } catch {
      Alert.alert('无法插入图片', '图片选择或本地压缩未完成，请重试。');
    }
  };

  if (!note) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: palette.background }}><Text style={{ color: palette.inkSoft }}>这篇文稿不存在或已被删除。</Text></View>;

  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={92}>
    <Stack.Screen options={{ title: saving ? '正在保存…' : '已保存', headerRight: () => <IconButton label="导出文稿" icon={Download} onPress={() => router.push(`/export/${note.id}`)} /> }} />
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <ScrollView keyboardDismissMode="interactive" keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 94 + insets.bottom }}>
        {note.mode === 'diary' ? <Text style={{ color: palette.accent, fontSize: 13, fontWeight: '700', marginTop: spacing.sm }}>{formatDiaryTimestamp(note.diaryDate ?? note.createdAt)}</Text> : null}
        <TextInput accessibilityLabel="文稿标题" value={title} onChangeText={setTitle} placeholder="文稿标题" placeholderTextColor={palette.inkFaint} multiline maxLength={120} style={{ color: palette.ink, fontSize: 30, lineHeight: 39, fontWeight: '700', letterSpacing: -0.6, paddingVertical: spacing.md }} />
        <View style={{ height: 1, backgroundColor: palette.border }} />
        <RichEditor ref={richText} accessibilityLabel="文稿正文" initialContentHTML={initialBody} onChange={(html) => setBody(sanitizeRichText(html))} placeholder="从这里开始书写…" pasteAsPlainText autoCorrect autoCapitalize="sentences" initialHeight={460} style={{ flex: 1, minHeight: 460, backgroundColor: palette.background }} editorStyle={{ backgroundColor: palette.background, color: palette.ink, caretColor: palette.accent, placeholderColor: palette.inkFaint, contentCSSText: 'font-size:18px;line-height:1.72;padding:20px 0 42px;font-family:serif;min-height:420px;overflow-wrap:anywhere;', cssText: `h2{font-size:25px}h3{font-size:22px}h4{font-size:20px}h5{font-size:18px}h2,h3,h4,h5{line-height:1.35;margin:22px 0 9px}p{margin:0 0 12px}blockquote{border-left:3px solid ${palette.accent};color:${palette.inkSoft};margin:16px 0;padding-left:14px}ul,ol{padding-left:25px}li{margin:6px 0}img{display:block;max-width:100%;height:auto}` }} />
      </ScrollView>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: Math.max(insets.bottom, spacing.xs), backgroundColor: palette.paper, borderTopWidth: 1, borderTopColor: palette.border }}>
        <RichToolbar getEditor={() => richText.current!} actions={toolbarActions} iconMap={iconMap} onPressAddImage={insertPickedImage} iconTint={palette.inkSoft} selectedIconTint={palette.accent} disabledIconTint={palette.inkFaint} style={{ height: 50, backgroundColor: palette.paper }} flatContainerStyle={{ paddingHorizontal: spacing.sm, gap: spacing.xs }} unselectedButtonStyle={{ width: 42, height: 42, borderRadius: radii.sm }} selectedButtonStyle={{ width: 42, height: 42, borderRadius: radii.sm, backgroundColor: palette.accentTint }} />
        <View style={{ paddingHorizontal: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ color: palette.inkFaint, fontSize: 12 }}>{countWords(richTextToPlainText(body))} 字</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><Check size={13} color={palette.success} /><Text style={{ color: palette.success, fontSize: 12 }}>{saving ? '保存中' : '本机已保存'}</Text></View></View>
      </View>
    </View>
  </KeyboardAvoidingView>;
}
