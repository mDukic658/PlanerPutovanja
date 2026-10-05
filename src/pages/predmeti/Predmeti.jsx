import { useEffect, useState } from "react"
import { Button, Form, Table } from "react-bootstrap"
import PredmetiService from "../../services/predmeti/PredmetiService"

export default function Predmeti() {

    const [predmeti, setPredmeti] = useState([])

    useEffect(() => {
        ucitajPredmete()
    }, [])

    async function ucitajPredmete() {
        await PredmetiService.get().then((odgovor) => {
            setPredmeti(odgovor.data)
        })
    }

    async function obradiSubmit(e) {
        e.preventDefault()

        const podaci = new FormData(e.target)

        await PredmetiService.dodaj({
            naziv: podaci.get('naziv')
        })

        e.target.reset()
        ucitajPredmete()
    }

    return (
        <>
            <h3>Predmeti</h3>

            <Table hover striped bordered>
                <thead>
                    <tr>
                        <th>Šifra</th>
                        <th>Naziv</th>
                    </tr>
                </thead>

                <tbody>
                    {predmeti.map((predmet) => (
                        <tr key={predmet.sifra}>
                            <td>{predmet.sifra}</td>
                            <td>{predmet.naziv}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <h4>Dodaj predmet</h4>

            <Form onSubmit={obradiSubmit}>
                <Form.Group controlId="naziv">
                    <Form.Label>Naziv predmeta</Form.Label>

                    <Form.Control
                        type="text"
                        name="naziv"
                        required
                    />
                </Form.Group>

                <Button
                    type="submit"
                    variant="success"
                    className="mt-2"
                >
                    Dodaj
                </Button>
            </Form>
        </>
    )
}