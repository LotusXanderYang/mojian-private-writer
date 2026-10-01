import { Code2, Database, HardDrive, ShieldCheck, WifiOff } from 'lucide-react-native';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { radii, spacing } from '@/constants/theme';
import { useAppTheme } from '@/providers/theme-provider';

const githubUrl = 'https://github.com/LotusXanderYang/mojian-private-writer';

export default function AboutScreen() {
  const { palette } = useAppTheme();
  const protections = [
    { icon: WifiOff, title: '离线使用', body: '不需要账号，不上传文稿；Android 正式版移除联网权限。' },
    { icon: Database, title: '可靠本地保存', body: '主副本与写入中临时副本均位于系统隔离的应用私有空间，启动时自动选择最新可用副本。' },
    { icon: HardDrive, title: '无密钥、无应用锁', body: '文稿不依赖指纹、面容、密码或文稿密钥，避免因密钥丢失导致无法打开。' },
    { icon: ShieldCheck, title: '截屏防护', body: '应用内容默认禁止截屏或录屏，导出长图时仅临时放行。' },
  ];
  return <ScrollView style={{ backgroundColor: palette.background }} contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg }}>
    <View style={{ alignItems: 'center', paddingVertical: spacing.md }}><View style={{ width: 68, height: 68, alignItems: 'center', justifyContent: 'center', borderRadius: 23, backgroundColor: palette.accent }}><HardDrive size={29} color={palette.white} /></View><Text style={{ marginTop: spacing.md, color: palette.ink, fontSize: 25, fontWeight: '700' }}>墨笺 1.3.0</Text><Text style={{ marginTop: 6, color: palette.inkSoft, fontSize: 14 }}>私密、离线的本地写作工具</Text></View>
    <View style={{ gap: spacing.sm }}>{protections.map((item) => { const Icon = item.icon; return <View key={item.title} style={{ flexDirection: 'row', gap: spacing.md, padding: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.paper }}><View style={{ width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md, backgroundColor: palette.accentTint }}><Icon size={20} color={palette.accent} /></View><View style={{ flex: 1 }}><Text style={{ color: palette.ink, fontSize: 16, fontWeight: '700' }}>{item.title}</Text><Text style={{ marginTop: 4, color: palette.inkSoft, fontSize: 14, lineHeight: 21 }}>{item.body}</Text></View></View>; })}</View>
    <View style={{ padding: spacing.md, borderRadius: radii.md, backgroundColor: palette.paper, borderWidth: 1, borderColor: palette.border }}><Text style={{ color: palette.ink, fontSize: 18, fontWeight: '700' }}>1.3.0 更新</Text><Text style={{ marginTop: spacing.sm, color: palette.inkSoft, fontSize: 14, lineHeight: 23 }}>新增设置与五套主题、夜色模式、可定制工具栏、H2–H5 标题、删除线、图片插入、日记模式与批量导出。</Text></View>
    <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(githubUrl)} style={({ pressed }) => ({ minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, borderRadius: radii.md, backgroundColor: palette.paper, borderWidth: 1, borderColor: palette.border, opacity: pressed ? 0.72 : 1 })}><Code2 size={21} color={palette.accent} /><View style={{ flex: 1 }}><Text style={{ color: palette.ink, fontSize: 16, fontWeight: '700' }}>GitHub 开源仓库</Text><Text numberOfLines={1} style={{ color: palette.inkFaint, fontSize: 12, marginTop: 3 }}>{githubUrl}</Text></View></Pressable>
    <Text style={{ color: palette.inkFaint, fontSize: 12, lineHeight: 19, textAlign: 'center' }}>卸载应用或清除应用数据会同时删除本地文稿。请定期使用导出功能保留独立副本。</Text>
  </ScrollView>;
}
