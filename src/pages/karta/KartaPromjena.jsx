import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { FaArrowLeft } from "react-icons/fa"
import { RouteNames } from "../../constants"
import KartaServis from "../../services/karta/KartaServis"
import PosjetObrazac from "../../components/karta/PosjetObrazac"
import { useObavijesti } from "../../components/Obavijesti"

export default function KartaPromjena() {

    const { sifra } = useParams()
    const navigate = useNavigate()
    const obavijesti = useObavijesti()

    const [posjet, setPosjet] = useState(null)
    const [ucitavanje, setUcitavanje] = useState(true)
    const [greska, setGreska] = useState("")
    const [spremanje, setSpremanje] = useState(false)

    useEffect(() => {
        let aktivno = true

        async function ucitajPosjet() {
            setUcitavanje(true)
            setGreska("")
            setPosjet(null)

            try {
                const odgovor = await KartaServis.getBySifra(sifra)

                if (!aktivno) {
                    return
                }

                if (!odgovor.data) {
                    setGreska("Posjet nije pronađen. Možda je obrisan.")
                    return
                }

                setPosjet(odgovor.data)
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

        ucitajPosjet()

        return () => {
            aktivno = false
        }
    }, [sifra])

    function povratakNaPregled() {
        navigate(RouteNames.KARTA_POSJETA)
    }

    async function spremiPromjene(podaci) {
        if (spremanje || !posjet) {
            return
        }

        setSpremanje(true)

        try {
            await KartaServis.promijeni(sifra, podaci)

            obavijesti("Posjet je promijenjen.")
            povratakNaPregled()
        } catch (error) {
            console.error(error)
            obavijesti("Spremanje promjena nije uspjelo.", "danger")
        } finally {
            setSpremanje(false)
        }
    }

    return (
        <section className="karta-promjena">
            <Link
                to={RouteNames.KARTA_POSJETA}
                className="natrag-na-pregled"
            >
                <FaArrowLeft />
                {" "}Natrag na kartu posjeta
            </Link>

            <h2 className="my-4">Uređivanje posjeta</h2>

            {ucitavanje ? (
                <p>Učitavanje...</p>
            ) : greska ? (
                <p role="alert">{greska}</p>
            ) : posjet && (
                <PosjetObrazac
                    key={posjet.sifra}
                    pocetniPodaci={posjet}
                    onSpremi={spremiPromjene}
                    onOdustani={povratakNaPregled}
                    spremanje={spremanje}
                />
            )}
        </section>
    )

}