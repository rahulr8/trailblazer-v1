export const Colors = {
  light: {
    // Backgrounds
    background: '#F2F2F7',
    backgroundSecondary: '#FFFFFF',

    // Glass morphism
    glassBg: 'rgba(255, 255, 255, 0.8)',
    glassBorder: 'rgba(0, 0, 0, 0.06)',

    // Text
    textPrimary: '#1C1C1E',
    textSecondary: '#8E8E93',
    textTertiary: '#C7C7CC',

    // Brand colors
    primary: '#007AFF',
    accent: '#34C759',
    accentText: '#248A3D',
    highlight: '#FF9500',
    purple: '#BF5AF2',
    danger: '#FF3B30',

    // Tab bar
    tabBarBackground: '#FFFFFF',
    tabBarBorder: 'rgba(0, 0, 0, 0.08)',
    tabIconActive: '#007AFF',
    tabIconInactive: '#8E8E93',
    tabIconActiveBg: 'rgba(0, 122, 255, 0.12)',

    // Cards & surfaces
    cardBackground: '#FFFFFF',
    cardBorder: 'rgba(0, 0, 0, 0.06)',

    // Progress
    progressTrack: 'rgba(0, 0, 0, 0.1)',

    // Premium/Gold
    gold: '#FFD700',
    goldLight: '#FDB931',
    goldDark: '#996515',

    // Overlays
    overlayBackground: 'rgba(0, 0, 0, 0.5)',
  },
  dark: {
    // Backgrounds
    background: '#050505',
    backgroundSecondary: '#1C1C1E',

    // Glass morphism
    glassBg: 'rgba(255, 255, 255, 0.08)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textTertiary: '#6B6B70',

    // Brand colors
    primary: '#00F2FF',
    accent: '#2AFF5D',
    accentText: '#2AFF5D',
    highlight: '#FFAA00',
    purple: '#BF5AF2',
    danger: '#FF453A',

    // Tab bar
    tabBarBackground: '#1A1A1F',
    tabBarBorder: 'rgba(255, 255, 255, 0.08)',
    tabIconActive: '#00F2FF',
    tabIconInactive: '#6B6B70',
    tabIconActiveBg: 'rgba(0, 242, 255, 0.15)',

    // Cards & surfaces
    cardBackground: 'rgba(255, 255, 255, 0.08)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',

    // Progress
    progressTrack: 'rgba(255, 255, 255, 0.1)',

    // Premium/Gold
    gold: '#FFD700',
    goldLight: '#FDB931',
    goldDark: '#996515',

    // Overlays
    overlayBackground: 'rgba(0, 0, 0, 0.75)',
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ColorTokens = {
  [K in keyof typeof Colors.light]: string;
};
export type ColorKey = keyof ColorTokens;
