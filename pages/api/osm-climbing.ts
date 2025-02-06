// pages/api/osm-climbing.ts
import type { NextApiRequest, NextApiResponse } from 'next';

type OSMSpot = {
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
};

type ResponseData = {
  spots: OSMSpot[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | { error: string }>
) {
  const { north, east, south, west } = req.query;
  if (!north || !east || !south || !west) {
    return res.status(400).json({ error: 'Missing bounding box parameters' });
  }

  // Construct Overpass QL query.
  // This query fetches:
  // - nodes with tag sport=climbing,
  // - ways with tag sport=climbing,
  // - relations with tag sport=climbing.
  // For ways and relations we use "out center" so that a center coordinate is returned.
  const query = `
    [out:json];
    (
      node["sport"="climbing"](${south},${west},${north},${east});
      way["sport"="climbing"](${south},${west},${north},${east});
      relation["sport"="climbing"](${south},${west},${north},${east});
    );
    out center;
  `;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
      headers: { "Content-Type": "text/plain" },
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Process elements: for ways and relations, use the provided center.
    const spots: OSMSpot[] = data.elements
      .map((el: any) => {
        let lat = el.lat;
        let lon = el.lon;
        if (!lat || !lon) {
          // For ways and relations, the center property is available.
          if (el.center) {
            lat = el.center.lat;
            lon = el.center.lon;
          }
        }
        return {
          id: el.id,
          lat,
          lon,
          tags: el.tags || {},
        };
      })
      .filter((spot: any) => spot.lat && spot.lon);

    res.status(200).json({ spots });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch climbing spots from OSM' });
  }
}
