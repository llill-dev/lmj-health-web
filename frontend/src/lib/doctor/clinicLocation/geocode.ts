export type GeocodeResult = {
  lat: number;
  lng: number;
  displayName: string;
};

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    name?: string;
    city?: string;
    state?: string;
    country?: string;
  };
};

function asPhotonResponse(value: unknown): { features?: PhotonFeature[] } | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record: { features?: unknown } = value;
  const features = Array.isArray(record.features)
    ? record.features.filter(
        (feature): feature is PhotonFeature =>
          !!feature && typeof feature === 'object' && !Array.isArray(feature),
      )
    : undefined;
  return { features };
}

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

  const data = asPhotonResponse(await response.json());
  if (!data) return null;

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
