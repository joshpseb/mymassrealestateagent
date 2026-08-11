import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { Property } from '../types';
import { resolveAssetUrl } from '../services/api';

// Roughly frames the whole Commonwealth on first paint
const MASSACHUSETTS_CENTER: [number, number] = [42.2, -71.7];
const MASSACHUSETTS_ZOOM = 8;

const compactPrice = (price: number) =>
  price >= 1_000_000
    ? `$${(price / 1_000_000).toFixed(price >= 10_000_000 ? 0 : 1)}M`
    : `$${Math.round(price / 1000)}K`;

const fullPrice = (price: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(price);

const createPriceIcon = (property: Property, isActive: boolean) =>
  L.divIcon({
    className: '',
    html: `<span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-bold shadow-md border whitespace-nowrap ${
      isActive
        ? 'bg-brand-primary text-white border-brand-primary'
        : 'bg-white text-slate-900 border-slate-300'
    }">${compactPrice(property.price)}</span>`,
    iconSize: [56, 24],
    iconAnchor: [28, 24],
    popupAnchor: [0, -24],
  });

const MapMoveWatcher = ({ onMove }: { onMove: (bbox: string) => void }) => {
  useMapEvents({
    moveend: (event) => onMove(event.target.getBounds().toBBoxString()),
    zoomend: (event) => onMove(event.target.getBounds().toBBoxString()),
  });
  return null;
};

const RecenterOnChange = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center[0], center[1], zoom]);
  return null;
};

interface PropertyMapProps {
  properties: Property[];
  activeId?: string | null;
  onActiveChange?: (id: string | null) => void;
  /** When provided, a "Search this area" control filters results by the viewport. */
  onSearchArea?: (bbox: string) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
  recenterOnCenterChange?: boolean;
}

export const PropertyMap = ({
  properties,
  activeId = null,
  onActiveChange,
  onSearchArea,
  center = MASSACHUSETTS_CENTER,
  zoom = MASSACHUSETTS_ZOOM,
  className = 'h-full w-full',
  recenterOnCenterChange = false,
}: PropertyMapProps) => {
  const [pendingBbox, setPendingBbox] = useState<string | null>(null);

  const mappable = useMemo(
    () =>
      properties.filter(
        (property) => typeof property.latitude === 'number' && typeof property.longitude === 'number'
      ),
    [properties]
  );

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        className="h-full w-full rounded-2xl z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {recenterOnCenterChange && <RecenterOnChange center={center} zoom={zoom} />}
        {onSearchArea && <MapMoveWatcher onMove={setPendingBbox} />}

        {mappable.map((property) => (
          <Marker
            key={property._id}
            position={[property.latitude as number, property.longitude as number]}
            icon={createPriceIcon(property, property._id === activeId)}
            eventHandlers={{
              click: () => onActiveChange?.(property._id ?? null),
            }}
          >
            <Popup>
              <div className="w-52">
                <img
                  src={resolveAssetUrl(property.images?.[0] || property.imageUrl)}
                  alt={property.address}
                  className="w-full h-24 object-cover rounded-md mb-2"
                  loading="lazy"
                />
                <p className="font-bold text-slate-900">{fullPrice(property.price)}</p>
                <p className="text-xs text-slate-600 leading-snug">{property.address}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {property.bedrooms} bd · {property.bathrooms} ba · {property.sqft.toLocaleString()} sqft
                </p>
                {property._id && (
                  <Link
                    to={`/property/${property._id}`}
                    className="text-xs font-semibold text-brand-primary hover:underline mt-2 inline-block"
                  >
                    View details →
                  </Link>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {onSearchArea && pendingBbox && (
        <button
          type="button"
          onClick={() => {
            onSearchArea(pendingBbox);
            setPendingBbox(null);
          }}
          className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-white text-slate-900 text-sm font-semibold px-4 py-2 rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Search this area
        </button>
      )}
    </div>
  );
};
