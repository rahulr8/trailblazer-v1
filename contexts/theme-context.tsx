import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Colors,
  Shadows,
  Gradients,
  type ColorScheme,
  type ColorTokens,
  type ShadowTokens,
  type GradientTokens,
} from '@/constants';

interface ThemeContextValue {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
  isDark: boolean;
  colors: ColorTokens;
  shadows: ShadowTokens;
  gradients: GradientTokens;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = '@trailblazer_theme';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemScheme = useSystemColorScheme();
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') {
          setColorSchemeState(saved);
        } else if (systemScheme) {
          setColorSchemeState(systemScheme);
        }
      } catch {
        // Use default on error
      } finally {
        setIsLoaded(true);
      }
    }
    loadTheme();
  }, [systemScheme]);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    AsyncStorage.setItem(STORAGE_KEY, scheme).catch(() => {
      // Ignore storage errors
    });
  }, []);

  const toggleColorScheme = useCallback(() => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  }, [colorScheme, setColorScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colorScheme,
      setColorScheme,
      toggleColorScheme,
      isDark: colorScheme === 'dark',
      colors: Colors[colorScheme],
      shadows: Shadows[colorScheme],
      gradients: Gradients[colorScheme],
    }),
    [colorScheme, setColorScheme, toggleColorScheme]
  );

  if (!isLoaded) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
