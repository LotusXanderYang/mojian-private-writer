export const themeIds = ['wood', 'bamboo', 'mist', 'plum', 'night'] as const;
export type ThemeId = typeof themeIds[number];

export type AppPalette = {
  background: string; paper: string; paperMuted: string; ink: string; inkSoft: string; inkFaint: string;
  border: string; borderStrong: string; accent: string; accentPressed: string; accentTint: string;
  success: string; warning: string; danger: string; white: string;
};

export const themes: Record<ThemeId, { name: string; description: string; dark: boolean; palette: AppPalette }> = {
  wood: { name: '原木', description: '温暖、安静的纸张色', dark: false, palette: { background: '#F4EFE5', paper: '#FFFCF5', paperMuted: '#F9F3E8', ink: '#211F1B', inkSoft: '#5F5A50', inkFaint: '#817A6E', border: '#DDD3C3', borderStrong: '#C8BBA6', accent: '#8B2D2B', accentPressed: '#702321', accentTint: '#F4E5E1', success: '#42634B', warning: '#8B6424', danger: '#A33632', white: '#FFFFFF' } },
  bamboo: { name: '竹青', description: '清淡的竹叶与米纸', dark: false, palette: { background: '#EDF1E8', paper: '#FCFDF8', paperMuted: '#F2F6EC', ink: '#1D251F', inkSoft: '#526057', inkFaint: '#748078', border: '#CFD9CB', borderStrong: '#AFBEAA', accent: '#35634A', accentPressed: '#284D39', accentTint: '#DCEADF', success: '#35634A', warning: '#8A642A', danger: '#9C3D38', white: '#FFFFFF' } },
  mist: { name: '雾蓝', description: '冷静的灰蓝与亮纸', dark: false, palette: { background: '#EEF2F3', paper: '#FBFCFC', paperMuted: '#F2F6F7', ink: '#202629', inkSoft: '#536066', inkFaint: '#77838A', border: '#D3DDE0', borderStrong: '#B7C5CA', accent: '#456C78', accentPressed: '#355660', accentTint: '#DDE9EC', success: '#3F6955', warning: '#89642A', danger: '#A13D38', white: '#FFFFFF' } },
  plum: { name: '梅子', description: '清浅梅红与暖灰', dark: false, palette: { background: '#F4EEEE', paper: '#FFF9F8', paperMuted: '#F8F0EF', ink: '#281F21', inkSoft: '#67565A', inkFaint: '#89767A', border: '#E0CFD1', borderStrong: '#C9B1B5', accent: '#874252', accentPressed: '#6B3340', accentTint: '#F1DDE1', success: '#496650', warning: '#8A642A', danger: '#A0373F', white: '#FFFFFF' } },
  night: { name: '夜色', description: '暖炭黑背景，适合晚间', dark: true, palette: { background: '#1C1A18', paper: '#272421', paperMuted: '#302C28', ink: '#F2EDE4', inkSoft: '#C2B9AC', inkFaint: '#938A7E', border: '#403B35', borderStrong: '#595149', accent: '#D0A46E', accentPressed: '#B88B56', accentTint: '#43382C', success: '#8EB797', warning: '#D0AA6E', danger: '#E1847D', white: '#171513' } },
};

export const palette = themes.wood.palette;
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const radii = { sm: 8, md: 12, lg: 18, pill: 999 } as const;
