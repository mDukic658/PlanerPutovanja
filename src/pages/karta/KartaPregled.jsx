import { useEffect, useState } from "react"
import KartaServis from "../../services/karta/KartaServis"
import KartaPosjeta from "../../components/karta/KartaPosjeta"
import { Link } from "react-router-dom"
import { FaPlus } from "react-icons/fa"
import { RouteNames } from "../../constants"
import PopisPosjeta from "../../components/karta/PopisPosjeta"
import { useObavijesti } from "../../components/Obavijesti"

export default function KartaPregled() {
    const [posjeti, setPosjeti] = useState([])
    const [ucitavanje, setUcitavanje] = useState(true)
    const [greska, setGreska] = useState("")
    const [brisanjeSifra, setBrisanjeSifra] = useState(null)

    const obavijesti = useObavijesti()

    useEffect(() => {
        let aktivno = true

        async function ucitajPosjete() {
            try {
                const odgovor = await KartaServis.get()

                if (aktivno) {
                    setPosjeti(odgovor.data)
                }
            } catch (error) {
                console.error(error)

                if (aktivno) {
                    setGreska("Učitavanje posjeta nije uspjelo.")
                }
            } finally {
                if (aktivno) {
                    setUcitavanje(false)
                }
            }
        }

        ucitajPosjete()

        return () => {
            aktivno = false
        }
    }, [])

    const brojDrzava = new Set(
        posjeti.map(posjet => posjet.iso2)
    ).size

    async function obrisiPosjet(posjet) {
        if (brisanjeSifra !== null) {
            return
        }

        if (!confirm(
            `Obrisati posjet mjestu „${posjet.grad}, ${posjet.drzava}”?`
        )) {
            return
        }

        setBrisanjeSifra(posjet.sifra)

        try {
            await KartaServis.obrisi(posjet.sifra)

            setPosjeti(prethodni =>
                prethodni.filter(
                    stavka => stavka.sifra !== posjet.sifra
                )
            )

            obavijesti("Posjet je obrisan.")
        } catch (error) {
            console.error(error)
            obavijesti("Brisanje posjeta nije uspjelo.", "danger")
        } finally {
            setBrisanjeSifra(null)
        }
    }

    return (
        <section className="karta-pregled">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <h2 className="mb-0">Karta posjeta</h2>

                <Link
                    to={RouteNames.KARTA_POSJETA_NOVO}
                    className="btn btn-primary"
                >
                    <FaPlus />
                    {" "}Dodaj posjet
                </Link>
            </div>

            {ucitavanje ? (
                <p>Učitavanje...</p>
            ) : greska ? (
                <p role="alert">{greska}</p>
            ) : (
                <>
                    <p>
                        Broj posjeta: <strong>{posjeti.length}</strong>
                        {" · "}
                        Broj država: <strong>{brojDrzava}</strong>
                    </p>

                    <KartaPosjeta posjeti={posjeti} />
                    <PopisPosjeta
                        posjeti={posjeti}
                        onObrisi={obrisiPosjet}
                        brisanjeSifra={brisanjeSifra}
                    />
                </>
            )}
        </section>
    )
}