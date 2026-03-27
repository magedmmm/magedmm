import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { auth, db, collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, updateDoc, doc } from "../firebase";
import { Search, Send, Paperclip, MoreVertical, Check, CheckCheck, User, Bot, MessageSquare, Filter } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { io } from "socket.io-client";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const socket = io();

export default function Inbox() {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Listen for conversations in the workspace
    const q = query(
      collection(db, "workspaces", "default", "conversations"),
      orderBy("lastMessageAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConversations(convs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedConversation) return;

    // Join socket room
    socket.emit("join-conversation", selectedConversation.id);

    // Listen for messages in the selected conversation
    const q = query(
      collection(db, "workspaces", "default", "conversations", selectedConversation.id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const messageData = {
      conversationId: selectedConversation.id,
      senderId: auth.currentUser?.uid,
      senderType: "agent",
      text: newMessage,
      createdAt: new Date().toISOString(),
      isInternal: false,
    };

    try {
      // 1. Add to Firestore
      await addDoc(
        collection(db, "workspaces", "default", "conversations", selectedConversation.id, "messages"),
        { ...messageData, createdAt: serverTimestamp() }
      );

      // 2. Update conversation last message
      await updateDoc(doc(db, "workspaces", "default", "conversations", selectedConversation.id), {
        lastMessage: newMessage,
        lastMessageAt: serverTimestamp(),
        lastMessageSenderType: "agent",
        status: "open",
      });

      // 3. Emit socket event
      socket.emit("send-message", messageData);

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex h-full bg-white font-sans overflow-hidden">
      {/* Conversations List */}
      <div className="w-80 border-r border-neutral-200 flex flex-col">
        <div className="p-4 border-b border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">{t("inbox.title")}</h2>
            <button className="p-2 hover:bg-neutral-50 rounded-lg transition-colors">
              <Filter className="w-5 h-5 text-neutral-500" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder={t("inbox.search")}
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-neutral-50">
          {loading ? (
            <div className="p-8 text-center text-neutral-400 text-sm">Loading conversations...</div>
          ) : conversations.length > 0 ? (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={cn(
                  "w-full p-4 flex items-center gap-3 text-left transition-all",
                  selectedConversation?.id === conv.id ? "bg-neutral-50" : "hover:bg-neutral-50"
                )}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-500 font-bold">
                    {conv.customerName?.[0] || "C"}
                  </div>
                  <div className={cn(
                    "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
                    conv.status === 'open' ? 'bg-green-500' : 'bg-neutral-300'
                  )}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-neutral-900 truncate">{conv.customerName || "Anonymous"}</p>
                    <span className="text-xs text-neutral-400">
                      {conv.lastMessageAt ? new Date(conv.lastMessageAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 truncate">{conv.lastMessage}</p>
                </div>
              </button>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-neutral-300" />
              </div>
              <p className="text-neutral-500 text-sm">{t("inbox.no_convs")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-neutral-50">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <header className="bg-white border-b border-neutral-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-500 font-bold">
                  {selectedConversation.customerName?.[0] || "C"}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">{selectedConversation.customerName || "Anonymous"}</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">{selectedConversation.channel}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-neutral-50 rounded-lg text-neutral-500 transition-colors">
                  <Bot className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-neutral-50 rounded-lg text-neutral-500 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </header>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[70%]",
                    msg.senderType === "agent" ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                      msg.senderType === "agent"
                        ? "bg-black text-white rounded-tr-none"
                        : "bg-white text-neutral-900 rounded-tl-none border border-neutral-100"
                    )}
                  >
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[10px] text-neutral-400 font-medium">
                      {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                    </span>
                    {msg.senderType === "agent" && (
                      <CheckCheck className="w-3 h-3 text-blue-500" />
                    )}
                    {msg.senderType === "bot" && (
                      <Bot className="w-3 h-3 text-neutral-400" />
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-neutral-200">
              <form onSubmit={handleSendMessage} className="relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t("inbox.type_message")}
                  className="w-full pl-4 pr-24 py-3 bg-neutral-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-black transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button type="button" className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2 bg-black text-white rounded-xl hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 bg-white rounded-[40px] shadow-xl flex items-center justify-center mb-8 border border-neutral-100">
              <MessageSquare className="w-12 h-12 text-neutral-200" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2 tracking-tight">{t("inbox.select_conv")}</h2>
            <p className="text-neutral-500 max-w-xs mx-auto">{t("inbox.select_desc")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
