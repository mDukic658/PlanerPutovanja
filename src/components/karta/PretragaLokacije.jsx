import { useEffect, useRef, useState } from "react"
import { Button, Form } from "react-bootstrap"
import GeokodiranjeServis from "../../services/karta/GeokodiranjeServis"

export default function PretragaLokacije({
    grad,
    iso2,
    onPromjenaGrada,
    onOdaberi,
    greskaPolja,
    disabled = false
}) {
    const [rezultati, setRezultati] = useState([])
    const [trazenje, setTrazenje] = useState(false)
    const [greska, setGreska] = useState("")
    const [pretrazeno, setPretrazeno] = useState(false)

    const verzijaPretrage = useRef(0)

    useEffect(() => {
        setRezultati([])
        setGreska("")
        setPretrazeno(false)
        setTrazenje(false)

        return () => {
            // Zanemari odgovor za prethodno mjesto ili zatvoren obrazac.
            verzijaPretrage.current += 1
        }
    }, [grad, iso2])

    async function pronadiLokaciju() {
        if (disabled || trazenje) {
            return
        }

        const verzija = ++verzijaPretrage.current

        setTrazenje(true)
        setGreska("")
        setRezultati([])
        setPretrazeno(false)

        try {
            const pronadeni =
                await GeokodiranjeServis.pretraziMjesto(grad, iso2)

            if (verzija !== verzijaPretrage.current) {
                return
            }

            setRezultati(pronadeni)
            setPretrazeno(true)
        } catch (error) {
            if (verzija === verzijaPretrage.current) {
                setGreska(error.message || "Pretraga nije uspjela.")
            }
        } finally {
            if (verzija === verzijaPretrage.current) {
                setTrazenje(false)
            }
        }
    }

    return (
        <div className="mb-3">
            <Form.Group controlId="posjet-grad">
                <Form.Label>Grad ili mjesto</Form.Label>

                <Form.Control
                    type="text"
                    value={grad}
                    onChange={e => onPromjenaGrada(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === "Enter") {
                            e.preventDefault()
                            pronadiLokaciju()
                        }
                    }}
                    maxLength={100}
                    isInvalid={Boolean(greskaPolja)}
                    disabled={disabled}
                    required
                />

                <Form.Control.Feedback type="invalid">
                    {greskaPolja}
                </Form.Control.Feedback>
            </Form.Group>

            <Button
                type="button"
                variant="outline-primary"
                className="mt-2"
                disabled={
                    disabled ||
                    trazenje ||
                    !iso2 ||
                    grad.trim().length < 2
                }
                onClick={pronadiLokaciju}
            >
                {trazenje ? "Traženje..." : "Pronađi na karti"}
            </Button>

            {greska && (
                <p className="text-danger mt-2 mb-0" role="alert">
                    {greska}
                </p>
            )}

            <div aria-live="polite">
                {pretrazeno && rezultati.length === 0 && (
                    <p className="mt-2 mb-0">
                        Nema rezultata. Provjeri naziv ili odaberi
                        lokaciju ručno na karti.
                    </p>
                )}

                {rezultati.length > 0 && (
                    <>
                        <p className="mt-3 mb-2">
                            Odaberi odgovarajuću lokaciju:
                        </p>

                        <ul className="list-unstyled">
                            {rezultati.map(rezultat => (
                                <li key={rezultat.id} className="mb-2">
                                    <Button
                                        type="button"
                                        variant="outline-secondary"
                                        className="w-100 text-start"
                                        disabled={disabled}
                                        onClick={() => {
                                            onOdaberi({
                                                lat: rezultat.lat,
                                                lng: rezultat.lng
                                            })

                                            setRezultati([])
                                            setPretrazeno(false)
                                        }}
                                    >
                                        {rezultat.naziv}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>

            <small className="d-block text-muted mt-2">
                Pretraga: Nominatim · Podaci:{" "}
                <a
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    rel="noreferrer"
                >
                    © OpenStreetMap contributors
                </a>
            </small>
        </div>
    )
}