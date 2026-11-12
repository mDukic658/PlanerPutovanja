import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaArrowLeft } from "react-icons/fa"
import { RouteNames } from "../../constants"
import KartaServis from "../../services/karta/KartaServis"
import PosjetObrazac from "../../components/karta/PosjetObrazac"
import { useObavijesti } from "../../components/Obavijesti"

export default function KartaNovo() {

    const [spremanje, setSpremanje] = useState(false)

    const navigate = useNavigate()
    const obavijesti = useObavijesti()

    function povratakNaPregled() {
        navigate(RouteNames.KARTA_POSJETA)
    }

    async function spremiPosjet(podaci) {
        if (spremanje) {
            return
        }

        setSpremanje(true)

        try {
            await KartaServis.dodaj(podaci)

            obavijesti("Posjet je dodan.")
            povratakNaPregled()
        } catch (error) {
            console.error(error)
            obavijesti("Dodavanje posjeta nije uspjelo.", "danger")
        } finally {
            setSpremanje(false)
        }
    }

    return (
        <section className="karta-novo">
            <Link
                to={RouteNames.KARTA_POSJETA}
                className="natrag-na-pregled"
            >
                <FaArrowLeft />
                {" "}Natrag na kartu posjeta
            </Link>

            <h2 className="my-4">Dodavanje posjeta</h2>

            <PosjetObrazac
                onSpremi={spremiPosjet}
                onOdustani={povratakNaPregled}
                spremanje={spremanje}
            />
        </section>
    )

}