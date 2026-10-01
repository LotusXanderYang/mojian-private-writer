import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LockScreen } from '@/components/lock-screen';
import { palette } from '@/constants/theme';
import { NotesProvider, useNotes } from '@/providers/notes-provider';
import { PrivacyProvider, usePrivacy } from '@/providers/privacy-provider';

function AppShell() {
  const { locked } = usePrivacy();
  const { ready, error, clearAll } = useNotes();

  if (locked) return <LockScreen />;
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: palette.background }}>
        <ActivityIndicator color={palette.accent} />
        <Text style={{ color: palette.inkSoft }}>正在打开加密文稿…</Text>
      </View>
    );
  }
  if (error) {
    const resetVault = () => Alert.alert('重置本地文稿库？', '仅当旧文稿已经无法恢复时继续。重置会永久删除现有密文并创建新的本机密钥。', [
      { text: '取消', style: 'cancel' },
      { text: '重置', style: 'destructive', onPress: () => void clearAll() },
    ]);
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18, padding: 28, backgroundColor: palette.background }}>
        <Text selectable style={{ color: palette.danger, fontSize: 16, lineHeight: 25, textAlign: 'center' }}>{error}</Text>
        <Pressable accessibilityRole="button" onPress={resetVault} style={({ pressed }) => ({ minHeight: 48, justifyContent: 'center', paddingHorizontal: 20, borderRadius: 14, backgroundColor: pressed ? palette.accentPressed : palette.accent })}>
          <Text style={{ color: palette.white, fontSize: 15, fontWeight: '700' }}>重置并继续使用</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerShadowVisible: false,
        headerTintColor: palette.ink,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: palette.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" options={{ title: '墨笺' }} />
      <Stack.Screen name="editor/[id]" options={{ title: '编辑文稿', headerBackTitle: '文稿' }} />
      <Stack.Screen name="export/[id]" options={{ title: '导出文稿', presentation: 'formSheet', sheetGrabberVisible: true, sheetAllowedDetents: [0.75, 1] }} />
      <Stack.Screen name="privacy" options={{ title: '隐私与安全', headerBackTitle: '文稿' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PrivacyProvider>
          <NotesProvider>
            <StatusBar style="dark" />
            <AppShell />
          </NotesProvider>
        </PrivacyProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
