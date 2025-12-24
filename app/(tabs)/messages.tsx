
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/hooks/useAuth';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase, isSupabaseConfigured } from '@/app/integrations/supabase/client';

interface Conversation {
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  userFirstName?: string;
  userLastName?: string;
  userNickname?: string;
}

export default function MessagesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchConversations = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      // Get all messages where user is sender or recipient
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(id, first_name, last_name, pickleballer_nickname),
          recipient:users!messages_recipient_id_fkey(id, first_name, last_name, pickleballer_nickname)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by conversation partner
      const conversationsMap = new Map<string, Conversation>();

      (messages || []).forEach((message: any) => {
        const isFromMe = message.sender_id === user.id;
        const partnerId = isFromMe ? message.recipient_id : message.sender_id;
        const partner = isFromMe ? message.recipient : message.sender;

        if (!conversationsMap.has(partnerId)) {
          const displayName = partner.first_name && partner.last_name
            ? `${partner.first_name} ${partner.last_name.charAt(0)}.`
            : partner.pickleballer_nickname || 'Unknown User';

          conversationsMap.set(partnerId, {
            userId: partnerId,
            userName: displayName,
            userFirstName: partner.first_name,
            userLastName: partner.last_name,
            userNickname: partner.pickleballer_nickname,
            lastMessage: message.content,
            lastMessageTime: message.created_at,
            unreadCount: 0,
          });
        }

        // Count unread messages from this partner
        if (!isFromMe && !message.read) {
          const conv = conversationsMap.get(partnerId)!;
          conv.unreadCount += 1;
        }
      });

      setConversations(Array.from(conversationsMap.values()));
    } catch (error) {
      console.log('Error fetching conversations:', error);
      Alert.alert('Error', 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();

    // Set up real-time subscription for new messages
    if (user && isSupabaseConfigured()) {
      const subscription = supabase
        .channel('messages')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `recipient_id=eq.${user.id}`,
          },
          () => {
            fetchConversations();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, fetchConversations]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return conv.userName.toLowerCase().includes(query) ||
           conv.userFirstName?.toLowerCase().includes(query) ||
           conv.userLastName?.toLowerCase().includes(query) ||
           conv.userNickname?.toLowerCase().includes(query);
  });

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationCard}
      onPress={() => router.push(`/conversation/${item.userId}`)}
    >
      <View style={styles.avatarContainer}>
        <IconSymbol
          ios_icon_name="person.fill"
          android_material_icon_name="person"
          size={32}
          color={colors.primary}
        />
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>
              {item.unreadCount > 9 ? '9+' : item.unreadCount}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <Text style={[commonStyles.subtitle, { flex: 1 }]} numberOfLines={1}>
            {item.userName}
          </Text>
          <Text style={styles.timeText}>{formatTime(item.lastMessageTime)}</Text>
        </View>
        <Text
          style={[
            commonStyles.textSecondary,
            item.unreadCount > 0 && styles.unreadMessage,
          ]}
          numberOfLines={2}
        >
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={commonStyles.title}>Messages</Text>
        <Text style={commonStyles.textSecondary}>
          Chat with your pickleball friends
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <IconSymbol
          ios_icon_name="magnifyingglass"
          android_material_icon_name="search"
          size={20}
          color={colors.textSecondary}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <IconSymbol
              ios_icon_name="xmark.circle.fill"
              android_material_icon_name="cancel"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {filteredConversations.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol
            ios_icon_name="envelope"
            android_material_icon_name="mail"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={[commonStyles.title, { marginTop: 16, textAlign: 'center' }]}>
            No Messages Yet
          </Text>
          <Text style={[commonStyles.textSecondary, { marginTop: 8, textAlign: 'center' }]}>
            {searchQuery.trim()
              ? 'No conversations match your search'
              : 'Start a conversation by visiting a friend\'s profile'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    marginRight: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  conversationCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.accent,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: colors.card,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.card,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  unreadMessage: {
    fontWeight: '600',
    color: colors.text,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
});
