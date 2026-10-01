import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import * as ScreenCapture from 'expo-screen-capture';
import { createContext, type PropsWithChildren, use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

const CAPTURE_KEY = 'mojian-private';

type PrivacyContextValue = {
  locked: boolean;
  authAvailable: boolean;
  authenticating: boolean;
  authError: string | null;
  unlock: () => Promise<void>;
  lockNow: () => void;
};

const PrivacyContext = createContext<PrivacyContextValue | null>(null);

export function PrivacyProvider({ children }: PropsWithChildren) {
  const [locked, setLocked] = useState(Platform.OS !== 'web');
  const [authAvailable, setAuthAvailable] = useState(Platform.OS === 'web');
  const [authenticating, setAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const leftForeground = useRef(false);

  const unlock = useCallback(async () => {
    if (Platform.OS === 'web') {
      setLocked(false);
      return;
    }
    setAuthenticating(true);
    setAuthError(null);
    try {
      const level = await LocalAuthentication.getEnrolledLevelAsync();
      const available = level !== LocalAuthentication.SecurityLevel.NONE;
      setAuthAvailable(available);
      if (!available) {
        setAuthError('设备尚未设置锁屏密码或生物识别。请先在系统设置中启用。');
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: '解锁墨笺',
        promptSubtitle: '验证身份后才能查看本地文稿',
        promptDescription: '所有文稿均保存在这台设备上',
        cancelLabel: '暂不解锁',
        fallbackLabel: '使用设备密码',
        disableDeviceFallback: false,
        biometricsSecurityLevel: 'strong',
      });
      if (result.success) {
        setLocked(false);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (result.error !== 'user_cancel' && result.error !== 'system_cancel') {
        setAuthError('身份验证未通过，请重试或使用设备密码。');
      }
    } finally {
      setAuthenticating(false);
    }
  }, []);

  const lockNow = useCallback(() => setLocked(true), []);

  useEffect(() => {
    let unlockTimer: ReturnType<typeof setTimeout> | undefined;
    if (Platform.OS !== 'web') {
      ScreenCapture.preventScreenCaptureAsync(CAPTURE_KEY).catch(() => undefined);
      if (Platform.OS === 'ios') ScreenCapture.enableAppSwitcherProtectionAsync(0.9).catch(() => undefined);
      unlockTimer = setTimeout(() => unlock(), 0);
    }
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'inactive' || nextState === 'background') {
        leftForeground.current = true;
        setLocked(true);
      } else if (nextState === 'active' && leftForeground.current) {
        leftForeground.current = false;
      }
    });
    return () => {
      if (unlockTimer) clearTimeout(unlockTimer);
      subscription.remove();
    };
  }, [unlock]);

  const value = useMemo(
    () => ({ locked, authAvailable, authenticating, authError, unlock, lockNow }),
    [locked, authAvailable, authenticating, authError, unlock, lockNow],
  );
  return <PrivacyContext value={value}>{children}</PrivacyContext>;
}

export function usePrivacy() {
  const context = use(PrivacyContext);
  if (!context) throw new Error('usePrivacy 必须在 PrivacyProvider 内使用');
  return context;
}

export const screenCaptureProtectionKey = CAPTURE_KEY;

