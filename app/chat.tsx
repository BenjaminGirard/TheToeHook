// pages/chat.tsx
import { useState, useEffect } from "react";
import { db, auth } from "../firebase/firebaseConfig";
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

interface Message {
  id: string;
  userId: string;
  text: string;
  createdAt: Timestamp;
}

const Chat = () => {
  const [user] = useAuthState(auth);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const q = query(collection(db, "chat"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Message, "id">),
      }));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, "chat"), {
        userId: user.uid,
        text: newMessage,
        createdAt: Timestamp.now(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Climber Chat</h2>
      <div className="h-96 overflow-y-scroll border p-4 mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <strong>{msg.userId}</strong>: {msg.text}
            <div className="text-xs text-gray-500">{new Date(msg.createdAt.toDate()).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="flex space-x-2">
        <input
          type="text"
          className="flex-1 p-2 border rounded"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
