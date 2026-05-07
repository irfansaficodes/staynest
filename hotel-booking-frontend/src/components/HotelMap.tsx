import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface HotelMapProps {
  latitude: number;
  longitude: number;
  name: string;
  address?: string;
}

const HotelMap = ({ latitude, longitude, name, address }: HotelMapProps) => {
  return (
    <div className="border rounded-xl overflow-hidden">
      <MapContainer
        center={[latitude, longitude]}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: "300px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]} icon={markerIcon}>
          <Popup>
            <div className="text-sm">
              <strong>{name}</strong>
              {address && <p className="text-gray-600 mt-1">{address}</p>}
            </div>
          </Popup>
        </Marker>
        <Circle
          center={[latitude, longitude]}
          radius={500}
          pathOptions={{ color: "#0d9488", fillColor: "#0d9488", fillOpacity: 0.1 }}
        />
      </MapContainer>
    </div>
  );
};

export default HotelMap;
