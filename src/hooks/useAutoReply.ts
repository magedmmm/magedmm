import { useEffect, useRef } from "react";
import { db, collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, updateDoc, doc, getDoc, auth } from "../firebase";
import { generateAutoReply } from "../services/geminiService";

export function useAutoReply(user: any) {
  const processedMessages = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "workspaces", "default", "conversations"),
      orderBy("lastMessageAt", "desc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      // 1. Fetch workspace settings
      const workspaceRef = doc(db, "workspaces", "default");
      const workspaceSnap = await getDoc(workspaceRef);
      if (!workspaceSnap.exists()) return;
      const settings = workspaceSnap.data();
      
      if (!settings?.aiEnabled) return;

      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "modified" || change.type === "added") {
          const convData = change.doc.data();
          const convId = change.doc.id;

          // Only reply if the last message was from a customer
          if (convData.lastMessageSenderType === "customer") {
            const messageId = convData.lastMessageAt?.seconds?.toString() || convData.lastMessage;
            
            // Avoid replying twice to the same message
            if (processedMessages.current.has(messageId)) return;
            processedMessages.current.add(messageId);

            console.log("AI Auto-replying to:", convData.lastMessage);

            // 2. Generate AI reply
            const aiReply = await generateAutoReply(convData.lastMessage, settings.knowledgeBaseContext || "");
            
            if (aiReply) {
              // 3. Add to Firestore
              await addDoc(
                collection(db, "workspaces", "default", "conversations", convId, "messages"),
                {
                  conversationId: convId,
                  senderId: "ai-agent",
                  senderType: "bot",
                  text: aiReply,
                  createdAt: serverTimestamp(),
                  isInternal: false,
                }
              );

              // 4. Update conversation last message
              await updateDoc(doc(db, "workspaces", "default", "conversations", convId), {
                lastMessage: aiReply,
                lastMessageAt: serverTimestamp(),
                lastMessageSenderType: "agent",
                status: "open",
              });
            }
          }
        }
      });
    });

    return () => unsubscribe();
  }, [user]);
}
