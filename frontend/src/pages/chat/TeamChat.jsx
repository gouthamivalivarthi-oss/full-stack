import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  UserCheck,
  Smile,
  Clock,
  CheckCheck,
  Check,
  Sparkles,
} from 'lucide-react';

export const TeamChat = () => {
  const { user } = useAuth();
  const { socket } = useSocket() || {};

  const [conversations, setConversations] = useState([]);
  const [activeRecipient, setActiveRecipient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Fetch all conversations
  const fetchConversations = async () => {
    try {
      setLoadingConv(true);
      const res = await api.get('/messages/conversations');
      if (res.data.success) {
        const convList = res.data.data || res.data.conversations || [];
        setConversations(convList);
        if (convList.length > 0 && !activeRecipient) {
          // Select other participant in first conversation
          const firstConv = convList[0];
          const other = firstConv.otherUser || firstConv.participants?.find((p) => p._id !== user?._id);
          if (other) {
            setActiveRecipient(other);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    } finally {
      setLoadingConv(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch users for new conversation modal
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        if (res.data.success) {
          setUsersList(res.data.users.filter((u) => u._id !== user?._id) || []);
        }
      } catch (err) {
        // ignore
      }
    };
    fetchUsers();
  }, [user]);

  // Fetch messages when active recipient changes
  useEffect(() => {
    if (!activeRecipient) return;

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const res = await api.get(`/messages/${activeRecipient._id}`);
        if (res.data.success) {
          setMessages(res.data.data || res.data.messages || []);
        }
      } catch (err) {
        console.error('Failed to fetch messages', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeRecipient]);

  // Real-time socket events for chat
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (
        (activeRecipient && msg.sender._id === activeRecipient._id) ||
        msg.sender === activeRecipient?._id ||
        msg.recipient === activeRecipient?._id
      ) {
        setMessages((prev) => [...prev, msg]);
      }
      fetchConversations();
    };

    const handleUserTyping = ({ senderName }) => {
      setTypingUser(senderName);
      setIsTyping(true);
    };

    const handleUserStopTyping = () => {
      setIsTyping(false);
      setTypingUser('');
    };

    socket.on('message', handleNewMessage);
    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      socket.off('message', handleNewMessage);
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
    };
  }, [socket, activeRecipient]);

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRecipient) return;

    const content = newMessage.trim();
    setNewMessage('');

    // Emit stop typing
    if (socket) {
      socket.emit('typing_stop', {
        recipientId: activeRecipient._id,
      });
    }

    try {
      const res = await api.post('/messages', {
        recipientId: activeRecipient._id,
        content,
      });

      if (res.data.success) {
        const sentMsg = res.data.data || res.data.message;
        setMessages((prev) => [...prev, sentMsg]);
        fetchConversations();
      }
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  // Typing event trigger
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (!socket || !activeRecipient) return;

    socket.emit('typing_start', {
      recipientId: activeRecipient._id,
      senderName: user?.name,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', {
        recipientId: activeRecipient._id,
      });
    }, 2000);
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUserQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-7.5rem)] glass-card overflow-hidden grid grid-cols-1 md:grid-cols-12 max-w-7xl mx-auto shadow-xl">
      {/* Left Conversations Sidebar */}
      <div className="md:col-span-4 border-r border-slate-200/80 bg-white/70 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-slate-800 text-sm">Direct Messages</h3>
          </div>
          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-xl transition-colors cursor-pointer"
            title="Start new conversation"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {loadingConv ? (
            <LoadingSpinner size="sm" text="Loading chats..." />
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>No active conversations.</p>
              <button
                onClick={() => setIsNewChatModalOpen(true)}
                className="btn-primary text-xs mt-3 px-3 py-1.5"
              >
                Start a Chat
              </button>
            </div>
          ) : (
            conversations.map((conv) => {
              const other = conv.participants?.find((p) => p._id !== user?._id) || {};
              const isSelected = activeRecipient?._id === other._id;

              return (
                <div
                  key={conv._id}
                  onClick={() => setActiveRecipient(other)}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#FFF8ED] border-r-2 border-[#E9785B]' : 'hover:bg-[#FFFDF9]'
                  }`}
                >
                  <Avatar name={other.name} src={other.avatar} size="sm" isOnline />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#3D2B24] truncate">{other.name}</h4>
                      <span className="text-[10px] text-[#8D6E63]">
                        {conv.lastMessage?.createdAt
                          ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8D6E63] truncate mt-0.5">
                      {conv.lastMessage?.content || 'Started conversation'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Messages Room */}
      <div className="md:col-span-8 flex flex-col h-full bg-[#FFFDF9]">
        {activeRecipient ? (
          <>
            {/* Room Header */}
            <div className="p-4 bg-white/95 backdrop-blur-xl border-b border-[#F6EBDD] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar
                  name={activeRecipient.name}
                  src={activeRecipient.avatar}
                  size="sm"
                  isOnline
                />
                <div>
                  <h4 className="text-xs font-bold text-[#3D2B24]">{activeRecipient.name}</h4>
                  <p className="text-[10px] text-[#8D6E63] capitalize">
                    {activeRecipient.role || 'Teammate'} • {activeRecipient.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMessages ? (
                <LoadingSpinner size="sm" text="Loading messages..." />
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-[#8D6E63] text-xs">
                  <p>Send a message to start collaborating with {activeRecipient.name}!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine =
                    msg.sender === user?._id ||
                    msg.sender?._id === user?._id;

                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs shadow-xs leading-relaxed ${
                          isMine
                            ? 'bg-gradient-to-r from-[#E9785B] to-[#C85C45] text-white rounded-br-none shadow-[0_4px_15px_rgba(233,120,91,0.25)]'
                            : 'bg-white border border-[#F6EBDD] text-[#3D2B24] rounded-bl-none shadow-xs'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                            isMine ? 'text-white/80' : 'text-[#8D6E63]'
                          }`}
                        >
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isMine && <Check className="w-3 h-3 text-white/90" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-[#8D6E63] italic">
                  <span className="w-2 h-2 rounded-full bg-[#E9785B] animate-ping"></span>
                  {typingUser || 'Teammate'} is typing...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <div className="p-3 bg-white border-t border-[#F6EBDD]">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder={`Message ${activeRecipient.name}...`}
                  className="input-field text-xs flex-1"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="btn-primary p-2.5 rounded-2xl cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
            <h4 className="text-sm font-bold text-slate-700">Select a Conversation</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Choose a team member from the left list or start a new direct chat.
            </p>
            <button
              onClick={() => setIsNewChatModalOpen(true)}
              className="btn-primary text-xs mt-4"
            >
              <Plus className="w-4 h-4" /> Start New Chat
            </button>
          </div>
        )}
      </div>

      {/* New Chat User Picker Modal */}
      <Modal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        title="Start Direct Conversation"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search teammates by name or email..."
              value={searchUserQuery}
              onChange={(e) => setSearchUserQuery(e.target.value)}
              className="input-field pl-10 text-xs"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredUsers.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No users found.</p>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u._id}
                  onClick={() => {
                    setActiveRecipient(u);
                    setIsNewChatModalOpen(false);
                  }}
                  className="p-3 bg-slate-50 hover:bg-sky-50 rounded-xl border border-slate-100 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} src={u.avatar} size="sm" isOnline />
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">{u.name}</h5>
                      <p className="text-[10px] text-slate-400">{u.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-sky-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    Chat
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TeamChat;
