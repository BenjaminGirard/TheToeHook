// pages/signup.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../firebase/firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const Signup = () => {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Optionally update the display name in Firebase Auth profile
      await updateProfile(userCredential.user, { displayName });

      // Create a user profile in Firestore with extra climbing data fields
      await setDoc(doc(db, "users", userCredential.user.uid), {
        displayName,
        email,
        climbingLevel: "", // will be filled by the user later
        climbingPreferences: "",
        createdAt: new Date().toISOString(),
      });

      router.push("/profile"); // redirect to profile page for further details
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSignup} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
        <input
          className="w-full p-2 border rounded mb-4"
          type="text"
          placeholder="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
        <input
          className="w-full p-2 border rounded mb-4"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full p-2 border rounded mb-4"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;
