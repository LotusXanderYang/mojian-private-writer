import { Database, HardDrive, ShieldCheck, Trash2, WifiOff } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { palette, radii, spacing } from '@/constants/theme';
import { useNotes } from '@/providers/notes-provider';

const protections = [
  { icon: WifiOff, title: '离线优先', body: '不需要账号，不连接云端；Android 正式版直接移除网络权限。' },
  { icon: Database, title: '可靠本地保存', body: '不再使用文稿密钥。主副本与恢复副本都保存在系统隔离的应用私有空间，并在启动时自动校验与修复。' },
  { icon: HardDrive, title: '直接打开', body: '不设置应用锁，不依赖指纹、面容、密码或任何文稿密钥。' },
  { icon: ShieldCheck, title: '截屏防护', body: '应用内容默认禁止被截屏或录屏，导出长图时仅临时放行。' },
];

export default function PrivacyScreen() {
  const { clearAll } = useNotes();

  const confirmClear = () => Alert.alert('清除全部文稿？', '本机保存的全部文稿将永久删除，此操作无法撤销。', [
    { text: '取消', style: 'cancel' },
    { text: '永久清除', style: 'destructive', onPress: clearAll },
  ]);

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg }}>
      <View style={{ alignItems: 'center', paddingVertical: spacing.md }}>
        <View style={{ width: 68, height: 68, alignItems: 'center', justifyContent: 'center', borderRadius: 23, borderCurve: 'continuous', backgroundColor: palette.accent }}><HardDrive size={29} color={palette.white} strokeWidth={1.8} /></View>
        <Text style={{ marginTop: spacing.md, color: palette.ink, fontSize: 25, fontWeight: '700' }}>文稿只属于你</Text>
        <Text style={{ marginTop: spacing.sm, maxWidth: 320, color: palette.inkSoft, fontSize: 15, lineHeight: 23, textAlign: 'center' }}>不注册、不追踪、不上传。所有隐私保护默认开启。</Text>
      </View>
      <View style={{ gap: spacing.sm }}>
        {protections.map((item) => {
          const ItemIcon = item.icon;
          return <View key={item.title} style={{ minHeight: 92, flexDirection: 'row', gap: spacing.md, padding: spacing.md, borderRadius: radii.md, borderCurve: 'continuous', borderWidth: 1, borderColor: palette.border, backgroundColor: palette.paper }}><View style={{ width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md, backgroundColor: palette.accentTint }}><ItemIcon size={20} color={palette.accent} strokeWidth={1.8} /></View><View style={{ flex: 1 }}><Text style={{ color: palette.ink, fontSize: 16, fontWeight: '700' }}>{item.title}</Text><Text style={{ marginTop: 4, color: palette.inkSoft, fontSize: 14, lineHeight: 21 }}>{item.body}</Text></View></View>;
        })}
      </View>
      <View style={{ height: 1, backgroundColor: palette.border }} />
      <Pressable accessibilityRole="button" onPress={confirmClear} style={({ pressed }) => ({ minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderRadius: radii.md, borderWidth: 1, borderColor: palette.danger, backgroundColor: pressed ? palette.accentTint : 'transparent' })}><Trash2 size={18} color={palette.danger} strokeWidth={1.8} /><Text style={{ color: palette.danger, fontSize: 15, fontWeight: '700' }}>清除全部文稿</Text></Pressable>
      <Text selectable style={{ color: palette.inkFaint, fontSize: 12, lineHeight: 19, textAlign: 'center' }}>主副本与恢复副本仅存在本应用的私有空间，不联网、不共享。卸载应用或清除应用数据会同时删除文稿。</Text>
    </ScrollView>
  );
}
