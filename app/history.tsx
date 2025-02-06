// pages/history.tsx
import { useState, useEffect } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";

interface Event {
  id: string;
  spot: string;
  date: any;
}

const History = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/signin");
      return;
    }
    const q = query(
      collection(db, "events"),
      where("userId", "==", user.uid),
      orderBy("date", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const evts: Event[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Event, "id">),
      }));
      setEvents(evts);
    });
    return () => unsubscribe();
  }, [user, router]);

  return (
    <div className="min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Your Event History</h2>
      <ul>
        {events.map((evt) => (
          <li key={evt.id} className="mb-2 border p-2 rounded">
            <strong>{evt.spot}</strong> on {new Date(evt.date.seconds * 1000).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default History;
