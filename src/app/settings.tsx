import { useRouter } from 'expo-router';
import { BookOpenText, Check, ChevronRight, Info, Moon, NotebookPen, Trash2 } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { editorActionIds, editorActionLabels, type EditorActionId } from '@/constants/editor-actions';
import { radii, spacing, themes, themeIds, type ThemeId } from '@/constants/theme';
import { useNotes } from '@/providers/notes-provider';
import { useAppTheme } from '@/providers/theme-provider';
import type { WritingMode } from '@/types/note';

function SectionTitle({ children }: { children: string }) {
  const { palette } = useAppTheme();
  return <Text style={{ color: palette.ink, fontSize: 19, fontWeight: '700', letterSpacing: -0.2 }}>{children}</Text>;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { vault, updateSettings, clearAll } = useNotes();
  const { palette } = useAppTheme();
  const selectedActions = vault.settings.editorActions;

  const setMode = (writingMode: WritingMode) => void updateSettings({ writingMode });
  const setTheme = (themeId: ThemeId) => void updateSettings({ themeId });
  const toggleAction = (action: EditorActionId) => {
    const next = selectedActions.includes(action) ? selectedActions.filter((item) => item !== action) : [...selectedActions, action];
    void updateSettings({ editorActions: next });
  };
  const confirmClear = () => Alert.alert('清除全部文稿？', '本机保存的全部文稿将永久删除，此操作无法撤销。', [
    { text: '取消', style: 'cancel' }, { text: '永久清除', style: 'destructive', onPress: clearAll },
  ]);

  return (
    <ScrollView style={{ backgroundColor: palette.background }} contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.xl }}>
      <View style={{ gap: spacing.md }}>
        <SectionTitle>主页与新建模式</SectionTitle>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {([
            { id: 'essay' as const, label: '随笔', detail: '只显示随笔', icon: BookOpenText },
            { id: 'diary' as const, label: '日记', detail: '日历与时间标注', icon: NotebookPen },
          ]).map((item) => {
            const selected = vault.settings.writingMode === item.id;
            const Icon = item.icon;
            return <Pressable key={item.id} accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => setMode(item.id)} style={({ pressed }) => ({ flex: 1, minHeight: 92, padding: spacing.md, borderRadius: radii.md, borderWidth: selected ? 2 : 1, borderColor: selected ? palette.accent : palette.border, backgroundColor: selected ? palette.accentTint : palette.paper, opacity: pressed ? 0.78 : 1 })}><Icon size={21} color={selected ? palette.accent : palette.inkSoft} /><Text style={{ marginTop: 10, color: palette.ink, fontSize: 16, fontWeight: '700' }}>{item.label}</Text><Text style={{ marginTop: 3, color: palette.inkSoft, fontSize: 12 }}>{item.detail}</Text></Pressable>;
          })}
        </View>
      </View>

      <View style={{ gap: spacing.md }}>
        <SectionTitle>主题颜色</SectionTitle>
        <View style={{ gap: spacing.sm }}>
          {themeIds.map((id) => {
            const theme = themes[id];
            const selected = vault.settings.themeId === id;
            return <Pressable key={id} accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => setTheme(id)} style={({ pressed }) => ({ minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: 12, borderRadius: radii.md, borderWidth: selected ? 2 : 1, borderColor: selected ? palette.accent : palette.border, backgroundColor: palette.paper, opacity: pressed ? 0.78 : 1 })}><View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: theme.palette.background, borderWidth: 1, borderColor: theme.palette.border, alignItems: 'center', justifyContent: 'center' }}><View style={{ width: 18, height: 18, borderRadius: 6, backgroundColor: theme.palette.accent }} />{theme.dark ? <Moon size={13} color={theme.palette.ink} style={{ position: 'absolute', right: 3, top: 3 }} /> : null}</View><View style={{ flex: 1 }}><Text style={{ color: palette.ink, fontSize: 16, fontWeight: '700' }}>{theme.name}</Text><Text style={{ marginTop: 3, color: palette.inkSoft, fontSize: 13 }}>{theme.description}</Text></View>{selected ? <Check size={19} color={palette.accent} /> : null}</Pressable>;
          })}
        </View>
      </View>

      <View style={{ gap: spacing.md }}>
        <SectionTitle>编辑工具栏</SectionTitle>
        <Text style={{ marginTop: -8, color: palette.inkSoft, fontSize: 13, lineHeight: 20 }}>选择需要在编辑页底部显示的格式。图片按钮始终保留。</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {editorActionIds.map((action) => {
            const selected = selectedActions.includes(action);
            return <Pressable key={action} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={() => toggleAction(action)} style={({ pressed }) => ({ minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 13, borderRadius: radii.pill, borderWidth: 1, borderColor: selected ? palette.accent : palette.borderStrong, backgroundColor: selected ? palette.accentTint : palette.paper, opacity: pressed ? 0.72 : 1 })}>{selected ? <Check size={14} color={palette.accent} /> : null}<Text style={{ color: selected ? palette.accent : palette.inkSoft, fontSize: 14, fontWeight: selected ? '700' : '500' }}>{editorActionLabels[action]}</Text></Pressable>;
          })}
        </View>
      </View>

      <View style={{ gap: spacing.sm }}>
        <Pressable accessibilityRole="button" onPress={() => router.push('/about')} style={({ pressed }) => ({ minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, borderRadius: radii.md, backgroundColor: palette.paper, borderWidth: 1, borderColor: palette.border, opacity: pressed ? 0.75 : 1 })}><Info size={20} color={palette.accent} /><View style={{ flex: 1 }}><Text style={{ color: palette.ink, fontSize: 16, fontWeight: '700' }}>关于墨笺</Text><Text style={{ color: palette.inkSoft, fontSize: 12, marginTop: 3 }}>安全说明、版本更新与 GitHub</Text></View><ChevronRight size={18} color={palette.inkFaint} /></Pressable>
        <Pressable accessibilityRole="button" onPress={confirmClear} style={({ pressed }) => ({ minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderRadius: radii.md, borderWidth: 1, borderColor: palette.danger, opacity: pressed ? 0.68 : 1 })}><Trash2 size={18} color={palette.danger} /><Text style={{ color: palette.danger, fontSize: 15, fontWeight: '700' }}>清除全部文稿</Text></Pressable>
      </View>
    </ScrollView>
  );
}
