import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Send, Bot, User } from 'lucide-react-native';

import { useTheme } from '@/contexts/theme-context';
import { Spacing, BorderRadius } from '@/constants';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content:
      "Hi! I'm Parker, your BC Parks trail guide. Ask me about trails, wildlife, weather conditions, or anything else about your outdoor adventures!",
  },
];

export default function ChatScreen() {
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          "That's a great question! I'm still being connected to my knowledge base, but soon I'll be able to help you with trail recommendations, weather updates, and more.",
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  }, [inputText]);

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => {
      const isUser = item.role === 'user';
      return (
        <View
          style={[
            styles.messageRow,
            isUser ? styles.messageRowUser : styles.messageRowAssistant,
          ]}
        >
          {!isUser && (
            <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
              <Bot size={18} color={colors.primary} />
            </View>
          )}
          <View
            style={[
              styles.messageBubble,
              isUser
                ? { backgroundColor: colors.primary }
                : { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
              !isUser && styles.messageBubbleAssistant,
              shadows.sm,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                { color: isUser ? '#FFFFFF' : colors.textPrimary },
              ]}
            >
              {item.content}
            </Text>
          </View>
          {isUser && (
            <View style={[styles.avatar, { backgroundColor: colors.accent + '20' }]}>
              <User size={18} color={colors.accent} />
            </View>
          )}
        </View>
      );
    },
    [colors, shadows]
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Parker AI',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={colors.textPrimary} />
            </Pressable>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.messageList,
            { paddingBottom: Spacing.lg },
          ]}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          showsVerticalScrollIndicator={false}
        />

        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
            { paddingBottom: Math.max(insets.bottom, Spacing.md) },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.glassBg, color: colors.textPrimary },
            ]}
            placeholder="Ask Parker anything..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline
            maxLength={500}
          />
          <Pressable
            style={[
              styles.sendButton,
              { backgroundColor: inputText.trim() ? colors.primary : colors.glassBg },
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Send
              size={20}
              color={inputText.trim() ? '#FFFFFF' : colors.textSecondary}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    padding: Spacing.sm,
    marginLeft: -Spacing.sm,
  },
  messageList: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAssistant: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  messageBubbleAssistant: {
    borderWidth: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
