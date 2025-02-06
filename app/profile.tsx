// pages/profile.tsx
import { useState, useEffect } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";

const Profile = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [profile, setProfile] = useState({
    displayName: "",
    climbingLevel: "",
    climbingPreferences: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/signin");
      return;
    }
    const fetchProfile = async () => {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as any);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), profile);
      alert("Profile updated!");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label className="block">Display Name</label>
          <input
            name="displayName"
            value={profile.displayName}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block">Climbing Level</label>
          <input
            name="climbingLevel"
            value={profile.climbingLevel}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block">Climbing Preferences</label>
          <input
            name="climbingPreferences"
            value={profile.climbingPreferences}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        {/* Add more fields as needed */}
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default Profile;
