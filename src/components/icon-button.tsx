import type { LucideIcon } from 'lucide-react-native';
import { Pressable, type PressableProps } from 'react-native';

import { radii } from '@/constants/theme';
import { useAppTheme } from '@/providers/theme-provider';

type IconButtonProps = PressableProps & { icon: LucideIcon; label: string; tone?: 'default' | 'accent' | 'danger' };

export function IconButton({ icon: Icon, label, tone = 'default', disabled, ...props }: IconButtonProps) {
  const { palette } = useAppTheme();
  const foreground = tone === 'accent' ? palette.white : tone === 'danger' ? palette.danger : palette.ink;
  const background = tone === 'accent' ? palette.accent : palette.paperMuted;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      hitSlop={4}
      {...props}
      style={({ pressed }) => ({
        alignItems: 'center', justifyContent: 'center', width: 44, height: 44,
        borderRadius: radii.md, borderCurve: 'continuous', backgroundColor: background,
        opacity: disabled ? 0.5 : pressed ? 0.78 : 1, transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <Icon color={foreground} size={21} strokeWidth={1.8} />
    </Pressable>
  );
}

