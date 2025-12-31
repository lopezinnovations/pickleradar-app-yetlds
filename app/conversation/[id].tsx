
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

interface MessageRequest {
  id: string;
  sender_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'ignored';
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
  const [messageRequest, setMessageRequest] = useState<MessageRequest | null>(null);
  const [isFriend, setIsFriend] = useState(false);
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

  const checkFriendshipStatus = useCallback(async () => {
    if (!user || !recipientId || !isSupabaseConfigured()) return;

    try {
      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${recipientId}),and(user_id.eq.${recipientId},friend_id.eq.${user.id})`)
        .eq('status', 'accepted')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setIsFriend(!!data);
    } catch (error) {
      console.log('Error checking friendship status:', error);
    }
  }, [user, recipientId]);

  const checkMessageRequest = useCallback(async () => {
    if (!user || !recipientId || !isSupabaseConfigured()) return;

    try {
      // Check if there's an existing message request
      const { data, error } = await supabase
        .from('message_requests')
        .select('*')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setMessageRequest(data);
    } catch (error) {
      console.log('Error checking message request:', error);
    }
  }, [user, recipientId]);

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

  const acceptMessageRequest = useCallback(async () => {
    if (!messageRequest || !user || !isSupabaseConfigured()) return;

    try {
      const { error } = await supabase
        .from('message_requests')
        .update({ status: 'accepted' })
        .eq('id', messageRequest.id);

      if (error) throw error;
      await checkMessageRequest();
    } catch (error) {
      console.log('Error accepting message request:', error);
    }
  }, [messageRequest, user, checkMessageRequest]);

  useEffect(() => {
    fetchRecipientProfile();
    fetchMessages();
    checkFriendshipStatus();
    checkMessageRequest();

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
              
              // If this is the first message from recipient, accept the message request
              if (messageRequest && messageRequest.status === 'pending' && messageRequest.recipient_id === user.id) {
                acceptMessageRequest();
              }
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, recipientId, fetchRecipientProfile, fetchMessages, checkFriendshipStatus, checkMessageRequest, messageRequest, acceptMessageRequest]);

  const createMessageRequest = async () => {
    if (!user || !recipientId || !isSupabaseConfigured()) return;

    try {
      const { error } = await supabase
        .from('message_requests')
        .insert([
          {
            sender_id: user.id,
            recipient_id: recipientId,
            status: 'pending',
          },
        ]);

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        throw error;
      }

      // Create notification for recipient
      await supabase
        .from('notifications')
        .insert([
          {
            user_id: recipientId,
            title: 'New Message Request',
            body: `${user.firstName || 'Someone'} sent you a message`,
            type: 'message_request',
            data: {
              sender_id: user.id,
              sender_name: user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName.charAt(0)}.`
                : user.pickleballerNickname || 'Unknown User',
            },
          },
        ]);

      await checkMessageRequest();
    } catch (error) {
      console.log('Error creating message request:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !user || !recipientId || !isSupabaseConfigured()) return;

    setSending(true);
    try {
      // Check if we need to create a message request
      if (!isFriend && !messageRequest) {
        await createMessageRequest();
      }

      // If recipient is replying to a pending request, accept it automatically
      if (messageRequest && messageRequest.status === 'pending' && messageRequest.recipient_id === user.id) {
        await acceptMessageRequest();
      }

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

      {!isFriend && messageRequest?.status === 'pending' && messageRequest.sender_id === user?.id && (
        <View style={styles.messageRequestBanner}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.messageRequestText}>
            Message request sent. {recipientName} can reply to accept.
          </Text>
        </View>
      )}

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
              {!isFriend && !messageRequest 
                ? 'Send a message to start a conversation'
                : 'No messages yet. Start the conversation!'}
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
  messageRequestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.highlight,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    gap: 8,
  },
  messageRequestText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
