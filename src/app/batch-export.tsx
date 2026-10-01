import { Check, FileText, LoaderCircle } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radii, spacing } from '@/constants/theme';
import { exportPdfMany, exportWordMany } from '@/lib/export';
import { useNotes } from '@/providers/notes-provider';
import { useAppTheme } from '@/providers/theme-provider';

type BatchKind = 'pdf' | 'word';

export default function BatchExportScreen() {
  const { vault } = useNotes();
  const { palette } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [working, setWorking] = useState<BatchKind | null>(null);
  const notes = useMemo(() => [...vault.notes].sort((a, b) => b.updatedAt - a.updatedAt), [vault.notes]);
  const allSelected = notes.length > 0 && selected.size === notes.length;
  const chosen = notes.filter((note) => selected.has(note.id));

  const toggle = (id: string) => setSelected((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const run = async (kind: BatchKind) => {
    if (!chosen.length || working) return;
    setWorking(kind);
    try {
      if (kind === 'pdf') await exportPdfMany(chosen); else await exportWordMany(chosen);
    } catch {
      Alert.alert('批量导出失败', '系统分享面板暂时无法打开，请稍后重试。');
    } finally { setWorking(null); }
  };

  return <View style={{ flex: 1, backgroundColor: palette.background }}>
    <FlatList
      data={notes}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: 112 + insets.bottom, gap: spacing.sm, flexGrow: 1 }}
      ListHeaderComponent={<View style={{ gap: spacing.sm, marginBottom: spacing.sm }}>
        <Text style={{ color: palette.inkSoft, fontSize: 14, lineHeight: 21 }}>选中多篇文稿后，可合并为一份 PDF 或 Word 文档。</Text>
        <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: allSelected }} onPress={() => setSelected(allSelected ? new Set() : new Set(notes.map((note) => note.id)))} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <View style={{ width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: allSelected ? palette.accent : palette.paper, borderWidth: 1, borderColor: allSelected ? palette.accent : palette.borderStrong }}>{allSelected ? <Check size={16} color={palette.white} /> : null}</View>
          <Text style={{ color: palette.ink, fontSize: 15, fontWeight: '700' }}>全选 {notes.length} 篇</Text>
        </Pressable>
      </View>}
      renderItem={({ item }) => {
        const checked = selected.has(item.id);
        return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={() => toggle(item.id)} style={({ pressed }) => ({ minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: checked ? palette.accent : palette.border, backgroundColor: checked ? palette.accentTint : palette.paper, opacity: pressed ? 0.75 : 1 })}>
          <View style={{ width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: checked ? palette.accent : 'transparent', borderWidth: 1, borderColor: checked ? palette.accent : palette.borderStrong }}>{checked ? <Check size={16} color={palette.white} /> : null}</View>
          <Text numberOfLines={2} style={{ flex: 1, color: palette.ink, fontSize: 16, fontWeight: '600' }}>{item.title.trim() || '未命名文稿'}</Text>
        </Pressable>;
      }}
      ListEmptyComponent={<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 320 }}><Text style={{ color: palette.inkSoft }}>暂无可导出的文稿</Text></View>}
    />
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: spacing.sm, padding: spacing.md, paddingBottom: Math.max(insets.bottom, spacing.md), backgroundColor: palette.paper, borderTopWidth: 1, borderTopColor: palette.border }}>
      {(['pdf', 'word'] as const).map((kind) => <Pressable key={kind} accessibilityRole="button" disabled={!chosen.length || Boolean(working)} onPress={() => run(kind)} style={({ pressed }) => ({ flex: 1, minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderRadius: radii.md, backgroundColor: palette.accent, opacity: !chosen.length || (working && working !== kind) ? 0.42 : pressed ? 0.76 : 1 })}>
        {working === kind ? <LoaderCircle size={18} color={palette.white} /> : <FileText size={18} color={palette.white} />}
        <Text style={{ color: palette.white, fontSize: 15, fontWeight: '700' }}>{kind === 'pdf' ? '合并 PDF' : '合并 Word'}</Text>
      </Pressable>)}
    </View>
  </View>;
}
