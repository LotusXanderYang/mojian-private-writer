import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NotesProvider, useNotes } from '@/providers/notes-provider';
import { ScreenCaptureProvider } from '@/providers/screen-capture-provider';
import { ThemeProvider, useAppTheme } from '@/providers/theme-provider';

function AppShell() {
  const { ready, error, clearAll } = useNotes();
  const { palette } = useAppTheme();

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: palette.background }}>
        <ActivityIndicator color={palette.accent} />
        <Text style={{ color: palette.inkSoft }}>正在读取本地文稿…</Text>
      </View>
    );
  }
  if (error) {
    const resetVault = () => Alert.alert('开始使用新的本地文稿库？', '旧版数据将被永久清除。新版不再使用文稿密钥，并采用主副本与恢复副本保存。', [
      { text: '取消', style: 'cancel' },
      { text: '重置', style: 'destructive', onPress: () => void clearAll() },
    ]);
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18, padding: 28, backgroundColor: palette.background }}>
        <Text selectable style={{ color: palette.danger, fontSize: 16, lineHeight: 25, textAlign: 'center' }}>{error}</Text>
        <Pressable accessibilityRole="button" onPress={resetVault} style={({ pressed }) => ({ minHeight: 48, justifyContent: 'center', paddingHorizontal: 20, borderRadius: 14, backgroundColor: pressed ? palette.accentPressed : palette.accent })}>
          <Text style={{ color: palette.white, fontSize: 15, fontWeight: '700' }}>清除旧数据并继续</Text>
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
      <Stack.Screen name="settings" options={{ title: '设置', headerBackTitle: '文稿' }} />
      <Stack.Screen name="about" options={{ title: '关于墨笺', headerBackTitle: '设置' }} />
      <Stack.Screen name="batch-export" options={{ title: '批量导出', headerBackTitle: '文稿' }} />
    </Stack>
  );
}

function ThemedStatusBar() {
  const { isDark } = useAppTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ScreenCaptureProvider>
          <NotesProvider>
            <ThemeProvider>
              <ThemedStatusBar />
              <AppShell />
            </ThemeProvider>
          </NotesProvider>
        </ScreenCaptureProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
