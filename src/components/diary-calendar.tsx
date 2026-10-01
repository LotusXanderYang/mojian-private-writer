import { CalendarDays, ChevronRight } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { radii, spacing } from '@/constants/theme';
import { useAppTheme } from '@/providers/theme-provider';
import type { Note } from '@/types/note';

const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

function dateKey(timestamp: number): string {
  const date = new Date(timestamp);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function DiaryCalendar({ notes, onOpen }: { notes: Note[]; onOpen: (id: string) => void }) {
  const { palette } = useAppTheme();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayKey = dateKey(now.getTime());
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const leadingBlanks = (new Date(year, month, 1).getDay() + 6) % 7;
  const dayCount = new Date(year, month + 1, 0).getDate();
  const cells = [...Array.from({ length: leadingBlanks }, () => null), ...Array.from({ length: dayCount }, (_, index) => index + 1)];
  const notesByDay = useMemo(() => {
    const grouped = new Map<string, Note[]>();
    for (const note of notes) {
      const key = dateKey(note.diaryDate ?? note.createdAt);
      grouped.set(key, [...(grouped.get(key) ?? []), note]);
    }
    for (const entries of grouped.values()) entries.sort((a, b) => (b.diaryDate ?? b.createdAt) - (a.diaryDate ?? a.createdAt));
    return grouped;
  }, [notes]);
  const selectedNotes = selectedKey ? notesByDay.get(selectedKey) ?? [] : [];
  const selectedDate = selectedKey ? new Date(`${selectedKey}T12:00:00`) : null;

  return <View style={{ gap: spacing.md, paddingHorizontal: spacing.sm, paddingVertical: spacing.md, borderRadius: radii.lg, borderCurve: 'continuous', borderWidth: 1, borderColor: palette.border, backgroundColor: palette.paper }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}><View style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: palette.accentTint }}><CalendarDays size={19} color={palette.accent} strokeWidth={1.8} /></View><View><Text style={{ color: palette.ink, fontSize: 18, fontWeight: '700' }}>{year} 年 {month + 1} 月</Text><Text style={{ marginTop: 2, color: palette.inkFaint, fontSize: 12 }}>有底色的日期写过日记</Text></View></View>
    <View style={{ flexDirection: 'row' }}>{weekDays.map((day) => <View key={day} style={{ width: '14.2857%', alignItems: 'center', paddingVertical: 4 }}><Text style={{ color: palette.inkFaint, fontSize: 12, fontWeight: '600' }}>{day}</Text></View>)}</View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{cells.map((day, index) => {
      if (!day) return <View key={`blank-${index}`} style={{ width: '14.2857%', aspectRatio: 1 }} />;
      const key = dateKey(new Date(year, month, day, 12).getTime());
      const hasEntry = notesByDay.has(key);
      const selected = selectedKey === key;
      const today = todayKey === key;
      return <View key={key} style={{ width: '14.2857%', aspectRatio: 1 }}><Pressable accessibilityRole="button" accessibilityLabel={`${month + 1}月${day}日${hasEntry ? '，有日记' : ''}`} accessibilityState={{ selected }} onPress={() => setSelectedKey(key)} style={({ pressed }) => ({ flex: 1, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.68 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] })}><View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 13, borderWidth: today && !selected ? 1 : 0, borderColor: palette.accent, backgroundColor: selected ? palette.accent : hasEntry ? palette.accentTint : 'transparent' }}><Text style={{ color: selected ? palette.white : hasEntry ? palette.accent : palette.inkSoft, fontSize: 14, fontWeight: selected || hasEntry ? '700' : '500' }}>{day}</Text>{hasEntry && !selected ? <View style={{ position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: 2, backgroundColor: palette.accent }} /> : null}</View></Pressable></View>;
    })}</View>
    {selectedDate ? <View style={{ paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: palette.border, gap: spacing.sm }}><Text style={{ color: palette.ink, fontSize: 15, fontWeight: '700' }}>{new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(selectedDate)}</Text>{selectedNotes.length ? selectedNotes.map((note) => <Pressable key={note.id} accessibilityRole="button" onPress={() => onOpen(note.id)} style={({ pressed }) => ({ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: 12, borderRadius: radii.md, backgroundColor: palette.paperMuted, opacity: pressed ? 0.7 : 1 })}><Text numberOfLines={2} style={{ flex: 1, color: palette.ink, fontSize: 14, fontWeight: '600' }}>{note.title.trim() || '未命名日记'}</Text><ChevronRight size={17} color={palette.inkFaint} /></Pressable>) : <Text style={{ color: palette.inkFaint, fontSize: 13, lineHeight: 20 }}>这一天还没有日记。</Text>}</View> : null}
  </View>;
}
