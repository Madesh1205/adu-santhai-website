/**
 * Adu Santhai — District Location Relevance & Normalization Engine
 * Manages district mapping, normalization, and neighbor relationships across Tamil Nadu.
 */

export type LocationRelevance = 'IN_DISTRICT' | 'NEARBY_DISTRICT' | 'OTHER_LOCATION' | 'UNKNOWN';

/**
 * Standard Tamil Nadu Districts
 */
export const TAMIL_NADU_DISTRICTS = [
  'Ariyalur',
  'Chengalpattu',
  'Chennai',
  'Coimbatore',
  'Cuddalore',
  'Dharmapuri',
  'Dindigul',
  'Erode',
  'Kallakurichi',
  'Kanchipuram',
  'Kanyakumari',
  'Karur',
  'Krishnagiri',
  'Madurai',
  'Mayiladuthurai',
  'Nagapattinam',
  'Namakkal',
  'Nilgiris',
  'Perambalur',
  'Pudukkottai',
  'Ramanathapuram',
  'Ranipet',
  'Salem',
  'Sivaganga',
  'Tenkasi',
  'Thanjavur',
  'Theni',
  'Thiruvallur',
  'Thiruvarur',
  'Tiruchirappalli',
  'Tirunelveli',
  'Tirupattur',
  'Tiruppur',
  'Tiruvannamalai',
  'Tuticorin',
  'Vellore',
  'Viluppuram',
  'Virudhunagar',
].sort();

/**
 * Neighboring District Mapping for Tamil Nadu
 * Maps a district to its geographically adjacent neighboring districts.
 */
export const DISTRICT_NEIGHBORS: Record<string, string[]> = {
  Vellore: ['Ranipet', 'Tirupattur', 'Tiruvannamalai'],
  Ranipet: ['Vellore', 'Kanchipuram', 'Thiruvallur', 'Chengalpattu', 'Tiruvannamalai'],
  Tirupattur: ['Vellore', 'Krishnagiri', 'Dharmapuri', 'Tiruvannamalai'],
  Tiruvannamalai: ['Vellore', 'Ranipet', 'Tirupattur', 'Viluppuram', 'Kallakurichi', 'Dharmapuri'],
  Chennai: ['Thiruvallur', 'Chengalpattu', 'Kanchipuram'],
  Chengalpattu: ['Chennai', 'Thiruvallur', 'Kanchipuram', 'Viluppuram'],
  Kanchipuram: ['Chennai', 'Chengalpattu', 'Thiruvallur', 'Ranipet'],
  Thiruvallur: ['Chennai', 'Chengalpattu', 'Kanchipuram', 'Ranipet'],
  Coimbatore: ['Tiruppur', 'Nilgiris', 'Erode', 'Dindigul', 'Theni'],
  Tiruppur: ['Coimbatore', 'Erode', 'Karur', 'Dindigul'],
  Nilgiris: ['Coimbatore', 'Erode'],
  Erode: ['Coimbatore', 'Tiruppur', 'Nilgiris', 'Salem', 'Karur', 'Namakkal'],
  Salem: ['Namakkal', 'Dharmapuri', 'Erode', 'Kallakurichi', 'Viluppuram', 'Tiruppur'],
  Namakkal: ['Salem', 'Erode', 'Karur', 'Tiruchirappalli'],
  Dharmapuri: ['Salem', 'Krishnagiri', 'Tirupattur', 'Tiruvannamalai'],
  Krishnagiri: ['Dharmapuri', 'Tirupattur'],
  Madurai: ['Virudhunagar', 'Dindigul', 'Sivaganga', 'Theni', 'Ramanathapuram', 'Tiruchirappalli'],
  Dindigul: ['Madurai', 'Karur', 'Tiruppur', 'Theni', 'Tiruchirappalli'],
  Theni: ['Madurai', 'Dindigul', 'Virudhunagar'],
  Virudhunagar: ['Madurai', 'Theni', 'Sivaganga', 'Tenkasi', 'Tirunelveli', 'Tuticorin', 'Ramanathapuram'],
  Sivaganga: ['Madurai', 'Virudhunagar', 'Ramanathapuram', 'Pudukkottai'],
  Ramanathapuram: ['Sivaganga', 'Virudhunagar', 'Tuticorin', 'Pudukkottai'],
  Tirunelveli: ['Tenkasi', 'Virudhunagar', 'Kanyakumari', 'Tuticorin'],
  Tenkasi: ['Tirunelveli', 'Virudhunagar'],
  Kanyakumari: ['Tirunelveli'],
  Tuticorin: ['Tirunelveli', 'Virudhunagar', 'Ramanathapuram'],
  Tiruchirappalli: ['Karur', 'Perambalur', 'Pudukkottai', 'Thanjavur', 'Ariyalur', 'Salem', 'Namakkal', 'Madurai', 'Dindigul'],
  Karur: ['Tiruchirappalli', 'Namakkal', 'Erode', 'Tiruppur', 'Dindigul'],
  Perambalur: ['Tiruchirappalli', 'Ariyalur', 'Cuddalore', 'Kallakurichi'],
  Ariyalur: ['Perambalur', 'Tiruchirappalli', 'Thanjavur', 'Cuddalore'],
  Pudukkottai: ['Tiruchirappalli', 'Thanjavur', 'Sivaganga', 'Ramanathapuram'],
  Thanjavur: ['Tiruchirappalli', 'Thiruvarur', 'Ariyalur', 'Pudukkottai', 'Mayiladuthurai'],
  Thiruvarur: ['Thanjavur', 'Nagapattinam', 'Mayiladuthurai'],
  Nagapattinam: ['Thiruvarur', 'Mayiladuthurai'],
  Mayiladuthurai: ['Thanjavur', 'Thiruvarur', 'Nagapattinam', 'Cuddalore'],
  Cuddalore: ['Viluppuram', 'Kallakurichi', 'Perambalur', 'Ariyalur', 'Mayiladuthurai'],
  Viluppuram: ['Cuddalore', 'Kallakurichi', 'Tiruvannamalai', 'Chengalpattu'],
  Kallakurichi: ['Viluppuram', 'Cuddalore', 'Perambalur', 'Salem', 'Tiruvannamalai'],
};

/**
 * Normalizes any raw district string into a standardized Tamil Nadu district name.
 * Examples:
 * "Vellore, Tamil Nadu" -> "Vellore"
 * "Vellore District" -> "Vellore"
 * "Trichy" -> "Tiruchirappalli"
 */
export function normalizeDistrict(rawDistrict: string | null | undefined): string | null {
  if (!rawDistrict || !rawDistrict.trim()) return null;

  const cleaned = rawDistrict
    .split(',')[0]
    .replace(/District/gi, '')
    .trim();

  if (!cleaned) return null;

  // Handle common aliases
  const lower = cleaned.toLowerCase();
  if (lower === 'trichy' || lower === 'trichirapalli') return 'Tiruchirappalli';
  if (lower === 'tuticorin') return 'Tuticorin';
  if (lower === 'oaty' || lower === 'ooty') return 'Nilgiris';

  // Exact or case-insensitive search
  const matched = TAMIL_NADU_DISTRICTS.find(
    (d) => d.toLowerCase() === lower || lower.includes(d.toLowerCase()) || d.toLowerCase().includes(lower)
  );

  return matched || cleaned;
}

/**
 * Helper to get lat/lng for a farm object, falling back to district center if lat/lng are missing.
 */
export function getFarmCoords(farm: {
  latitude?: number | null;
  longitude?: number | null;
  locationDistrict?: string | null;
  farmLocation?: string | null;
}): { lat: number; lng: number } {
  const DEFAULT_TAMIL_NADU_CENTER = { lat: 10.7905, lng: 78.7047 };

  if (farm.latitude && farm.longitude) {
    return { lat: Number(farm.latitude), lng: Number(farm.longitude) };
  }

  const rawLoc = farm.locationDistrict || farm.farmLocation || 'Vellore';
  const cleanDistrict = rawLoc.split(',')[0].trim();

  const matchedKey = TAMIL_NADU_DISTRICTS.find((d) => {
    const k = d.toLowerCase();
    const c = cleanDistrict.toLowerCase();
    return k === c || c.includes(k) || k.includes(c);
  });

  if (matchedKey) {
    return DEFAULT_TAMIL_NADU_CENTER;
  }

  return DEFAULT_TAMIL_NADU_CENTER;
}

/**
 * Calculates district relevance between user's chosen district and a farm's district.
 */
export function getLocationRelevance(
  userDistrict: string | null | undefined,
  farmDistrict: string | null | undefined
): LocationRelevance {
  if (!userDistrict) return 'UNKNOWN';

  const normUser = normalizeDistrict(userDistrict);
  const normFarm = normalizeDistrict(farmDistrict);

  if (!normFarm) return 'UNKNOWN';
  if (normUser === normFarm) return 'IN_DISTRICT';

  if (normUser && DISTRICT_NEIGHBORS[normUser]) {
    const neighbors = DISTRICT_NEIGHBORS[normUser] || [];
    const isNeighbor = neighbors.some((n: string) => n.toLowerCase() === normFarm.toLowerCase());
    if (isNeighbor) return 'NEARBY_DISTRICT';
  }

  return 'OTHER_LOCATION';
}

/**
 * Format human-readable district label (e.g., "Vellore District")
 */
export function formatDistrictLabel(districtName: string | null | undefined): string {
  const norm = normalizeDistrict(districtName);
  if (!norm) return 'Location not specified';
  if (norm.toLowerCase().endsWith('district')) return norm;
  return `${norm} District`;
}
