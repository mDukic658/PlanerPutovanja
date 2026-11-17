import { useState } from "react"
import { Button } from "react-bootstrap"
import DrzaveService from "../../services/drzave/DrzaveService"
import GeokodiranjeServis from "../../services/karta/GeokodiranjeServis"
import KartaOdredista from "./KartaOdredista"

export default function OdredistePutovanja({
    destinacija,
    drzava
}) {
    const [rezultati, setRezultati] = useState([])
    const [lokacija, setLokacija] = useState(null)
    const [ucitavanje, setUcitavanje] = useState(false)
    const [greska, setGreska] = useState("")

    async function pronadiOdrediste() {
        if (ucitavanje) return

        setUcitavanje(true)
        setGreska("")
        setRezultati([])
        setLokacija(null)

        try {
            const odgovor = await DrzaveService.get()

            if (odgovor.success === false) {
                throw new Error(
                    odgovor.message || "Dohvat država nije uspio."
                )
            }

            const odabranaDrzava = odgovor.data.find(
                stavka =>
                    String(stavka.naziv).trim().toLowerCase() ===
                    String(drzava).trim().toLowerCase()
            )

            if (!odabranaDrzava?.kod) {
                throw new Error(
                    "Država putovanja nema dostupnu oznaku. Provjeri podatke države."
                )
            }

            const pronadeneLokacije =
                await GeokodiranjeServis.pretraziMjesto(
                    String(destinacija || ""),
                    odabranaDrzava.kod
                )

            if (pronadeneLokacije.length === 0) {
                throw new Error(
                    "Odredište nije pronađeno. Provjeri destinaciju i državu putovanja."
                )
            }

            if (pronadeneLokacije.length === 1) {
                setLokacija(pronadeneLokacije[0])
            } else {
                setRezultati(pronadeneLokacije)
            }
        } catch (error) {
            setGreska(error.message)
        } finally {
            setUcitavanje(false)
        }
    }

    return (
        <section
            className="mb-5"
            aria-labelledby="detalji-odrediste"
        >
            <h3 id="detalji-odrediste" className="h4">
                Karta odredišta
            </h3>

            <p>
                {destinacija}, {drzava}
            </p>

            <Button
                type="button"
                onClick={pronadiOdrediste}
                disabled={ucitavanje}
                className="mb-3"
            >
                {ucitavanje
                    ? "Traženje odredišta..."
                    : lokacija
                        ? "Ponovno pronađi odredište"
                        : "Pronađi odredište"}
            </Button>

            {greska && (
                <p className="text-danger" role="alert">
                    {greska}
                </p>
            )}

            {rezultati.length > 0 && (
                <div className="mb-3">
                    <p>Odaberi odgovarajuću lokaciju:</p>

                    <ul className="list-unstyled">
                        {rezultati.map(rezultat => (
                            <li key={rezultat.id} className="mb-2">
                                <Button
                                    type="button"
                                    variant="outline-primary"
                                    className="text-start"
                                    onClick={() => {
                                        setLokacija(rezultat)
                                        setRezultati([])
                                    }}
                                >
                                    {rezultat.naziv}
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {lokacija && (
                <KartaOdredista
                    lat={lokacija.lat}
                    lng={lokacija.lng}
                    naziv={`${destinacija}, ${drzava}`}
                />
            )}
        </section>
    )
}