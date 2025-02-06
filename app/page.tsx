"use client";

// pages/index.tsx
import React from "react";
import dynamic from "next/dynamic";

// Dynamically import the MapComponent to ensure it loads only on the client side.
const MapComponent = dynamic(() => import("../components/MapComponent"), { ssr: false });

const HomePage: React.FC = () => {
  return (
    <div>
      <h1 className="text-center text-3xl font-bold my-4">Global Climbing Spots (OSM Data)</h1>
      <MapComponent />
    </div>
  );
};

export default HomePage;
