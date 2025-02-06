// pages/create-event.tsx
import { useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";

const CreateEvent = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();

  const [spot, setSpot] = useState("");
  const [date, setDate] = useState("");
  const [materialHave, setMaterialHave] = useState("");
  const [materialNeed, setMaterialNeed] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/signin");
      return;
    }
    try {
      await addDoc(collection(db, "events"), {
        userId: user.uid,
        spot,
        date: Timestamp.fromDate(new Date(date)),
        materialHave,
        materialNeed,
        createdAt: Timestamp.now(),
      });
      alert("Event created!");
      router.push("/"); // redirect as needed
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Create an Event</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <input
          className="w-full p-2 border rounded"
          type="text"
          placeholder="Climbing Spot"
          value={spot}
          onChange={(e) => setSpot(e.target.value)}
          required
        />
        <input
          className="w-full p-2 border rounded"
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <input
          className="w-full p-2 border rounded"
          type="text"
          placeholder="Material You Have"
          value={materialHave}
          onChange={(e) => setMaterialHave(e.target.value)}
        />
        <input
          className="w-full p-2 border rounded"
          type="text"
          placeholder="Material You Need"
          value={materialNeed}
          onChange={(e) => setMaterialNeed(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Create Event
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
