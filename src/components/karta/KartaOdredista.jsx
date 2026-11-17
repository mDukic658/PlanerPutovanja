import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { ikonaPosjeta } from "../../utils/kartaIkone"
import "leaflet/dist/leaflet.css"

export default function KartaOdredista({
    lat,
    lng,
    naziv
}) {
    const ispravneKoordinate =
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        Math.abs(lat) <= 90 &&
        Math.abs(lng) <= 180

    if (!ispravneKoordinate) {
        return <p>Lokacija odredišta nije dostupna.</p>
    }

    return (
        <MapContainer
            key={`${lat},${lng}`}
            center={[lat, lng]}
            zoom={12}
            scrollWheelZoom={false}
            style={{
                height: 350,
                width: "100%",
                borderRadius: 12
            }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker
                position={[lat, lng]}
                icon={ikonaPosjeta}
                title={naziv}
            >
                <Popup>
                    <strong>{naziv}</strong>
                </Popup>
            </Marker>
        </MapContainer>
    )
}