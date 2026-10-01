import * as ScreenCapture from 'expo-screen-capture';
import { type PropsWithChildren, useEffect } from 'react';
import { Platform } from 'react-native';

export const screenCaptureProtectionKey = 'mojian-private';

export function ScreenCaptureProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    if (Platform.OS === 'web') return;
    ScreenCapture.preventScreenCaptureAsync(screenCaptureProtectionKey).catch(() => undefined);
    if (Platform.OS === 'ios') ScreenCapture.enableAppSwitcherProtectionAsync(0.9).catch(() => undefined);
  }, []);

  return children;
}
