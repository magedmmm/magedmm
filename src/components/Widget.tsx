import { useEffect, useState, useRef } from "react";
import { db, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, getDoc, updateDoc } from "../firebase";
import { Send, X, MessageSquare, Paperclip, Bot, User } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { io } from "socket.io-client";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const socket = io();

export default function Widget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(localStorage.getItem("anychat_conv_id"));
  const [workspaceConfig, setWorkspaceConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const urlParams = new URLSearchParams(window.location.search);
  const apiKey = urlParams.get("key");

  useEffect(() => {
    if (!apiKey) return;

    // Fetch workspace config
    const fetchConfig = async () => {
      const workspaceDoc = await getDoc(doc(db, "workspaces", "default"));
      if (workspaceDoc.exists()) {
        setWorkspaceConfig(workspaceDoc.data());
      }
    };
    fetchConfig();
  }, [apiKey]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setIsLoading(true);

    // Join socket room
    socket.emit("join-conversation", conversationId);

    // Listen for messages
    const q = query(
      collection(db, "workspaces", "default", "conversations", conversationId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setIsLoading(false);
      scrollToBottom();
    }, (error) => {
      console.error("Error loading messages:", error);
      setIsLoading(false);
      // If conversation doesn't exist or permission denied, reset
      if (error.message.includes("permission-denied")) {
        setConversationId(null);
        localStorage.removeItem("anychat_conv_id");
      }
    });

    return () => unsubscribe();
  }, [conversationId]);

  const startNewChat = () => {
    if (confirm("Start a new conversation? Your current history will be cleared from this device.")) {
      setConversationId(null);
      localStorage.removeItem("anychat_conv_id");
      setMessages([]);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const messageText = newMessage.trim();
    if (!messageText) return;

    let currentConvId = conversationId;
    setNewMessage("");

    try {
      // 1. Create conversation if it doesn't exist
      if (!currentConvId) {
        const convRef = await addDoc(collection(db, "workspaces", "default", "conversations"), {
          workspaceId: "default",
          customerName: "Customer",
          channel: "livechat",
          status: "unread",
          lastMessage: messageText,
          lastMessageAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
        currentConvId = convRef.id;
        setConversationId(currentConvId);
        localStorage.setItem("anychat_conv_id", currentConvId);
      }

      const messageData = {
        conversationId: currentConvId,
        senderId: "customer",
        senderType: "customer",
        text: messageText,
        createdAt: new Date().toISOString(),
        isInternal: false,
      };

      // 2. Add to Firestore
      await addDoc(
        collection(db, "workspaces", "default", "conversations", currentConvId, "messages"),
        { ...messageData, createdAt: serverTimestamp() }
      );

      // 3. Update conversation last message
      await updateDoc(doc(db, "workspaces", "default", "conversations", currentConvId), {
        lastMessage: messageText,
        lastMessageAt: serverTimestamp(),
        lastMessageSenderType: "customer",
        status: "unread",
      });

      // 4. Emit socket event
      socket.emit("send-message", messageData);

      // 5. AI Auto-Reply if enabled
      if (workspaceConfig?.aiEnabled) {
        // Show typing indicator (local state or socket)
        // For simplicity, we'll just fetch the reply
        const response = await fetch("/api/ai-reply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: messageText,
            context: workspaceConfig.knowledgeBaseContext || ""
          })
        });

        if (response.ok) {
          const { reply } = await response.json();
          
          const botMessageData = {
            conversationId: currentConvId,
            senderId: "bot",
            senderType: "bot",
            text: reply,
            createdAt: new Date().toISOString(),
            isInternal: false,
          };

          // Add bot message to Firestore
          await addDoc(
            collection(db, "workspaces", "default", "conversations", currentConvId, "messages"),
            { ...botMessageData, createdAt: serverTimestamp() }
          );

          // Update conversation last message
          await updateDoc(doc(db, "workspaces", "default", "conversations", currentConvId), {
            lastMessage: reply,
            lastMessageAt: serverTimestamp(),
            lastMessageSenderType: "bot",
          });

          // Emit socket event
          socket.emit("send-message", botMessageData);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    if (window.parent) {
      window.parent.postMessage({ type: 'anychat-toggle', isOpen }, '*');
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{ 
          backgroundColor: workspaceConfig?.widgetConfig?.primaryColor || "#000000",
          borderRadius: workspaceConfig?.widgetConfig?.borderRadius || "24px",
          left: workspaceConfig?.widgetConfig?.position === "left" ? "0" : "auto",
          right: workspaceConfig?.widgetConfig?.position === "right" ? "0" : "auto",
        }}
        className="fixed bottom-0 w-16 h-16 text-white shadow-lg flex items-center justify-center hover:scale-110 transition-all z-[999999]"
      >
        <MessageSquare className="w-8 h-8" />
      </button>
    );
  }

  return (
    <div 
      style={{ 
        borderRadius: workspaceConfig?.widgetConfig?.borderRadius || "24px",
        fontFamily: workspaceConfig?.widgetConfig?.fontFamily || "Inter",
      }}
      className="fixed inset-0 w-full h-full bg-white shadow-lg flex flex-col overflow-hidden border border-neutral-100 z-[999999]"
    >
      {/* Header */}
      <header 
        style={{ 
          backgroundColor: workspaceConfig?.widgetConfig?.primaryColor || "#000000",
          backgroundImage: workspaceConfig?.widgetConfig?.headerGradient 
            ? `linear-gradient(135deg, ${workspaceConfig?.widgetConfig?.primaryColor || "#000000"} 0%, #1a1a1a 100%)` 
            : "none"
        }}
        className="text-white p-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neutral-800 rounded-xl flex items-center justify-center font-bold text-xl">A</div>
          <div>
            <h3 className="font-bold tracking-tight">AnyChat Support</h3>
            <p className="text-xs text-neutral-400">Typically replies in minutes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {conversationId && (
            <button 
              onClick={startNewChat}
              title="Start New Chat"
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-50">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
          </div>
        )}
        {!isLoading && messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-neutral-200" />
            </div>
            <h4 className="font-bold text-neutral-900 mb-2">Hello! 👋</h4>
            <p className="text-sm text-neutral-500 max-w-[200px] mx-auto">How can we help you today? Send us a message and we'll get back to you shortly.</p>
          </div>
        )}
        {!isLoading && messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col max-w-[85%]",
              msg.senderType === "customer" ? "ml-auto items-end" : "items-start"
            )}
          >
            <div
              style={{ 
                backgroundColor: msg.senderType === "customer" ? (workspaceConfig?.widgetConfig?.primaryColor || "#000000") : "#ffffff",
                color: msg.senderType === "customer" ? "#ffffff" : "#171717",
                borderRadius: workspaceConfig?.widgetConfig?.borderRadius || "24px",
                borderTopRightRadius: msg.senderType === "customer" ? "0" : (workspaceConfig?.widgetConfig?.borderRadius || "24px"),
                borderTopLeftRadius: msg.senderType === "customer" ? (workspaceConfig?.widgetConfig?.borderRadius || "24px") : "0",
              }}
              className={cn(
                "px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                msg.senderType !== "customer" && "border border-neutral-100"
              )}
            >
              {msg.text}
            </div>
            <div className="flex items-center gap-1 mt-1 px-1">
              <span className="text-[10px] text-neutral-400 font-medium">
                {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
              </span>
              {msg.senderType === "bot" && <Bot className="w-3 h-3 text-neutral-400" />}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-neutral-100">
        <form onSubmit={handleSendMessage} className="relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="w-full pl-4 pr-12 py-3 bg-neutral-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-black transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            style={{ backgroundColor: workspaceConfig?.widgetConfig?.primaryColor || "#000000" }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white rounded-xl hover:opacity-80 disabled:opacity-50 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-[10px] text-center text-neutral-400 mt-3 uppercase tracking-widest font-bold">Powered by AnyChat</p>
      </div>
    </div>
  );
}
