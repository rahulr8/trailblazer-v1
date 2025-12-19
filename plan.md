# Trailblazer+ React Native: Phase 3 & 4 Implementation Plan

## Overview

Implementing navigation architecture and centralized theme system following React Native best practices.

---

## Phase 3: Navigation Architecture

### Route Structure

```
app/
├── _layout.tsx              # Root (providers + modal config)
├── (tabs)/
│   ├── _layout.tsx          # Tab navigator with themed tab bar
│   ├── index.tsx            # Home
│   ├── explore.tsx          # Adventures
│   ├── rewards.tsx          # Rewards
│   └── profile.tsx          # Profile
├── (modals)/
│   ├── _layout.tsx          # Modal stack (transparentModal)
│   ├── log-activity.tsx     # Bottom sheet
│   ├── activity-detail.tsx  # Bottom sheet
│   ├── reward-detail.tsx    # Bottom sheet
│   ├── notifications.tsx    # Form sheet
│   ├── upgrade.tsx          # Center card
│   ├── badge-detail.tsx     # Bottom sheet
│   ├── reset-challenge.tsx  # Center card
│   └── giveaway.tsx         # Bottom sheet
├── chat.tsx                 # Full-screen (Parker AI)
└── login.tsx                # Full-screen (Auth)
```

### Modal Presentation Strategy

| Modal | Presentation | Reason |
|-------|--------------|--------|
| log-activity | `@gorhom/bottom-sheet` | Quick action, 85% height |
| activity-detail | `@gorhom/bottom-sheet` | Detail view |
| reward-detail | `@gorhom/bottom-sheet` | Detail view |
| notifications | `formSheet` | List view |
| upgrade | `transparentModal` + center card | Important decision |
| badge-detail | `@gorhom/bottom-sheet` | Detail view |
| reset-challenge | `transparentModal` + center card | Confirmation |
| giveaway | `@gorhom/bottom-sheet` | Quick action |
| chat | `fullScreenModal` | Immersive |
| login | `fullScreenModal` | Auth flow |

### Root Layout (`app/_layout.tsx`)

```tsx
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { HeroUINativeProvider } from 'heroui-native';
import { ThemeProvider } from '@/contexts/theme-context';
import { StatusBar } from 'expo-status-bar';
import '../global.css';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <ThemeProvider>
          <BottomSheetModalProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="(modals)"
                options={{
                  presentation: 'transparentModal',
                  animation: 'fade',
                }}
              />
              <Stack.Screen
                name="chat"
                options={{
                  presentation: 'fullScreenModal',
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen
                name="login"
                options={{ presentation: 'fullScreenModal' }}
              />
            </Stack>
            <StatusBar style="auto" />
          </BottomSheetModalProvider>
        </ThemeProvider>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
```

### Tab Layout (`app/(tabs)/_layout.tsx`)

```tsx
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/contexts/theme-context';
import { Home, Compass, Gift, User } from 'lucide-react-native';

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView intensity={isDark ? 80 : 60} style={{ flex: 1 }} />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => <Compass size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: 'Rewards',
          tabBarIcon: ({ color, size }) => <Gift size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
```

---

## Phase 4: Theme System

### File Structure

```
constants/
├── colors.ts       # Color tokens (light/dark)
├── spacing.ts      # Spacing scale
├── typography.ts   # Font definitions
├── shadows.ts      # Platform-specific shadows
├── gradients.ts    # LinearGradient configs
└── index.ts        # Re-exports

contexts/
└── theme-context.tsx   # ThemeProvider + useTheme hook
```

### Color Tokens (`constants/colors.ts`)

```typescript
export const Colors = {
  light: {
    background: '#F2F2F7',
    backgroundSecondary: '#FFFFFF',
    glassBg: 'rgba(255, 255, 255, 0.8)',
    glassBorder: 'rgba(0, 0, 0, 0.06)',
    textPrimary: '#1C1C1E',
    textSecondary: '#8E8E93',
    primary: '#007AFF',
    accent: '#34C759',
    highlight: '#FF9500',
    purple: '#BF5AF2',
    tabBarBackground: '#FFFFFF',
    tabBarBorder: 'rgba(0, 0, 0, 0.08)',
    tabIconActive: '#007AFF',
    tabIconInactive: '#8E8E93',
    cardBackground: '#FFFFFF',
    cardBorder: 'rgba(0, 0, 0, 0.06)',
    progressTrack: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    background: '#050505',
    backgroundSecondary: '#1C1C1E',
    glassBg: 'rgba(255, 255, 255, 0.08)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1AA',
    primary: '#00F2FF',
    accent: '#2AFF5D',
    highlight: '#FFAA00',
    purple: '#BF5AF2',
    tabBarBackground: '#1A1A1F',
    tabBarBorder: 'rgba(255, 255, 255, 0.08)',
    tabIconActive: '#00F2FF',
    tabIconInactive: '#6B6B70',
    cardBackground: 'rgba(255, 255, 255, 0.08)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    progressTrack: 'rgba(255, 255, 255, 0.1)',
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ColorTokens = typeof Colors.light;
```

### Spacing (`constants/spacing.ts`)

```typescript
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  full: 9999,
} as const;
```

### Shadows (`constants/shadows.ts`)

```typescript
import { Platform, ViewStyle } from 'react-native';

type ShadowStyle = Pick<ViewStyle, 'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'>;

const createShadow = (opacity: number, radius: number, elevation: number): ShadowStyle =>
  Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: radius / 2 },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: { elevation },
    default: {},
  }) as ShadowStyle;

export const Shadows = {
  light: {
    sm: createShadow(0.08, 4, 2),
    md: createShadow(0.12, 8, 4),
    lg: createShadow(0.16, 16, 8),
  },
  dark: {
    sm: createShadow(0.5, 4, 2),
    md: createShadow(0.6, 8, 4),
    lg: createShadow(0.7, 16, 8),
  },
} as const;
```

### Gradients (`constants/gradients.ts`)

```typescript
export const Gradients = {
  light: {
    primary: { colors: ['#007AFF', '#0055FF'] as const },
    accent: { colors: ['#34C759', '#248A3D'] as const },
    gold: { colors: ['#FFD700', '#FDB931', '#E6AC00'] as const },
  },
  dark: {
    primary: { colors: ['#00F2FF', '#0066FF'] as const },
    accent: { colors: ['#2AFF5D', '#00CC44'] as const },
    ai: { colors: ['#FF0080', '#7928CA'] as const },
    gold: { colors: ['#FFD700', '#FDB931', '#E6AC00'] as const },
  },
} as const;
```

### Theme Context (`contexts/theme-context.tsx`)

```typescript
import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, ColorScheme, ColorTokens } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { Gradients } from '@/constants/gradients';

interface ThemeContextValue {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
  isDark: boolean;
  colors: ColorTokens;
  shadows: typeof Shadows.light;
  gradients: typeof Gradients.light | typeof Gradients.dark;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = '@trailblazer_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark') {
        setColorSchemeState(saved);
      } else if (systemScheme) {
        setColorSchemeState(systemScheme);
      }
      setIsLoaded(true);
    });
  }, [systemScheme]);

  const setColorScheme = (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    AsyncStorage.setItem(STORAGE_KEY, scheme);
  };

  const toggleColorScheme = () => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };

  const value = useMemo(() => ({
    colorScheme,
    setColorScheme,
    toggleColorScheme,
    isDark: colorScheme === 'dark',
    colors: Colors[colorScheme],
    shadows: Shadows[colorScheme],
    gradients: Gradients[colorScheme],
  }), [colorScheme]);

  if (!isLoaded) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

---

## Implementation Steps

### Step 1: Install Additional Dependencies
```bash
npm install @react-native-async-storage/async-storage expo-blur lucide-react-native
```

### Step 2: Create Theme Constants
- `constants/colors.ts`
- `constants/spacing.ts`
- `constants/shadows.ts`
- `constants/gradients.ts`
- `constants/index.ts`

### Step 3: Create Theme Context
- `contexts/theme-context.tsx`

### Step 4: Update Root Layout
- Add `ThemeProvider` and `BottomSheetModalProvider`
- Configure modal stack screens

### Step 5: Create Tab Navigation
- `app/(tabs)/_layout.tsx` with themed tab bar
- Placeholder screens for each tab

### Step 6: Create Modal Routes
- `app/(modals)/_layout.tsx`
- Placeholder screens for each modal

### Step 7: Create Full-Screen Routes
- `app/chat.tsx` placeholder
- `app/login.tsx` placeholder

---

## Files to Create/Modify

**Create:**
- `constants/colors.ts`
- `constants/spacing.ts`
- `constants/shadows.ts`
- `constants/gradients.ts`
- `constants/index.ts`
- `contexts/theme-context.tsx`
- `app/(tabs)/_layout.tsx`
- `app/(tabs)/index.tsx`
- `app/(tabs)/explore.tsx`
- `app/(tabs)/rewards.tsx`
- `app/(tabs)/profile.tsx`
- `app/(modals)/_layout.tsx`
- `app/(modals)/log-activity.tsx`
- `app/(modals)/upgrade.tsx`
- `app/chat.tsx`
- `app/login.tsx`

**Modify:**
- `app/_layout.tsx` (add providers)
- `package.json` (new deps)
