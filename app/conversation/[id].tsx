
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/hooks/useAuth';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase, isSupabaseConfigured } from '@/app/integrations/supabase/client';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  pickleballer_nickname?: string;
}

export default function ConversationScreen() {
  const router = useRouter();
  const { id: recipientId } = useLocalSearchParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [recipientProfile, setRecipientProfile] = useState<UserProfile | null>(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const fetchRecipientProfile = useCallback(async () => {
    if (!recipientId || !isSupabaseConfigured()) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, pickleballer_nickname')
        .eq('id', recipientId)
        .single();

      if (error) throw error;
      setRecipientProfile(data);
    } catch (error) {
      console.log('Error fetching recipient profile:', error);
    }
  }, [recipientId]);

  const fetchMessages = useCallback(async () => {
    if (!user || !recipientId || !isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);

      // Mark unread messages as read
      const unreadMessageIds = (data || [])
        .filter((msg: Message) => msg.recipient_id === user.id && !msg.read)
        .map((msg: Message) => msg.id);

      if (unreadMessageIds.length > 0) {
        await supabase
          .from('messages')
          .update({ read: true })
          .in('id', unreadMessageIds);
      }
    } catch (error) {
      console.log('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [user, recipientId]);

  useEffect(() => {
    fetchRecipientProfile();
    fetchMessages();

    // Set up real-time subscription
    if (user && recipientId && isSupabaseConfigured()) {
      const subscription = supabase
        .channel('conversation')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `sender_id=eq.${recipientId}`,
          },
          (payload) => {
            if (payload.new.recipient_id === user.id) {
              setMessages((prev) => [...prev, payload.new as Message]);
              // Mark as read immediately
              supabase
                .from('messages')
                .update({ read: true })
                .eq('id', payload.new.id)
                .then(() => console.log('Message marked as read'));
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, recipientId, fetchRecipientProfile, fetchMessages]);

  const sendMessage = async () => {
    if (!messageText.trim() || !user || !recipientId || !isSupabaseConfigured()) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: user.id,
            recipient_id: recipientId,
            content: messageText.trim(),
          },
        ]);

      if (error) throw error;

      setMessageText('');
      await fetchMessages();
      
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.log('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isFromMe = item.sender_id === user?.id;
    const showDateSeparator = index === 0 || 
      formatDate(item.created_at) !== formatDate(messages[index - 1].created_at);

    return (
      <React.Fragment key={item.id}>
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>{formatDate(item.created_at)}</Text>
          </View>
        )}
        <View style={[styles.messageContainer, isFromMe && styles.myMessageContainer]}>
          <View style={[styles.messageBubble, isFromMe && styles.myMessageBubble]}>
            <Text style={[styles.messageText, isFromMe && styles.myMessageText]}>
              {item.content}
            </Text>
            <Text style={[styles.messageTime, isFromMe && styles.myMessageTime]}>
              {formatTime(item.created_at)}
            </Text>
          </View>
        </View>
      </React.Fragment>
    );
  };

  const recipientName = recipientProfile
    ? recipientProfile.first_name && recipientProfile.last_name
      ? `${recipientProfile.first_name} ${recipientProfile.last_name.charAt(0)}.`
      : recipientProfile.pickleballer_nickname || 'User'
    : 'Loading...';

  if (loading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={commonStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="chevron_left"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerInfo}
          onPress={() => router.push(`/user/${recipientId}`)}
        >
          <View style={styles.headerAvatar}>
            <IconSymbol
              ios_icon_name="person.fill"
              android_material_icon_name="person"
              size={24}
              color={colors.primary}
            />
          </View>
          <Text style={styles.headerName}>{recipientName}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="message"
              android_material_icon_name="message"
              size={48}
              color={colors.textSecondary}
            />
            <Text style={[commonStyles.textSecondary, { marginTop: 16, textAlign: 'center' }]}>
              No messages yet. Start the conversation!
            </Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={colors.textSecondary}
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!messageText.trim() || sending) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!messageText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color={colors.card} />
          ) : (
            <IconSymbol
              ios_icon_name="arrow.up.circle.fill"
              android_material_icon_name="send"
              size={32}
              color={messageText.trim() ? colors.card : colors.textSecondary}
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  messagesList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexGrow: 1,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateSeparatorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    backgroundColor: colors.highlight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageContainer: {
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  myMessageBubble: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  messageText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  myMessageText: {
    color: colors.card,
  },
  messageTime: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  myMessageTime: {
    color: colors.card,
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    maxHeight: 100,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.highlight,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
});
