import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { ikonaPosjeta } from "../../utils/kartaIkone"
import FormatDatuma from "../FormatDatuma"
import "leaflet/dist/leaflet.css"

function PrilagodiPrikaz({ posjeti }) {
    const karta = useMap()

    useEffect(() => {
        if (posjeti.length === 0) {
            karta.setView([48, 15], 4)
            return
        }

        karta.fitBounds(
            posjeti.map(posjet => [posjet.lat, posjet.lng]),
            {
                padding: [40, 40],
                maxZoom: 12
            }
        )
    }, [karta, posjeti])

    return null
}

export default function KartaPosjeta({ posjeti = [] }) {
    const posjetiSKoordinatama = posjeti.filter(
        posjet =>
            Number.isFinite(posjet.lat) &&
            Number.isFinite(posjet.lng) &&
            posjet.lat >= -90 &&
            posjet.lat <= 90 &&
            posjet.lng >= -180 &&
            posjet.lng <= 180
    )

    return (
        <MapContainer
            center={[48, 15]}
            zoom={4}
            scrollWheelZoom={false}
            style={{
                height: 500,
                width: "100%",
                borderRadius: 12
            }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <PrilagodiPrikaz posjeti={posjetiSKoordinatama} />

            {posjetiSKoordinatama.map(posjet => (
                <Marker
                    key={posjet.sifra}
                    position={[posjet.lat, posjet.lng]}
                    icon={ikonaPosjeta}
                    title={`${posjet.grad}, ${posjet.drzava}`}
                >
                    <Popup>
                        <strong>
                            {posjet.grad}, {posjet.drzava}
                        </strong>

                        <div className="mt-2">
                            <FormatDatuma datum={posjet.datumPosjeta} />
                        </div>

                        {posjet.napomena && (
                            <p
                                className="mb-0 mt-2"
                                style={{
                                    whiteSpace: "pre-wrap",
                                    overflowWrap: "anywhere"
                                }}
                            >
                                {posjet.napomena}
                            </p>
                        )}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    )
}