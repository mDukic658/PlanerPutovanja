import { useEffect, useState } from "react"
import { Button, Card, Form } from "react-bootstrap"
import { Link, useNavigate } from "react-router-dom"
import { RouteNames } from "../../constants"
import PutovanjaService from "../../services/putovanjaPutovanjaService"
import ItinerarService from "../../services/itinerar/ItinerarService"


export default function ItinerarNovo() {

    const navigate = useNavigate()

    const [putovanja, setPutovanja] = useState([])
    const [stavka, setStavka] = useState({
        putovanjeSifra: null,
        dan: 1,
        vrijeme: '',
        naziv: '',
        biljeska: ''
    })

    useEffect(() => {
        ucitajPutovanja()
    }, [])

    async function ucitajPutovanja() {
        await PutovanjaService.get().then((odgovor) => {
            setPutovanja(odgovor.data)
        })
    }

    function promijeniVrijednost(e) {
        const { name, value } = e.target
        setStavka((stara) => ({ ...stara, [name]: value }))
    }

    async function spremi(e) {
        e.preventDefault()
        await ItinerarService.dodaj(stavka)
        navigate(RouteNames.ITINERAR)
    }

    return (
        <>

            <h2 className="my-3">Nova stavka itinerara</h2>

            <Card>
                <Card.Body>
                    <Form onSubmit={spremi}>

                        <Form.Group className="mb-3">
                            <Form.Label>Putovanje</Form.Label>
                            <Form.Select
                                name="putovanjeSifra"
                                value={stavka.putovanjeSifra ?? ''}
                                onChange={promijeniVrijednost}
                            >
                                <option value="">Odaberi putovanje</option>
                                {putovanja && putovanja.map((p) => (
                                    <option key={p.sifra} value={p.sifra}>{p.naziv}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Dan</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                name="dan"
                                value={stavka.dan}
                                onChange={promijeniVrijednost}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Vrijeme</Form.Label>
                            <Form.Control
                                type="time"
                                name="vrijeme"
                                value={stavka.vrijeme}
                                onChange={promijeniVrijednost}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Naziv</Form.Label>
                            <Form.Control
                                type="text"
                                name="naziv"
                                value={stavka.naziv}
                                onChange={promijeniVrijednost}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Bilješka</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="biljeska"
                                value={stavka.biljeska}
                                onChange={promijeniVrijednost}
                            />
                        </Form.Group>

                        <Button type="submit" variant="success">
                            Spremi
                        </Button>

                        <Link
                            to={RouteNames.ITINERAR}
                            className="btn btn-secondary ms-2"
                        >
                            Odustani
                        </Link>

                    </Form>
                </Card.Body>
            </Card>

        </>
    )


}