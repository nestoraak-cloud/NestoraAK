import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import { formatINR } from '../lib/currency';

const icon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Default center: New Delhi
export default function MapView({ properties, center = [28.6139, 77.209], zoom = 11, height = '500px' }) {
  return (
    <div style={{ height }} className="rounded-xl overflow-hidden border border-[#261f17]/10">
      <MapContainer center={center} zoom={zoom} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {properties
          .filter((p) => p.lat && p.lng)
          .map((p) => (
            <Marker key={p.id} position={[p.lat, p.lng]} icon={icon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{formatINR(p.price)}</p>
                  <p>{p.title}</p>
                  <Link to={`/listings/${p.id}`} className="text-[#d97f2e] underline">
                    View details
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
