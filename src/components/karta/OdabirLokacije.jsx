import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { ikonaPosjeta } from "../../utils/kartaIkone"
import "leaflet/dist/leaflet.css"

function KlikNaKartu({ onChange, disabled }) {
    useMapEvents({
        click(e) {
            if (disabled) {
                return
            }

            onChange({
                lat: e.latlng.lat,
                lng: e.latlng.lng
            })
        }
    })

    return null
}

function PratiLokaciju({ lat, lng }) {
    const karta = useMap()

    useEffect(() => {
        if (lat === null || lng === null) {
            return
        }

        karta.panTo([lat, lng])
    }, [karta, lat, lng])

    return null
}

export default function OdabirLokacije({
    value,
    onChange,
    disabled = false
}) {
    const imaLokaciju =
        Number.isFinite(value?.lat) &&
        Number.isFinite(value?.lng) &&
        value.lat >= -90 &&
        value.lat <= 90 &&
        value.lng >= -180 &&
        value.lng <= 180

    const lat = imaLokaciju ? value.lat : null
    const lng = imaLokaciju ? value.lng : null

    return (
        <div>
            <MapContainer
                center={imaLokaciju ? [lat, lng] : [45.5511, 18.6939]}
                zoom={imaLokaciju ? 12 : 5}
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

                <KlikNaKartu
                    onChange={onChange}
                    disabled={disabled}
                />

                <PratiLokaciju lat={lat} lng={lng} />

                {imaLokaciju && (
                    <Marker
                        position={[lat, lng]}
                        icon={ikonaPosjeta}
                        draggable={!disabled}
                        title="Odabrana lokacija"
                        eventHandlers={{
                            dragend(e) {
                                if (disabled) {
                                    return
                                }

                                const lokacija = e.target.getLatLng()

                                onChange({
                                    lat: lokacija.lat,
                                    lng: lokacija.lng
                                })
                            }
                        }}
                    />
                )}
            </MapContainer>

            <p className="form-text mt-2 mb-0">
                {disabled
                    ? "Spremanje lokacije..."
                    : "Klikni na kartu za odabir lokacije. Pin možeš povući za preciznije postavljanje."}
            </p>

            {imaLokaciju && (
                <p className="form-text mb-0">
                    Koordinate: {lat.toFixed(5)}, {lng.toFixed(5)}
                </p>
            )}
        </div>
    )
}