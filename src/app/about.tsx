import { ChevronRight, Code2, Database, HardDrive, ShieldCheck, WifiOff } from 'lucide-react-native';
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
  return <ScrollView style={{ backgroundColor: palette.background }} contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.xl }}>
    <View style={{ paddingTop: spacing.md, paddingBottom: spacing.sm }}><Text style={{ color: palette.ink, fontSize: 30, fontWeight: '700', letterSpacing: -0.8 }}>墨笺</Text><Text style={{ marginTop: 5, color: palette.inkFaint, fontSize: 13 }}>版本 1.3.2 · 本地写作与日记</Text><View style={{ width: 32, height: 2, marginTop: spacing.md, backgroundColor: palette.accent }} /></View>
    <View style={{ gap: spacing.sm }}><Text style={{ color: palette.ink, fontSize: 18, fontWeight: '700' }}>本地与隐私</Text><View style={{ paddingHorizontal: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.paper }}>{protections.map((item, index) => { const Icon = item.icon; return <View key={item.title} style={{ minHeight: 86, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingVertical: spacing.md, borderTopWidth: index ? 1 : 0, borderTopColor: palette.border }}><Icon size={20} color={palette.accent} strokeWidth={1.8} style={{ marginTop: 2 }} /><View style={{ flex: 1 }}><Text style={{ color: palette.ink, fontSize: 15, fontWeight: '700' }}>{item.title}</Text><Text style={{ marginTop: 4, color: palette.inkSoft, fontSize: 14, lineHeight: 21 }}>{item.body}</Text></View></View>; })}</View></View>
    <View style={{ gap: spacing.sm }}><Text style={{ color: palette.ink, fontSize: 18, fontWeight: '700' }}>1.3.2 更新</Text><View style={{ paddingLeft: spacing.md, borderLeftWidth: 2, borderLeftColor: palette.accent }}><Text style={{ color: palette.inkSoft, fontSize: 14, lineHeight: 23 }}>界面改为更克制的纸张式层级：减少装饰性图标底座与重复卡片，重新整理日历、设置、导出和关于页，让文稿成为视觉重点。</Text></View></View>
    <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(githubUrl)} style={({ pressed }) => ({ minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, borderRadius: radii.md, backgroundColor: pressed ? palette.paperMuted : palette.paper, borderWidth: 1, borderColor: palette.border })}><Code2 size={20} color={palette.accent} strokeWidth={1.8} /><View style={{ flex: 1 }}><Text style={{ color: palette.ink, fontSize: 15, fontWeight: '700' }}>查看开源代码</Text><Text numberOfLines={1} style={{ color: palette.inkFaint, fontSize: 12, marginTop: 3 }}>github.com/LotusXanderYang/mojian-private-writer</Text></View><ChevronRight size={18} color={palette.inkFaint} /></Pressable>
    <Text style={{ color: palette.inkFaint, fontSize: 12, lineHeight: 19 }}>卸载应用或清除应用数据会同时删除本地文稿。请定期导出独立副本。</Text>
  </ScrollView>;
}
