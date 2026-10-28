import { Button, Form } from "react-bootstrap"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import PredmetiService from "../../services/predmeti/PredmetiService"
import { RouteNames } from "../../constants"
import { FaArrowLeft, FaPen, FaSave, FaTimes } from "react-icons/fa"

export default function PredmetPromjena() {

    const navigate = useNavigate()
    const params = useParams()

    const [predmet, setPredmet] = useState(null)

    useEffect(() => {
        ucitajPredmet()
    }, [])

    async function ucitajPredmet() {
        await PredmetiService.getBySifra(
            parseInt(params.sifra)
        ).then((odgovor) => {
            setPredmet(odgovor.data)
        })
    }

    async function obradiSubmit(e) {
        e.preventDefault()

        const podaci = new FormData(e.target)

        await PredmetiService.promijeni(
            parseInt(params.sifra),
            {
                naziv: podaci.get('naziv')
            }
        )

        navigate(RouteNames.PREDMETI)
    }

    if (predmet == null) {
        return <p>Učitavanje...</p>
    }

    return (
        <section className="promjena-predmeta">

            <Link
                to={RouteNames.PREDMETI}
                className="natrag-na-pregled"
            >
                <FaArrowLeft />
                Natrag na pregled predmeta
            </Link>

            <h2 className="promjena-predmeta-naslov">
                <FaPen />
                Promjena predmeta
            </h2>

            <Form
                onSubmit={obradiSubmit}
                className="promjena-predmeta-obrazac"
            >
                <Form.Group controlId="naziv">
                    <Form.Label>Naziv predmeta</Form.Label>

                    <Form.Control
                        type="text"
                        name="naziv"
                        defaultValue={predmet.naziv}
                        required
                    />
                </Form.Group>

                <div className="promjena-predmeta-akcije">
                    <Button
                        type="button"
                        variant="outline-secondary"
                        onClick={() => {
                            navigate(RouteNames.PREDMETI)
                        }}
                    >
                        <FaTimes />
                        Odustani
                    </Button>

                    <Button type="submit" variant="primary">
                        <FaSave />
                        Spremi promjene
                    </Button>
                </div>
            </Form>

        </section>
    )
}