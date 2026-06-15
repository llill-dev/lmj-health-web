export type GeocodeResult = {
  lat: number;
  lng: number;
  displayName: string;
};

/**
 * Photon (Komoot) geocoder — browser-friendly CORS for address search.
 */
export async function geocodeAddress(query: string): Promise<GeocodeResult | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const url = new URL('https://photon.komoot.io/api/');
  url.searchParams.set('q', trimmed);
  url.searchParams.set('limit', '1');
  url.searchParams.set('lang', 'ar');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('geocode_failed');
  }

  const data = (await response.json()) as {
    features?: Array<{
      geometry?: { coordinates?: [number, number] };
      properties?: {
        name?: string;
        city?: string;
        state?: string;
        country?: string;
      };
    }>;
  };

  const feature = data.features?.[0];
  const coords = feature?.geometry?.coordinates;
  if (!coords || coords.length < 2) return null;

  const [lng, lat] = coords;
  const parts = [
    feature.properties?.name,
    feature.properties?.city,
    feature.properties?.state,
    feature.properties?.country,
  ].filter(Boolean);

  return {
    lat,
    lng,
    displayName: parts.join(' — ') || trimmed,
  };
}
