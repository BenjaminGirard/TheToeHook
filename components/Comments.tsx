// components/Comments.tsx
import {useState, useEffect, JSX} from "react";
import { db, auth } from "@/firebase/firebaseConfig";
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: Timestamp;
}

interface CommentsProps {
  eventId: string;
}

const Comments: ({eventId}: { eventId: any }) => JSX.Element = ({ eventId }) => {
  const [user] = useAuthState(auth);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const q = query(collection(db, "events", eventId, "comments"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const comms: Comment[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Comment, "id">),
      }));
      setComments(comms);
    });
    return () => unsubscribe();
  }, [eventId]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, "events", eventId, "comments"), {
        userId: user.uid,
        text: newComment,
        createdAt: Timestamp.now(),
      });
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-2">Comments</h3>
      <div className="space-y-2">
        {comments.map((comm) => (
          <div key={comm.id} className="p-2 border rounded">
            <p>{comm.text}</p>
            <small>{new Date(comm.createdAt.toDate()).toLocaleString()}</small>
          </div>
        ))}
      </div>
      <form onSubmit={handleCommentSubmit} className="mt-4 flex space-x-2">
        <input
          type="text"
          className="flex-1 p-2 border rounded"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          required
        />
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Post
        </button>
      </form>
    </div>
  );
};

export default Comments;
