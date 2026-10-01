import { Fingerprint, LockKeyhole, ShieldCheck } from 'lucide-react-native';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette, radii, spacing } from '@/constants/theme';
import { usePrivacy } from '@/providers/privacy-provider';

export function LockScreen() {
  const insets = useSafeAreaInsets();
  const { authAvailable, authenticating, authError, unlock } = usePrivacy();
  return (
    <View style={{ flex: 1, justifyContent: 'space-between', paddingTop: Math.max(insets.top, spacing.xl) + spacing.xl, paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.lg, paddingHorizontal: spacing.lg, backgroundColor: palette.background }}>
      <View style={{ alignItems: 'center', gap: spacing.md }}>
        <View style={{ alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: 24, borderCurve: 'continuous', backgroundColor: palette.accent }}>
          <LockKeyhole color={palette.white} size={30} strokeWidth={1.8} />
        </View>
        <Text selectable style={{ color: palette.ink, fontSize: 30, fontWeight: '700', letterSpacing: -0.6 }}>墨笺已锁定</Text>
        <Text selectable style={{ color: palette.inkSoft, fontSize: 16, lineHeight: 25, textAlign: 'center', maxWidth: 320 }}>
          文稿只保存在这台设备上。验证身份后才会解密并显示内容。
        </Text>
      </View>
      <View style={{ gap: spacing.md }}>
        {authError ? (
          <View style={{ flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: radii.md, borderCurve: 'continuous', backgroundColor: palette.accentTint }}>
            <ShieldCheck color={palette.danger} size={20} strokeWidth={1.8} />
            <Text selectable style={{ flex: 1, color: palette.ink, fontSize: 14, lineHeight: 21 }}>{authError}</Text>
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="使用设备锁解锁"
          disabled={authenticating || !authAvailable}
          onPress={unlock}
          style={({ pressed }) => ({ minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderRadius: radii.md, borderCurve: 'continuous', backgroundColor: palette.accent, opacity: !authAvailable ? 0.5 : pressed ? 0.82 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })}
        >
          {authenticating ? <ActivityIndicator color={palette.white} /> : <Fingerprint color={palette.white} size={22} strokeWidth={1.8} />}
          <Text style={{ color: palette.white, fontSize: 16, fontWeight: '700' }}>{authenticating ? '正在验证…' : '使用设备锁解锁'}</Text>
        </Pressable>
        <Text selectable style={{ color: palette.inkFaint, fontSize: 13, lineHeight: 19, textAlign: 'center' }}>
          墨笺不会读取或保存你的指纹、面容或设备密码。
        </Text>
      </View>
    </View>
  );
}

