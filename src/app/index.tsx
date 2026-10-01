import { Stack, useRouter } from 'expo-router';
import { FilePlus2, Files, Pin, Search, SlidersHorizontal } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/icon-button';
import { DiaryCalendar } from '@/components/diary-calendar';
import { radii, spacing } from '@/constants/theme';
import { formatRelativeTime } from '@/lib/date';
import { richTextToPlainText } from '@/lib/rich-text';
import { useNotes } from '@/providers/notes-provider';
import type { Note, WritingMode } from '@/types/note';
import { useAppTheme } from '@/providers/theme-provider';

function NoteCard({ note, onOpen, onActions }: { note: Note; onOpen: () => void; onActions: () => void }) {
  const { palette } = useAppTheme();
  const preview = richTextToPlainText(note.body).replace(/\s+/g, ' ') || '轻触开始书写';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`打开${note.title || '未命名文稿'}`}
      onPress={onOpen}
      onLongPress={onActions}
      style={({ pressed }) => ({
        minHeight: 128,
        padding: spacing.md,
        borderRadius: radii.lg,
        borderCurve: 'continuous',
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.paper,
        opacity: pressed ? 0.78 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Text numberOfLines={1} style={{ flex: 1, color: palette.ink, fontSize: 18, fontWeight: '700', letterSpacing: -0.2 }}>
          {note.title.trim() || '未命名文稿'}
        </Text>
        {note.pinned ? <Pin size={16} color={palette.accent} fill={palette.accent} strokeWidth={1.6} /> : null}
      </View>
      <Text numberOfLines={2} style={{ marginTop: spacing.sm, color: palette.inkSoft, fontSize: 15, lineHeight: 23 }}>{preview}</Text>
      <View style={{ marginTop: 'auto', paddingTop: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ color: palette.inkFaint, fontSize: 12 }}>{formatRelativeTime(note.updatedAt)}</Text>{note.mode === 'diary' ? <Text style={{ color: palette.accent, fontSize: 11, fontWeight: '700' }}>日记</Text> : null}</View>
    </Pressable>
  );
}

export default function LibraryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { vault, createNote, updateNote, deleteNote, updateSettings } = useNotes();
  const { palette } = useAppTheme();
  const [query, setQuery] = useState('');
  const mode = vault.settings.writingMode;
  const modeNotes = useMemo(() => vault.notes.filter((note) => (note.mode ?? 'essay') === mode), [mode, vault.notes]);
  const notes = useMemo(() => modeNotes
    .filter((note) => `${note.title}\n${richTextToPlainText(note.body)}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt), [modeNotes, query]);

  const setMode = (writingMode: WritingMode) => {
    setQuery('');
    void updateSettings({ writingMode });
  };

  const addNote = async () => router.push(`/editor/${await createNote()}`);
  const actions = (note: Note) => Alert.alert(note.title || '未命名文稿', '选择一个操作', [
    { text: note.pinned ? '取消置顶' : '置顶', onPress: () => updateNote(note.id, { pinned: !note.pinned }) },
    { text: '删除', style: 'destructive', onPress: () => Alert.alert('删除这篇文稿？', '删除后无法恢复。', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => deleteNote(note.id) },
    ]) },
    { text: '取消', style: 'cancel' },
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <Stack.Screen options={{
        headerLeft: () => <View style={{ marginRight: 14 }}><IconButton label="设置" icon={SlidersHorizontal} onPress={() => router.push('/settings')} /></View>,
        headerRight: () => <View style={{ flexDirection: 'row', gap: spacing.sm }}><IconButton label="批量导出" icon={Files} onPress={() => router.push('/batch-export')} /><IconButton label="新建文稿" icon={FilePlus2} onPress={addNote} /></View>,
      }} />
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: Math.max(insets.bottom, spacing.md) + 84, gap: spacing.md, flexGrow: 1 }}
        ListHeaderComponent={(
          <View style={{ gap: spacing.md, paddingBottom: spacing.xs }}>
            <View accessibilityRole="tablist" style={{ flexDirection: 'row', padding: 4, borderRadius: radii.md, backgroundColor: palette.paperMuted, borderWidth: 1, borderColor: palette.border }}>
              {([{ id: 'essay' as const, label: '随笔' }, { id: 'diary' as const, label: '日记' }]).map((item) => {
                const selected = mode === item.id;
                return <Pressable key={item.id} accessibilityRole="tab" accessibilityState={{ selected }} onPress={() => setMode(item.id)} style={({ pressed }) => ({ flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: selected ? palette.paper : 'transparent', borderWidth: selected ? 1 : 0, borderColor: palette.border, opacity: pressed ? 0.72 : 1 })}><Text style={{ color: selected ? palette.accent : palette.inkSoft, fontSize: 15, fontWeight: selected ? '700' : '600' }}>{item.label}</Text></Pressable>;
              })}
            </View>
            {mode === 'diary' ? <DiaryCalendar notes={modeNotes} onOpen={(noteId) => router.push(`/editor/${noteId}`)} /> : null}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 44, paddingHorizontal: 14, borderRadius: radii.md, borderCurve: 'continuous', borderWidth: 1, borderColor: palette.border, backgroundColor: palette.paper }}>
              <Search size={18} color={palette.inkFaint} strokeWidth={1.8} />
              <TextInput accessibilityLabel={mode === 'diary' ? '搜索日记' : '搜索随笔'} value={query} onChangeText={setQuery} placeholder={mode === 'diary' ? '搜索日记标题或正文' : '搜索随笔标题或正文'} placeholderTextColor={palette.inkFaint} returnKeyType="search" style={{ flex: 1, color: palette.ink, fontSize: 16, paddingVertical: 10 }} />
            </View>
          </View>
        )}
        renderItem={({ item }) => <NoteCard note={item} onOpen={() => router.push(`/editor/${item.id}`)} onActions={() => actions(item)} />}
        ListEmptyComponent={(
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, minHeight: 360 }}>
            <View style={{ width: 64, height: 64, alignItems: 'center', justifyContent: 'center', borderRadius: 22, borderCurve: 'continuous', backgroundColor: palette.accentTint }}>
              <FilePlus2 size={27} color={palette.accent} strokeWidth={1.7} />
            </View>
            <Text style={{ marginTop: spacing.md, color: palette.ink, fontSize: 21, fontWeight: '700' }}>{query ? `没有找到${mode === 'diary' ? '日记' : '随笔'}` : `写下第一篇${mode === 'diary' ? '日记' : '随笔'}`}</Text>
            <Text style={{ marginTop: spacing.sm, color: palette.inkSoft, fontSize: 15, lineHeight: 23, textAlign: 'center' }}>{query ? '换个关键词试试' : `轻触右下角，新建${mode === 'diary' ? '日记' : '随笔'}。`}</Text>
          </View>
        )}
      />
      <Pressable accessibilityRole="button" accessibilityLabel="新建文稿" onPress={addNote} style={({ pressed }) => ({ position: 'absolute', right: spacing.lg, bottom: Math.max(insets.bottom, spacing.md) + spacing.md, width: 58, height: 58, alignItems: 'center', justifyContent: 'center', borderRadius: 20, borderCurve: 'continuous', backgroundColor: pressed ? palette.accentPressed : palette.accent, shadowColor: '#211F1B', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.18, shadowRadius: 10, elevation: 5, transform: [{ scale: pressed ? 0.96 : 1 }] })}>
        <FilePlus2 size={25} color={palette.white} strokeWidth={1.9} />
      </Pressable>
    </View>
  );
}
