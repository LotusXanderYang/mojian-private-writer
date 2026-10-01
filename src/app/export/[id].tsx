import { File as ExpoFile } from 'expo-file-system';
import { useLocalSearchParams } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';
import { FileImage, FileText, LoaderCircle } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { palette, radii, spacing } from '@/constants/theme';
import { exportPdf, exportWord, shareJpg } from '@/lib/export';
import { richTextToPlainText } from '@/lib/rich-text';
import { useNotes } from '@/providers/notes-provider';
import { screenCaptureProtectionKey } from '@/providers/screen-capture-provider';

type ExportKind = 'pdf' | 'word' | 'jpg';

const formats = [
  { kind: 'pdf' as const, title: 'PDF 文档', detail: '版式固定，适合打印和归档', icon: FileText },
  { kind: 'word' as const, title: 'Word 文档', detail: '可在办公软件中继续编辑', icon: FileText },
  { kind: 'jpg' as const, title: 'JPG 长图', detail: '适合保存到相册或发送图片', icon: FileImage },
];

export default function ExportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { vault } = useNotes();
  const note = vault.notes.find((item) => item.id === id);
  const previewRef = useRef<View>(null);
  const [working, setWorking] = useState<ExportKind | null>(null);

  const runExport = async (kind: ExportKind) => {
    if (!note || working) return;
    setWorking(kind);
    try {
      if (kind === 'pdf') await exportPdf(note);
      if (kind === 'word') await exportWord(note);
      if (kind === 'jpg') {
        await ScreenCapture.allowScreenCaptureAsync(screenCaptureProtectionKey);
        const uri = await captureRef(previewRef, { format: 'jpg', quality: 0.95, result: 'tmpfile' });
        try { await shareJpg(uri); } finally {
          const file = new ExpoFile(uri);
          if (file.exists) file.delete();
        }
      }
    } catch {
      Alert.alert('导出失败', '系统分享面板暂时无法打开，请稍后重试。');
    } finally {
      if (kind === 'jpg') await ScreenCapture.preventScreenCaptureAsync(screenCaptureProtectionKey).catch(() => undefined);
      setWorking(null);
    }
  };

  if (!note) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: palette.inkSoft }}>找不到这篇文稿。</Text></View>;

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg }}>
      <View ref={previewRef} collapsable={false} style={{ minHeight: 270, padding: spacing.lg, borderRadius: radii.lg, borderCurve: 'continuous', borderWidth: 1, borderColor: palette.border, backgroundColor: palette.paper }}>
        <Text style={{ color: palette.ink, fontSize: 25, lineHeight: 33, fontWeight: '700' }}>{note.title.trim() || '未命名文稿'}</Text>
        <View style={{ width: 36, height: 3, marginVertical: spacing.md, borderRadius: 2, backgroundColor: palette.accent }} />
        <Text style={{ color: palette.inkSoft, fontSize: 16, lineHeight: 27 }}>{richTextToPlainText(note.body) || '这是一篇空白文稿。'}</Text>
        <Text style={{ marginTop: spacing.lg, color: palette.inkFaint, fontSize: 11 }}>由墨笺在设备本地导出</Text>
      </View>
      <View style={{ gap: spacing.sm }}>
        <Text style={{ color: palette.ink, fontSize: 19, fontWeight: '700' }}>选择格式</Text>
        <Text style={{ color: palette.inkSoft, fontSize: 14, lineHeight: 21 }}>只有你主动导出时，文稿才会交给系统分享面板。</Text>
      </View>
      <View style={{ gap: spacing.sm }}>
        {formats.map((format) => {
          const FormatIcon = format.icon;
          const busy = working === format.kind;
          return (
            <Pressable key={format.kind} accessibilityRole="button" accessibilityLabel={`导出为${format.title}`} disabled={Boolean(working)} onPress={() => runExport(format.kind)} style={({ pressed }) => ({ minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radii.md, borderCurve: 'continuous', borderWidth: 1, borderColor: palette.border, backgroundColor: palette.paper, opacity: working && !busy ? 0.48 : pressed ? 0.78 : 1 })}>
              <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md, backgroundColor: palette.accentTint }}>
                {busy ? <LoaderCircle size={21} color={palette.accent} /> : <FormatIcon size={21} color={palette.accent} strokeWidth={1.8} />}
              </View>
              <View style={{ flex: 1 }}><Text style={{ color: palette.ink, fontSize: 16, fontWeight: '700' }}>{format.title}</Text><Text style={{ marginTop: 3, color: palette.inkSoft, fontSize: 13 }}>{format.detail}</Text></View>
              <Text style={{ color: palette.accent, fontSize: 14, fontWeight: '700' }}>{busy ? '处理中…' : '导出'}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
