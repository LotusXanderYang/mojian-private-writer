import type { LucideIcon } from 'lucide-react-native';
import { Pressable, type PressableProps } from 'react-native';

import { useAppTheme } from '@/providers/theme-provider';

type IconButtonProps = PressableProps & { icon: LucideIcon; label: string; tone?: 'default' | 'accent' | 'danger' };

export function IconButton({ icon: Icon, label, tone = 'default', disabled, ...props }: IconButtonProps) {
  const { palette } = useAppTheme();
  const foreground = tone === 'accent' ? palette.white : tone === 'danger' ? palette.danger : palette.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      hitSlop={4}
      {...props}
      style={({ pressed }) => ({
        alignItems: 'center', justifyContent: 'center', width: 44, height: 44,
        borderRadius: 12, borderCurve: 'continuous',
        backgroundColor: tone === 'accent' ? (pressed ? palette.accentPressed : palette.accent) : pressed ? palette.paperMuted : 'transparent',
        opacity: disabled ? 0.5 : 1,
      })}
    >
      <Icon color={foreground} size={21} strokeWidth={1.8} />
    </Pressable>
  );
}

