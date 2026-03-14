import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { squadsApi, messagesApi } from '@/services/api';
import { Squad, Message } from '@/types';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useSocket } from '@/hooks/useSocket';
import { Send, ArrowLeft, Users, Loader2 } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

const formatMsgTime = (date: string) => {
  const d = new Date(date);
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return `Yesterday ${format(d, 'HH:mm')}`;
  return format(d, 'MMM d, HH:mm');
};

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [squad, setSquad] = useState<Squad | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const isTypingRef = useRef(false);

  const { joinRoom, leaveRoom, sendMessage, startTyping, stopTyping,
          onNewMessage, onUserJoined, onUserLeft, onUserTyping, onUserStoppedTyping } = useSocket();

  useEffect(() => {
    if (!id) return;
    Promise.all([
      squadsApi.getById(id),
      messagesApi.getBySquad(id, { limit: 50 }),
    ]).then(([squadRes, msgRes]) => {
      setSquad(squadRes.data.squad);
      setMessages(msgRes.data.messages);
    }).finally(() => setLoading(false));
  }, [id]);

  // Join socket room
  useEffect(() => {
    if (!id || loading) return;
    joinRoom(id);
    return () => { leaveRoom(id); };
  }, [id, loading, joinRoom, leaveRoom]);

  // Socket event listeners
  useEffect(() => {
    const offMsg = onNewMessage(msg => {
      setMessages(prev => [...prev, msg]);
    });
    const offJoin = onUserJoined(data => {
      const sysMsg: Message = {
        _id: Date.now().toString(),
        squad: id!,
        sender: data.user,
        content: data.message,
        type: 'system',
        createdAt: data.timestamp,
      };
      setMessages(prev => [...prev, sysMsg]);
    });
    const offLeft = onUserLeft(data => {
      const sysMsg: Message = {
        _id: Date.now().toString() + '_left',
        squad: id!,
        sender: data.user,
        content: data.message,
        type: 'system',
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, sysMsg]);
    });
    const offTyping = onUserTyping(data => {
      if (data.user._id === user?._id) return;
      setTypingUsers(prev => ({ ...prev, [data.user._id]: data.user.name }));
    });
    const offStopped = onUserStoppedTyping(data => {
      setTypingUsers(prev => {
        const copy = { ...prev };
        delete copy[data.userId];
        return copy;
      });
    });
    return () => { offMsg(); offJoin(); offLeft(); offTyping(); offStopped(); };
  }, [id, user, onNewMessage, onUserJoined, onUserLeft, onUserTyping, onUserStoppedTyping]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      startTyping(id!);
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      stopTyping(id!);
    }, 1500);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !id) return;
    sendMessage(id, input.trim());
    setInput('');
    isTypingRef.current = false;
    stopTyping(id);
    clearTimeout(typingTimeoutRef.current);
  };

  const isMember = squad?.members.some((m: any) => m._id === user?._id);

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-ocean-500" />
    </div>
  );

  if (!squad || !isMember) return (
    <div className="page-container py-20 text-center">
      <p className="text-slate-500">You need to be a squad member to access the chat.</p>
      <Link to="/squads" className="text-ocean-600 hover:underline mt-2 inline-block">Browse squads</Link>
    </div>
  );

  const typingNames = Object.values(typingUsers);

  return (
    <div className="flex flex-col h-screen lg:h-[calc(100vh-0px)]">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate(`/squads/${id}`)} className="text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 truncate">{squad.name}</p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <Users className="w-3 h-3" /> {squad.members.length} members · {squad.destination}
          </p>
        </div>
        <Link
          to={`/squads/${id}`}
          className="text-sm text-ocean-600 font-medium hover:underline"
        >
          View squad
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-slate-50">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-slate-500 text-sm">No messages yet. Say hello to your squad!</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isOwn = msg.sender._id === user?._id;
          const isSystem = msg.type === 'system';
          const prevMsg = messages[i - 1];
          const showAvatar = !isOwn && (!prevMsg || prevMsg.sender._id !== msg.sender._id);

          if (isSystem) return (
            <div key={msg._id} className="flex justify-center">
              <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{msg.content}</span>
            </div>
          );

          return (
            <div key={msg._id} className={`flex gap-3 message-bubble ${isOwn ? 'flex-row-reverse' : ''}`}>
              {!isOwn && (
                <div className="w-8 h-8 rounded-full bg-ocean-100 flex items-center justify-center text-ocean-600 text-xs font-bold overflow-hidden shrink-0 self-end">
                  {showAvatar ? (
                    msg.sender.profilePhoto
                      ? <img src={msg.sender.profilePhoto} alt={msg.sender.name} className="w-full h-full object-cover" />
                      : msg.sender.name?.[0]?.toUpperCase()
                  ) : <span className="opacity-0">X</span>}
                </div>
              )}
              <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {showAvatar && !isOwn && (
                  <span className="text-xs text-slate-500 font-medium px-1">{msg.sender.name}</span>
                )}
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isOwn
                    ? 'bg-slate-900 text-white rounded-br-sm'
                    : 'bg-white border border-border text-slate-900 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
                <span className="text-xs text-slate-400 px-1">{formatMsgTime(msg.createdAt)}</span>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typingNames.length > 0 && (
          <div className="flex gap-3 items-end">
            <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
            <div className="bg-white border border-border px-4 py-2.5 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1 items-center">
                <span className="text-xs text-slate-500">{typingNames.join(', ')} {typingNames.length === 1 ? 'is' : 'are'} typing</span>
                <span className="flex gap-0.5 ml-1">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse-soft" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="bg-white border-t border-border p-4 shrink-0">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ocean-500 transition text-sm"
            autoFocus
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-700 transition-colors disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
