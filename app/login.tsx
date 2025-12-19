import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from 'heroui-native';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

import { useTheme } from '@/contexts/theme-context';
import { Spacing, BorderRadius } from '@/constants';

type AuthMode = 'login' | 'signup';

export default function LoginScreen() {
  const { colors, gradients, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = () => {
    // Auth logic will be implemented with Firebase
    router.replace('/(tabs)');
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={gradients.primary.colors as unknown as [string, string, ...string[]]}
          start={gradients.primary.start}
          end={gradients.primary.end}
          style={styles.headerGradient}
        >
          <View style={[styles.headerContent, { paddingTop: insets.top + Spacing.md }]}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#FFFFFF" />
            </Pressable>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>Trailblazer+</Text>
              <Text style={styles.tagline}>Your outdoor adventure companion</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={[styles.formContainer, shadows.lg]}>
          <View style={[styles.formCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.formTitle, { color: colors.textPrimary }]}>
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </Text>
            <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
              {mode === 'login'
                ? 'Sign in to continue your adventure'
                : 'Join the BC Parks community'}
            </Text>

            <View style={styles.inputGroup}>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: colors.glassBg, borderColor: colors.cardBorder },
                ]}
              >
                <Mail size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Email address"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[styles.textInput, { color: colors.textPrimary }]}
                />
              </View>

              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: colors.glassBg, borderColor: colors.cardBorder },
                ]}
              >
                <Lock size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Password"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={[styles.textInput, { color: colors.textPrimary }]}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={colors.textSecondary} />
                  )}
                </Pressable>
              </View>
            </View>

            {mode === 'login' && (
              <Pressable style={styles.forgotPassword}>
                <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                  Forgot password?
                </Text>
              </Pressable>
            )}

            <Button onPress={handleAuth} style={styles.submitButton}>
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
            </View>

            <Pressable
              style={[styles.socialButton, { borderColor: colors.cardBorder }]}
              onPress={() => {}}
            >
              <Text style={[styles.socialButtonText, { color: colors.textPrimary }]}>
                Continue with Google
              </Text>
            </Pressable>

            <Pressable
              style={[styles.socialButton, { borderColor: colors.cardBorder }]}
              onPress={() => {}}
            >
              <Text style={[styles.socialButtonText, { color: colors.textPrimary }]}>
                Continue with Apple
              </Text>
            </Pressable>
          </View>

          <View style={styles.toggleContainer}>
            <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            </Text>
            <Pressable onPress={toggleMode}>
              <Text style={[styles.toggleLink, { color: colors.primary }]}>
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    height: 280,
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: Spacing.xs,
  },
  formContainer: {
    flex: 1,
    marginTop: -40,
    paddingHorizontal: Spacing.xl,
  },
  formCard: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing['2xl'],
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    gap: Spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    height: 52,
  },
  inputIcon: {
    marginRight: Spacing.md,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  eyeButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: Spacing.sm,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: Spacing.xl,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: Spacing.md,
    fontSize: 14,
  },
  socialButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xl,
  },
  toggleText: {
    fontSize: 15,
  },
  toggleLink: {
    fontSize: 15,
    fontWeight: '600',
  },
});
