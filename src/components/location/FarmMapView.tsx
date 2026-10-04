import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation } from '@/lib/location/LocationContext';
import { getFarmCoords, formatDistrictLabel } from '@/lib/location/locationUtils';
import { LocationRelevanceBadge } from '@/components/location/LocationRelevanceBadge';
import type { Farm } from '@/types';
import { Button } from '@/components/ui/button';
import { VerifiedBadge } from '@/components/common/VerifiedBadge';
import { Building2, MapPin, ExternalLink, X } from 'lucide-react';

interface FarmMapViewProps {
  farms: Farm[];
  goatsCountMap?: Record<string, number>;
  className?: string;
}

export const FarmMapView: React.FC<FarmMapViewProps> = ({
  farms,
  goatsCountMap = {},
  className = '',
}) => {
  const { userDistrict, getFarmRelevance } = useLocation();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initial center: Tamil Nadu center (Trichy)
    const initialLat = 10.7905;
    const initialLng = 78.7047;
    const initialZoom = 7;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: initialZoom,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
      markersGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;

    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // Custom SVG Marker Icon function
    const createCustomIcon = (isAmmal = false) => {
      const color = isAmmal ? '#b7791f' : '#166534';
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="28" height="36">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20c0-6.63-5.37-12-12-12z" fill="${color}" stroke="#ffffff" stroke-width="1.5"/>
          <circle cx="12" cy="12" r="5" fill="#ffffff"/>
        </svg>
      `;
      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: svg,
        iconSize: [28, 36],
        iconAnchor: [14, 36],
        popupAnchor: [0, -32],
      });
    };

    // Farm Markers
    const bounds = L.latLngBounds([]);

    farms.forEach((farm) => {
      const coords = getFarmCoords(farm);
      bounds.extend([coords.lat, coords.lng]);

      const marker = L.marker([coords.lat, coords.lng], {
        icon: createCustomIcon(farm.isAmmalOwnFarm),
        title: farm.name,
      });

      marker.on('click', () => {
        setSelectedFarm(farm);
      });

      marker.bindTooltip(`<b>${farm.name}</b><br/>${formatDistrictLabel(farm.locationDistrict)}`, {
        permanent: false,
        direction: 'top',
      });

      markersGroup.addLayer(marker);
    });

    if (farms.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }, [farms, userDistrict]);

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-xs ${className}`}>
      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="h-[420px] sm:h-[500px] w-full z-0" />

      {/* Floating Selected Farm Preview Card */}
      {selectedFarm && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-10 animate-in slide-in-from-bottom-4 duration-200">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl space-y-3">
            <button
              type="button"
              onClick={() => setSelectedFarm(null)}
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 overflow-hidden text-emerald-800 font-bold">
                {selectedFarm.logoUrl ? (
                  <img src={selectedFarm.logoUrl} alt={selectedFarm.name} className="h-full w-full object-cover" />
                ) : selectedFarm.isAmmalOwnFarm ? (
                  <img src="/logo.png" alt={selectedFarm.name} className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-6 w-6 text-emerald-800" />
                )}
              </div>

              <div className="pr-6">
                <VerifiedBadge label="Verified Farm" variant="subtle" className="mb-0.5 text-[10px]" />
                <h4 className="font-bold text-sm text-slate-900 truncate">{selectedFarm.name}</h4>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                  <MapPin className="h-3 w-3 text-emerald-800 shrink-0" />
                  <span>{formatDistrictLabel(selectedFarm.locationDistrict)}</span>
                </div>
              </div>
            </div>

            {/* Relevance & Goats Count */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-600">
              <div>
                <LocationRelevanceBadge relevance={getFarmRelevance(selectedFarm.locationDistrict)} />
              </div>

              <div className="font-semibold text-slate-800">
                {goatsCountMap[selectedFarm.id] !== undefined
                  ? `${goatsCountMap[selectedFarm.id]} goats available`
                  : 'Goats listed'}
              </div>
            </div>

            <Link to={`/farms/${selectedFarm.id}`}>
              <Button variant="default" size="sm" className="w-full text-xs font-bold h-9 mt-1">
                <span>View Farm Profile</span>
                <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
