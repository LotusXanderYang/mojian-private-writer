import { Stack, useRouter } from 'expo-router';
import { FilePlus2, LockKeyhole, Pin, Search, ShieldCheck } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/icon-button';
import { palette, radii, spacing } from '@/constants/theme';
import { formatRelativeTime } from '@/lib/date';
import { richTextToPlainText } from '@/lib/rich-text';
import { useNotes } from '@/providers/notes-provider';
import type { Note } from '@/types/note';

function NoteCard({ note, onOpen, onActions }: { note: Note; onOpen: () => void; onActions: () => void }) {
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
      <Text style={{ marginTop: 'auto', paddingTop: spacing.md, color: palette.inkFaint, fontSize: 12 }}>{formatRelativeTime(note.updatedAt)}</Text>
    </Pressable>
  );
}

export default function LibraryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { vault, createNote, updateNote, deleteNote } = useNotes();
  const [query, setQuery] = useState('');
  const notes = useMemo(() => vault.notes
    .filter((note) => `${note.title}\n${richTextToPlainText(note.body)}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt), [vault.notes, query]);

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
        headerLeft: () => <IconButton label="隐私与安全" icon={ShieldCheck} onPress={() => router.push('/privacy')} />,
        headerRight: () => <IconButton label="新建文稿" icon={FilePlus2} onPress={addNote} />,
      }} />
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: Math.max(insets.bottom, spacing.md) + 84, gap: spacing.md, flexGrow: 1 }}
        ListHeaderComponent={(
          <View style={{ gap: spacing.md, paddingBottom: spacing.xs }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 44, paddingHorizontal: 14, borderRadius: radii.md, borderCurve: 'continuous', borderWidth: 1, borderColor: palette.border, backgroundColor: palette.paper }}>
              <Search size={18} color={palette.inkFaint} strokeWidth={1.8} />
              <TextInput accessibilityLabel="搜索文稿" value={query} onChangeText={setQuery} placeholder="搜索标题或正文" placeholderTextColor={palette.inkFaint} returnKeyType="search" style={{ flex: 1, color: palette.ink, fontSize: 16, paddingVertical: 10 }} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <LockKeyhole size={16} color={palette.success} strokeWidth={1.8} />
              <Text style={{ color: palette.success, fontSize: 13, fontWeight: '600' }}>仅存本机 · 双副本保存 · 截屏防护</Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => <NoteCard note={item} onOpen={() => router.push(`/editor/${item.id}`)} onActions={() => actions(item)} />}
        ListEmptyComponent={(
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, minHeight: 360 }}>
            <View style={{ width: 64, height: 64, alignItems: 'center', justifyContent: 'center', borderRadius: 22, borderCurve: 'continuous', backgroundColor: palette.accentTint }}>
              <FilePlus2 size={27} color={palette.accent} strokeWidth={1.7} />
            </View>
            <Text style={{ marginTop: spacing.md, color: palette.ink, fontSize: 21, fontWeight: '700' }}>{query ? '没有找到文稿' : '写下第一篇文稿'}</Text>
            <Text style={{ marginTop: spacing.sm, color: palette.inkSoft, fontSize: 15, lineHeight: 23, textAlign: 'center' }}>{query ? '换个关键词试试' : '内容会保存在应用私有空间，不上传云端。'}</Text>
          </View>
        )}
      />
      <Pressable accessibilityRole="button" accessibilityLabel="新建文稿" onPress={addNote} style={({ pressed }) => ({ position: 'absolute', right: spacing.lg, bottom: Math.max(insets.bottom, spacing.md) + spacing.md, width: 58, height: 58, alignItems: 'center', justifyContent: 'center', borderRadius: 20, borderCurve: 'continuous', backgroundColor: pressed ? palette.accentPressed : palette.accent, shadowColor: '#211F1B', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.18, shadowRadius: 10, elevation: 5, transform: [{ scale: pressed ? 0.96 : 1 }] })}>
        <FilePlus2 size={25} color={palette.white} strokeWidth={1.9} />
      </Pressable>
    </View>
  );
}
