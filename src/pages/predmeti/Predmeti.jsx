import { useEffect, useState } from "react"
import { Button, Form, Table } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import PredmetiService from "../../services/predmeti/PredmetiService"
import { RouteNames } from "../../constants"
import { FaListUl, FaPlus, FaPen, FaTrash } from "react-icons/fa"

export default function Predmeti() {

    const navigate = useNavigate()

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

    async function obrisi(sifra) {
        await PredmetiService.obrisi(sifra)
        ucitajPredmete()
    }

    return (
        <section className="pregled-predmeta">

            <h2 className="predmeti-naslov">
                <FaListUl />
                Predmeti
            </h2>

            <div className="predmeti-tablica">
                <Table hover responsive className="mb-0">
                    <thead>
                        <tr>
                            <th>Naziv predmeta</th>
                            <th>Akcija</th>
                        </tr>
                    </thead>

                    <tbody>
                        {predmeti.map((predmet) => (
                            <tr key={predmet.sifra}>
                                <td className="predmet-naziv">
                                    {predmet.naziv}
                                </td>

                                <td>
                                    <div className="predmeti-akcije">
                                        <Button
                                            variant="primary"
                                            onClick={() => {
                                                navigate(
                                                    RouteNames.PREDMET_PROMJENA.replace(
                                                        ":sifra",
                                                        String(predmet.sifra)
                                                    )
                                                )
                                            }}
                                        >
                                            <FaPen />
                                            Promijeni
                                        </Button>

                                        <Button
                                            variant="danger"
                                            onClick={() => obrisi(predmet.sifra)}
                                        >
                                            <FaTrash />
                                            Obriši
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {predmeti.length === 0 && (
                            <tr>
                                <td colSpan={2} className="predmeti-prazno">
                                    Trenutno nema dodanih predmeta.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>

            <p className="predmeti-ukupno">
                Ukupno predmeta:
                <span>{predmeti.length}</span>
            </p>

            <Form
                onSubmit={obradiSubmit}
                className="dodavanje-predmeta"
            >
                <h3>
                    <FaPlus />
                    Dodaj predmet
                </h3>

                <Form.Group controlId="naziv">
                    <Form.Label>Naziv predmeta</Form.Label>

                    <Form.Control
                        type="text"
                        name="naziv"
                        placeholder="Npr. Putovnica"
                        required
                    />
                </Form.Group>

                <Button
                    type="submit"
                    variant="primary"
                    className="mt-3"
                >
                    <FaPlus />
                    Dodaj predmet
                </Button>
            </Form>

        </section>
    )
}