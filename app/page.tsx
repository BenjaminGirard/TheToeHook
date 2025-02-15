"use client";

// pages/index.tsx
import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { FaSearch, FaUserCircle, FaGlobe, FaBars, FaStar } from 'react-icons/fa';
import { OSMSpot } from "@/components/MapComponent";
import { SpotCard } from "@/components/SpotCard";

// Dynamically import the MapComponent to ensure it loads only on the client side.
const MapComponent = dynamic(() => import("../components/MapComponent"), { ssr: false });


const HomePage: React.FC = () => {
  const [visibleSpots, setVisibleSpots] = useState<OSMSpot[]>([]);
  const [sortBy, setSortBy] = useState<'best' | 'grade' | 'distance'>('best');

  const sortSpots = (spots: OSMSpot[]): OSMSpot[] => {
    // Filter out invalid spots first
    const validSpots = spots.filter((spot): spot is OSMSpot => 
      spot !== null && 
      spot.tags !== null &&
      typeof spot.lat === 'number' && 
      typeof spot.lon === 'number' &&
      !isNaN(spot.lat) && 
      !isNaN(spot.lon)
    );

    switch (sortBy) {
      case 'grade':
        return [...validSpots].sort((a, b) => {
          const gradeA = a.tags?.grade || '';
          const gradeB = b.tags?.grade || '';
          return gradeA.localeCompare(gradeB);
        });
      case 'distance':
        // You can implement distance sorting when you have user's location
        return validSpots;
      case 'best':
      default:
        return [...validSpots].sort((a, b) => {
          const nameA = a.tags?.name || '';
          const nameB = b.tags?.name || '';
          // Sort by name length, then alphabetically if lengths are equal
          const lengthDiff = nameB.length - nameA.length;
          return lengthDiff !== 0 ? lengthDiff : nameA.localeCompare(nameB);
        });
    }
  };

  // Create unique keys for spots
  const spotsWithKeys = useMemo(() => 
    sortSpots(visibleSpots)
      .map((spot, index) => ({
        ...spot,
        uniqueKey: `${spot.id}-${spot.lat.toFixed(6)}-${spot.lon.toFixed(6)}-${spot.tags.type}-${index}`
      }))
  , [visibleSpots, sortBy]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-[2520px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="text-airbnb-primary font-bold text-3xl">
              TheToeHook
            </div>

            {/* Search Bar */}
            <div className="hidden md:block">
              <div className="flex items-center border rounded-full shadow-sm hover:shadow-md transition cursor-pointer p-2">
                <button className="px-4 font-medium">Anywhere</button>
                <span className="h-6 border-l border-gray-300"></span>
                <button className="px-4 font-medium">Any grade</button>
                <span className="h-6 border-l border-gray-300"></span>
                <button className="px-4 text-gray-500">Any type</button>
                <div className="bg-airbnb-primary p-2 rounded-full">
                  <FaSearch className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <button className="hidden md:block hover:bg-gray-100 px-4 py-2 rounded-full transition">
                List your spot
              </button>
              <button className="hidden md:flex items-center hover:bg-gray-100 p-2 rounded-full transition">
                <FaGlobe className="w-5 h-5" />
              </button>
              <div className="flex items-center border rounded-full p-2 hover:shadow-md transition cursor-pointer gap-2">
                <FaBars className="w-5 h-5" />
                <FaUserCircle className="w-7 h-7 text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex">
        {/* Sidebar */}
        <div className="w-[40%] h-[calc(100vh-80px)] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b">
            <h2 className="text-[14px] text-gray-800">
              <span className="font-semibold">{visibleSpots.length} climbing spots</span> in this area
            </h2>
          </div>

          {/* Spots List */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="flex flex-col divide-y">
              {spotsWithKeys.map((spot) => (
                <SpotCard 
                  key={spot.uniqueKey}
                  spot={spot} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="flex-1 h-[calc(100vh-80px)]">
          <MapComponent onSpotsUpdate={setVisibleSpots} />
        </div>
      </main>
    </div>
  );
};

export default HomePage;
