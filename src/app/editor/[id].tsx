import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Bold, Check, Download, Heading2, Italic, List, ListOrdered, Quote } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { actions, RichEditor, RichToolbar, type IconRecord } from 'react-native-pell-rich-editor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/icon-button';
import { palette, radii, spacing } from '@/constants/theme';
import { countWords } from '@/lib/date';
import { normalizeRichText, richTextToPlainText, sanitizeRichText } from '@/lib/rich-text';
import { useNotes } from '@/providers/notes-provider';

const editorActions = [actions.setBold, actions.setItalic, actions.heading2, actions.blockquote, actions.insertBulletsList, actions.insertOrderedList];

const actionIcons = {
  [actions.setBold]: Bold,
  [actions.setItalic]: Italic,
  [actions.heading2]: Heading2,
  [actions.blockquote]: Quote,
  [actions.insertBulletsList]: List,
  [actions.insertOrderedList]: ListOrdered,
};

function renderToolbarIcon(action: keyof typeof actionIcons) {
  const ToolIcon = actionIcons[action];
  return function ToolbarIcon({ tintColor }: IconRecord) {
    return <ToolIcon size={20} color={tintColor} strokeWidth={1.9} />;
  };
}

const iconMap = Object.fromEntries(editorActions.map((action) => [action, renderToolbarIcon(action as keyof typeof actionIcons)]));

export default function EditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { vault, updateNote } = useNotes();
  const note = useMemo(() => vault.notes.find((item) => item.id === id), [vault.notes, id]);
  const noteId = note?.id;
  const initialBody = useMemo(() => normalizeRichText(note?.body ?? ''), [note?.body]);
  const [title, setTitle] = useState(note?.title ?? '');
  const [body, setBody] = useState(initialBody);
  const [saving, setSaving] = useState(false);
  const lastSaved = useRef(`${note?.title ?? ''}\u0000${note?.body ?? ''}`);
  const latestDraft = useRef({ title, body });
  const richText = useRef<RichEditor>(null);

  useEffect(() => {
    latestDraft.current = { title, body };
  }, [body, title]);

  useEffect(() => {
    if (!noteId) return;
    const snapshot = `${title}\u0000${body}`;
    if (snapshot === lastSaved.current) return;
    setSaving(true);
    const timer = setTimeout(() => {
      updateNote(noteId, { title, body })
        .then(() => { lastSaved.current = snapshot; })
        .finally(() => setSaving(false));
    }, 450);
    return () => clearTimeout(timer);
  }, [body, noteId, title, updateNote]);

  useEffect(() => () => {
    if (!noteId) return;
    const draft = latestDraft.current;
    const snapshot = `${draft.title}\u0000${draft.body}`;
    if (snapshot !== lastSaved.current) void updateNote(noteId, draft);
  }, [noteId, updateNote]);

  if (!note) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}><Text style={{ color: palette.inkSoft }}>这篇文稿不存在或已被删除。</Text></View>;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={92}>
      <Stack.Screen options={{
        title: saving ? '正在加密保存…' : '已加密保存',
        headerRight: () => <IconButton label="导出文稿" icon={Download} onPress={() => router.push(`/export/${note.id}`)} />,
      }} />
      <View style={{ flex: 1, backgroundColor: palette.background }}>
        <ScrollView keyboardDismissMode="interactive" keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 94 + insets.bottom }}>
          <TextInput
            accessibilityLabel="文稿标题"
            value={title}
            onChangeText={setTitle}
            placeholder="文稿标题"
            placeholderTextColor={palette.inkFaint}
            multiline
            maxLength={120}
            style={{ color: palette.ink, fontSize: 30, lineHeight: 39, fontWeight: '700', letterSpacing: -0.6, paddingVertical: spacing.md }}
          />
          <View style={{ height: 1, backgroundColor: palette.border }} />
          <RichEditor
            ref={richText}
            accessibilityLabel="文稿正文"
            initialContentHTML={initialBody}
            onChange={(html) => setBody(sanitizeRichText(html))}
            placeholder="从这里开始书写…"
            pasteAsPlainText
            autoCorrect
            autoCapitalize="sentences"
            initialHeight={460}
            style={{ flex: 1, minHeight: 460, backgroundColor: palette.background }}
            editorStyle={{
              backgroundColor: palette.background,
              color: palette.ink,
              caretColor: palette.accent,
              placeholderColor: palette.inkFaint,
              contentCSSText: 'font-size:18px;line-height:1.72;padding:20px 0 42px;font-family:serif;min-height:420px;overflow-wrap:anywhere;',
              cssText: `h2{font-size:25px;line-height:1.35;margin:24px 0 10px}p{margin:0 0 12px}blockquote{border-left:3px solid ${palette.accent};color:${palette.inkSoft};margin:16px 0;padding-left:14px}ul,ol{padding-left:25px}li{margin:6px 0}`,
            }}
          />
        </ScrollView>
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: Math.max(insets.bottom, spacing.xs), backgroundColor: palette.paper, borderTopWidth: 1, borderTopColor: palette.border }}>
          <RichToolbar
            getEditor={() => richText.current!}
            actions={editorActions}
            iconMap={iconMap}
            iconTint={palette.inkSoft}
            selectedIconTint={palette.accent}
            disabledIconTint={palette.inkFaint}
            style={{ height: 50, backgroundColor: palette.paper }}
            flatContainerStyle={{ paddingHorizontal: spacing.sm, gap: spacing.xs }}
            unselectedButtonStyle={{ width: 42, height: 42, borderRadius: radii.sm }}
            selectedButtonStyle={{ width: 42, height: 42, borderRadius: radii.sm, backgroundColor: palette.accentTint }}
          />
          <View style={{ paddingHorizontal: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: palette.inkFaint, fontSize: 12 }}>{countWords(richTextToPlainText(body))} 字</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><Check size={13} color={palette.success} /><Text style={{ color: palette.success, fontSize: 12 }}>{saving ? '保存中' : '本机已加密'}</Text></View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
