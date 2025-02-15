// pages/api/osm-climbing.ts
import type { NextApiRequest, NextApiResponse } from 'next';

// Define all possible climbing types
type ClimbingType = 'sport' | 'trad' | 'boulder' | 'ice' | 'mixed';

// Define all possible spot types
type SpotType = 'crag' | 'boulder' | 'gym' | 'ice' | 'route' | 'area';

// Define all possible protection types
type ProtectionType = 'bolted' | 'trad' | 'mixed';

// Define image source types for better tracking
type ImageSource = 'openbeta' | 'mountainproject' | 'thecrag' | 'wikimedia' | 'unsplash' | 'placeholder';

interface ImageResult {
  url: string;
  source: ImageSource;
}

// Define the structure of normalized tags
type NormalizedTags = {
  name?: string;
  description?: string;
  type: SpotType;
  climbing_type?: ClimbingType;
  grade?: string;
  rock_type?: string;
  height?: string;
  orientation?: string;
  access?: string;
  url?: string;
  image_url: string;
  image_source: ImageSource;
  rating: number;
  number_of_routes?: number;
  protection?: ProtectionType;
  is_indoor: boolean;
};

// Define the structure of a climbing spot
type OSMSpot = {
  id: number;
  lat: number;
  lon: number;
  tags: NormalizedTags;
  difficulty_level: number;
  distance: number;
};

// Define the API response type
type ResponseData = {
  spots: OSMSpot[];
  total: number;
};

// Define the raw OSM tags type
type RawOSMTags = {
  name?: string;
  description?: string;
  climbing?: string;
  'climbing:boulder'?: string;
  'climbing:sport'?: string;
  'climbing:trad'?: string;
  'climbing:ice'?: string;
  'climbing:mixed'?: string;
  'climbing:rock'?: string;
  'climbing:grade:yds_class'?: string;
  'climbing:grade:uiaa'?: string;
  'climbing:grade:french'?: string;
  'climbing:length'?: string;
  'climbing:orientation'?: string;
  'climbing:url:mountainproject'?: string;
  'climbing:url:openbeta'?: string;
  'climbing:url:thecrag'?: string;
  grade?: string;
  height?: string;
  access?: string;
  url?: string;
  website?: string;
  stars?: string;
  leisure?: string;
  building?: string;
  sport?: string;
  wikidata?: string;
  [key: string]: string | undefined;
};

// Define the raw OSM element type
type RawOSMElement = {
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: RawOSMTags;
};

// Helper functions with proper typing
const normalizeClimbingType = (tags: RawOSMTags): ClimbingType | undefined => {
  if (tags.climbing === 'boulder' || tags['climbing:boulder'] === 'yes') return 'boulder';
  if (tags['climbing:sport'] === 'yes') return 'sport';
  if (tags['climbing:trad'] === 'yes') return 'trad';
  if (tags['climbing:ice'] === 'yes' || tags['climbing:ice']) return 'ice';
  if (tags['climbing:mixed'] === 'yes') return 'mixed';
  return undefined;
};

const normalizeSpotType = (tags: RawOSMTags): SpotType | undefined => {
  if (tags.leisure === 'sports_centre' || tags.building === 'yes') return 'gym';
  if (tags.climbing === 'crag') return 'crag';
  if (tags.climbing === 'boulder') return 'boulder';
  if (tags.climbing === 'route_bottom') return 'route';
  if (tags.climbing === 'area') return 'area';
  if (tags.sport === 'climbing') return 'crag';
  return undefined;
};

const normalizeProtection = (tags: RawOSMTags): ProtectionType | undefined => {
  if (tags['climbing:bolted'] === 'yes' || tags['climbing:sport'] === 'yes') return 'bolted';
  if (tags['climbing:trad'] === 'yes') return 'trad';
  if (tags['climbing:mixed'] === 'yes') return 'mixed';
  return undefined;
};

const getUrl = (tags: RawOSMTags): string | undefined => {
  console.log({
    monatinproj: tags['climbing:url:mountainproject'],
    openbeta: tags['climbing:url:openbeta'],
    thecrag: tags['climbing:url:thecrag']
  })
  return tags['climbing:url:mountainproject'] ||
         tags['climbing:url:openbeta'] ||
         tags['climbing:url:thecrag'] ||
         tags.url ||
         tags.website;
};

const getNumberOfRoutes = (tags: RawOSMTags): number | undefined => {
  const sportRoutes = parseInt(tags['climbing:sport'] || '0');
  const tradRoutes = parseInt(tags['climbing:trad'] || '0');
  const total = sportRoutes + tradRoutes;
  return total > 0 ? total : undefined;
};

const getImageFromOpenBeta = async (url?: string): Promise<string | undefined> => {
  if (!url) return undefined;
  
  try {
    const cragId = url.split('/crag/')[1];
    const query = `
      query GetCragMedia($uuid: ID!) {
        crag(uuid: $uuid) {
          media {
            mediaUrl
          }
        }
      }
    `;

    const response = await fetch('https://api.openbeta.io/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: { uuid: cragId },
      }),
    });

    const data = await response.json();
    return data.data?.crag?.media?.[0]?.mediaUrl;
  } catch (error) {
    console.error('OpenBeta image fetch failed:', error);
    return undefined;
  }
};

const getImageFromMountainProject = async (url?: string): Promise<string | undefined> => {
  if (!url) return undefined;
  const MP_KEY = process.env.MOUNTAIN_PROJECT_API_KEY;
  if (!MP_KEY) return undefined;

  try {
    const routeId = url.split('/')[url.split('/').length - 1];
    const response = await fetch(
      `https://www.mountainproject.com/data/get-routes?routeIds=${routeId}&key=${MP_KEY}`
    );
    const data = await response.json();
    return data.routes?.[0]?.imgMedium;
  } catch (error) {
    console.error('Mountain Project image fetch failed:', error);
    return undefined;
  }
};

const getImageFromTheCrag = async (url?: string): Promise<string | undefined> => {
  if (!url) return undefined;
  
  try {
    const response = await fetch(url);
    const html = await response.text();
    // Basic meta tag image extraction
    const match = html.match(/<meta property="og:image" content="([^"]+)"/);
    return match?.[1];
  } catch (error) {
    console.error('TheCrag image fetch failed:', error);
    return undefined;
  }
};

const getImageFromWikimedia = async (tags: RawOSMTags): Promise<string | undefined> => {
  const wikidata = tags.wikidata;
  if (!wikidata) return undefined;

  try {
    const response = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbgetclaims&property=P18&entity=${wikidata}&format=json`
    );
    const data = await response.json();
    const filename = data.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
    if (filename) {
      return `https://commons.wikimedia.org/wiki/Special:FilePath/${filename}?width=800`;
    }
    return undefined;
  } catch (error) {
    console.error('Wikimedia image fetch failed:', error);
    return undefined;
  }
};


const getSpotImage = async (tags: RawOSMTags, spotType: SpotType): Promise<ImageResult> => {
  try {
    // 1. Try OpenBeta
    const openBetaImage = await getImageFromOpenBeta(tags['climbing:url:openbeta']);
    if (openBetaImage) return { url: openBetaImage, source: 'openbeta' };

    // 2. Try Mountain Project
    const mpImage = await getImageFromMountainProject(tags['climbing:url:mountainproject']);
    if (mpImage) return { url: mpImage, source: 'mountainproject' };

    // 3. Try TheCrag
    const theCragImage = await getImageFromTheCrag(tags['climbing:url:thecrag']);
    if (theCragImage) return { url: theCragImage, source: 'thecrag' };

    // 4. Try Wikimedia
    const wikiImage = await getImageFromWikimedia(tags);
    if (wikiImage) return { url: wikiImage, source: 'wikimedia' };

    // 6. Fallback to placeholder
    return {
      url: `/images/${spotType}-placeholder.jpg`,
      source: 'placeholder'
    };
  } catch (error) {
    console.error('Image fetch failed:', error);
    return {
      url: `/images/${spotType}-placeholder.jpg`,
      source: 'placeholder'
    };
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | { error: string }>
) {
  const { north, east, south, west } = req.query;
  
  if (!north || !east || !south || !west) {
    return res.status(400).json({ error: 'Missing bounding box parameters' });
  }

  // Enhanced Overpass QL query to fetch more detailed information
  const query = `
    [out:json];
    (
      node["sport"="climbing"](${south},${west},${north},${east});
      way["sport"="climbing"](${south},${west},${north},${east});
      relation["sport"="climbing"](${south},${west},${north},${east});
    );
    out body center;
    >;
    out body qt;
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

    const spots: OSMSpot[] = await Promise.all(data.elements.map(async (el: RawOSMElement) => {
      const tags = el.tags || {};
      const spotType = normalizeSpotType(tags);
      
      if (!spotType) return null;

      const imageResult = await getSpotImage(tags, spotType);
      console.log(`Image for ${tags.name || 'unnamed spot'} from ${imageResult.source}`);
      
      return {
        id: el.id,
        lat: el.lat ?? el.center?.lat ?? 0,
        lon: el.lon ?? el.center?.lon ?? 0,
        tags: {
          name: tags.name,
          description: tags.description,
          type: spotType,
          climbing_type: normalizeClimbingType(tags),
          grade: tags['climbing:grade:yds_class'] || 
                 tags['climbing:grade:uiaa'] ||
                 tags['climbing:grade:french'] ||
                 tags.grade,
          rock_type: tags['climbing:rock']?.toLowerCase(),
          height: tags.height || tags['climbing:length'],
          orientation: tags['climbing:orientation'],
          access: tags.access,
          url: getUrl(tags),
          image_url: imageResult.url,
          image_source: imageResult.source,
          rating: parseFloat(tags.stars || "0"),
          number_of_routes: getNumberOfRoutes(tags),
          protection: normalizeProtection(tags),
          is_indoor: tags.leisure === 'sports_centre' || tags.building === 'yes'
        },
        difficulty_level: 0,
        distance: 0
      };
    }));

    res.status(200).json({ 
      spots,
      total: spots.length
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch climbing spots from OSM' });
  }
}
