import { Button, Form } from "react-bootstrap"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import PredmetiService from "../../services/predmeti/PredmetiService"
import { RouteNames } from "../../constants"

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
        <>
            <h3>Promjena predmeta</h3>

            <Form onSubmit={obradiSubmit}>

                <Form.Group controlId="naziv">
                    <Form.Label>Naziv predmeta</Form.Label>

                    <Form.Control
                        type="text"
                        name="naziv"
                        defaultValue={predmet.naziv}
                        required
                    />
                </Form.Group>

                <Button
                    type="submit"
                    variant="success"
                    className="mt-2"
                >
                    Spremi promjene
                </Button>

                <Button
                    type="button"
                    variant="danger"
                    className="mt-2 ms-2"
                    onClick={() => {
                        navigate(RouteNames.PREDMETI)
                    }}
                >
                    Odustani
                </Button>

            </Form>
        </>
    )
}