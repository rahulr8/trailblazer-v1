import { Platform, ViewStyle } from 'react-native';

type ShadowStyle = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

function createShadow(opacity: number, radius: number, elevation: number): ShadowStyle {
  return Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: radius / 2 },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: {
      elevation,
    },
    default: {},
  }) as ShadowStyle;
}

export const Shadows = {
  light: {
    none: {} as ShadowStyle,
    sm: createShadow(0.08, 4, 2),
    md: createShadow(0.12, 8, 4),
    lg: createShadow(0.16, 16, 8),
    xl: createShadow(0.2, 24, 12),
  },
  dark: {
    none: {} as ShadowStyle,
    sm: createShadow(0.5, 4, 2),
    md: createShadow(0.6, 8, 4),
    lg: createShadow(0.7, 16, 8),
    xl: createShadow(0.8, 24, 12),
  },
} as const;

export type ShadowKey = keyof typeof Shadows.light;
export type ShadowTokens = {
  [K in ShadowKey]: ShadowStyle;
};
