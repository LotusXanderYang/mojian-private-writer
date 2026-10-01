import { Database, Fingerprint, LockKeyhole, ShieldCheck, Trash2, WifiOff } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { palette, radii, spacing } from '@/constants/theme';
import { useNotes } from '@/providers/notes-provider';
import { usePrivacy } from '@/providers/privacy-provider';

const protections = [
  { icon: WifiOff, title: '离线优先', body: '不需要账号，不连接云端；Android 正式版直接移除网络权限。' },
  { icon: Database, title: '可靠加密保存', body: '文稿使用 AES-GCM 加密；密钥优先保存在设备安全存储，并在应用私有沙箱保留兼容恢复副本。' },
  { icon: Fingerprint, title: '设备锁验证', body: '打开应用及返回前台时锁定；墨笺不会获取你的生物特征。' },
  { icon: ShieldCheck, title: '截屏防护', body: '应用内容默认禁止被截屏或录屏，导出长图时仅临时放行。' },
];

export default function PrivacyScreen() {
  const { clearAll } = useNotes();
  const { lockNow } = usePrivacy();

  const confirmClear = () => Alert.alert('清除全部文稿？', '本机的加密文稿将永久删除，此操作无法撤销。', [
    { text: '取消', style: 'cancel' },
    { text: '永久清除', style: 'destructive', onPress: clearAll },
  ]);

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg }}>
      <View style={{ alignItems: 'center', paddingVertical: spacing.md }}>
        <View style={{ width: 68, height: 68, alignItems: 'center', justifyContent: 'center', borderRadius: 23, borderCurve: 'continuous', backgroundColor: palette.accent }}><LockKeyhole size={29} color={palette.white} strokeWidth={1.8} /></View>
        <Text style={{ marginTop: spacing.md, color: palette.ink, fontSize: 25, fontWeight: '700' }}>文稿只属于你</Text>
        <Text style={{ marginTop: spacing.sm, maxWidth: 320, color: palette.inkSoft, fontSize: 15, lineHeight: 23, textAlign: 'center' }}>不注册、不追踪、不上传。所有隐私保护默认开启。</Text>
      </View>
      <View style={{ gap: spacing.sm }}>
        {protections.map((item) => {
          const ItemIcon = item.icon;
          return <View key={item.title} style={{ minHeight: 92, flexDirection: 'row', gap: spacing.md, padding: spacing.md, borderRadius: radii.md, borderCurve: 'continuous', borderWidth: 1, borderColor: palette.border, backgroundColor: palette.paper }}><View style={{ width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md, backgroundColor: palette.accentTint }}><ItemIcon size={20} color={palette.accent} strokeWidth={1.8} /></View><View style={{ flex: 1 }}><Text style={{ color: palette.ink, fontSize: 16, fontWeight: '700' }}>{item.title}</Text><Text style={{ marginTop: 4, color: palette.inkSoft, fontSize: 14, lineHeight: 21 }}>{item.body}</Text></View></View>;
        })}
      </View>
      <Pressable accessibilityRole="button" onPress={lockNow} style={({ pressed }) => ({ minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md, backgroundColor: pressed ? palette.accentPressed : palette.accent })}><Text style={{ color: palette.white, fontSize: 16, fontWeight: '700' }}>立即锁定墨笺</Text></Pressable>
      <View style={{ height: 1, backgroundColor: palette.border }} />
      <Pressable accessibilityRole="button" onPress={confirmClear} style={({ pressed }) => ({ minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderRadius: radii.md, borderWidth: 1, borderColor: palette.danger, backgroundColor: pressed ? palette.accentTint : 'transparent' })}><Trash2 size={18} color={palette.danger} strokeWidth={1.8} /><Text style={{ color: palette.danger, fontSize: 15, fontWeight: '700' }}>清除全部文稿</Text></Pressable>
      <Text selectable style={{ color: palette.inkFaint, fontSize: 12, lineHeight: 19, textAlign: 'center' }}>恢复副本仅存在本应用的私有沙箱内，不联网、不共享。清除后，密文和本机密钥都会被删除，无法恢复。</Text>
    </ScrollView>
  );
}
