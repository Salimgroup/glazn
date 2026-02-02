"use client";

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Send, Search, ArrowLeft, MoreVertical, Phone, Video, Paperclip, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { UserAvatar } from '@/components/UserAvatar';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Conversation {
  id: string;
  participant: {
    id: string;
    display_name: string;
    username: string;
    avatar_url: string;
    user_type: string;
    company_name: string | null;
  };
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read: boolean;
  attachment_url?: string;
  attachment_type?: string;
}

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === conversationId);
      if (conv) {
        setSelectedConversation(conv);
        fetchMessages(conversationId);
      }
    }
  }, [conversationId, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!selectedConversation) return;

    const subscription = supabase
      .channel(`messages:${selectedConversation.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${selectedConversation.id}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      // In a real app, you'd have a conversations table
      // For now, we'll simulate with a basic structure
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          last_message,
          last_message_at,
          unread_count,
          participant1:profiles!conversations_participant1_id_fkey (
            id, display_name, username, avatar_url, user_type, company_name
          ),
          participant2:profiles!conversations_participant2_id_fkey (
            id, display_name, username, avatar_url, user_type, company_name
          )
        `)
        .or(`participant1_id.eq.${user?.id},participant2_id.eq.${user?.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const formattedConversations = (data || []).map(conv => {
        const participant = conv.participant1?.id === user?.id ? conv.participant2 : conv.participant1;
        return {
          id: conv.id,
          participant,
          last_message: conv.last_message,
          last_message_at: conv.last_message_at,
          unread_count: conv.unread_count || 0,
        };
      });

      setConversations(formattedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', convId)
        .neq('sender_id', user?.id);

    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user?.id,
          content: newMessage.trim(),
        });

      if (error) throw error;

      // Update conversation's last message
      await supabase
        .from('conversations')
        .update({
          last_message: newMessage.trim(),
          last_message_at: new Date().toISOString(),
        })
        .eq('id', selectedConversation.id);

      setNewMessage('');
    } catch (error: any) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    navigate(`/messages/${conv.id}`);
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      conv.participant.display_name?.toLowerCase().includes(query) ||
      conv.participant.username?.toLowerCase().includes(query) ||
      conv.participant.company_name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="h-screen bg-gradient-space flex">
      {/* Conversations List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-border bg-card/50 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Messages</h1>
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-12 h-12 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No conversations yet</p>
              <p className="text-sm mt-1">Start by connecting with creators or brands</p>
            </div>
          ) : (
            <div className="p-2">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full p-3 rounded-lg flex items-start gap-3 hover:bg-muted/50 transition-colors text-left ${
                    selectedConversation?.id === conv.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="relative">
                    <UserAvatar
                      src={conv.participant.avatar_url}
                      fallback={conv.participant.display_name?.[0] || '?'}
                      className="w-12 h-12"
                    />
                    {conv.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-neon-pink rounded-full text-xs font-medium flex items-center justify-center">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">
                        {conv.participant.company_name || conv.participant.display_name}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.last_message}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="md:hidden"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <UserAvatar
                  src={selectedConversation.participant.avatar_url}
                  fallback={selectedConversation.participant.display_name?.[0] || '?'}
                  className="w-10 h-10"
                />
                <div>
                  <p className="font-medium">
                    {selectedConversation.participant.company_name || selectedConversation.participant.display_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{selectedConversation.participant.username}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwn = message.sender_id === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isOwn
                            ? 'bg-gradient-to-r from-neon-pink to-neon-purple text-white'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-muted-foreground'}`}>
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card/50">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <ImageIcon className="w-4 h-4" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!newMessage.trim() || sending}
                  className="bg-gradient-to-r from-neon-pink to-neon-purple"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8" />
              </div>
              <p className="font-medium">Select a conversation</p>
              <p className="text-sm">Choose from your existing conversations or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
