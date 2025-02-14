import React, { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

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

const marginDegrees = 0.05;

const MapComponent: React.FC = () => {
  const [spots, setSpots] = useState<OSMSpot[]>([]);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerClusterRef = useRef<MarkerClusterer | null>(null);

  const fetchSpots = useCallback(async (bounds: google.maps.LatLngBounds) => {
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

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

  const initializeMarkerClusterer = () => {
    if (mapRef.current && !markerClusterRef.current) {
      markerClusterRef.current = new MarkerClusterer({ map: mapRef.current });
    }
  };

  const updateMarkers = async () => {
    if (markerClusterRef.current) {
      const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
      const markers = spots.map((spot) => {
        const marker = new AdvancedMarkerElement({
          position: { lat: spot.lat, lng: spot.lon },
          title: spot.tags.name || "",
        });
        return marker;
      });
      markerClusterRef.current.clearMarkers();
      markerClusterRef.current.addMarkers(markers);
    }
  };

  useEffect(() => {
    updateMarkers();
  }, [spots]);

  useEffect(() => {
    console.log(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  }, []);

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={5}
        options={{
          mapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || "",
          disableDefaultUI: true, // Optional: removes default UI elements for cleaner look
        }}
        onLoad={(map) => {
          mapRef.current = map;
          initializeMarkerClusterer();
        }}
        onIdle={onIdle}
      />
    </LoadScript>
  );
};

export default MapComponent;
