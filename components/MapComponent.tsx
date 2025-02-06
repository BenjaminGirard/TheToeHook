// components/MapComponent.tsx
"use client";

import React, { useState, useCallback, useRef } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

export type OSMSpot = {
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
};

const containerStyle = {
  width: "100%",
  height: "600px",
};

const defaultCenter = {
  lat: 40.0,
  lng: -100.0,
};

const marginDegrees = 0.05; // Extend the bounds by 0.05 degrees on each side

const MapComponent: React.FC = () => {
  const [spots, setSpots] = useState<OSMSpot[]>([]);
  const mapRef = useRef<google.maps.Map | null>(null);

  const fetchSpots = useCallback(async (bounds: google.maps.LatLngBounds) => {
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    // Extend bounds by adding a margin
    const extendedBounds = {
      north: ne.lat() + marginDegrees,
      east: ne.lng() + marginDegrees,
      south: sw.lat() - marginDegrees,
      west: sw.lng() - marginDegrees,
    };

    const queryString = `?north=${extendedBounds.north}&east=${extendedBounds.east}&south=${extendedBounds.south}&west=${extendedBounds.west}`;

    try {
      const response = await fetch(`/api/osm-climbing${queryString}`);
      if (response.ok) {
        const data = await response.json();
        setSpots(data.spots);
      } else {
        console.error("Failed to fetch spots from OSM", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching spots from OSM:", error);
    }
  }, []);

  const onIdle = () => {
    if (mapRef.current) {
      const bounds = mapRef.current.getBounds();
      if (bounds) {
        fetchSpots(bounds);
      }
    }
  };

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={5}
        onLoad={(map) => (mapRef.current = map)}
        onIdle={onIdle}
      >
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            position={{ lat: spot.lat, lng: spot.lon }}
            title={spot.tags.name || ""}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
