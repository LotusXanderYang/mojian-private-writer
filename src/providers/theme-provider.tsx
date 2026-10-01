import { createContext, type PropsWithChildren, use } from 'react';
import { themes } from '@/constants/theme';
import { useNotes } from '@/providers/notes-provider';

type ThemeContextValue = { palette: (typeof themes)['wood']['palette']; themeId: keyof typeof themes; isDark: boolean };
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const { vault } = useNotes();
  const themeId = vault.settings.themeId in themes ? vault.settings.themeId : 'wood';
  const theme = themes[themeId];
  return <ThemeContext value={{ palette: theme.palette, themeId, isDark: theme.dark }}>{children}</ThemeContext>;
}

export function useAppTheme() {
  const context = use(ThemeContext);
  if (!context) throw new Error('useAppTheme 必须在 ThemeProvider 内使用');
  return context;
}
