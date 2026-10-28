import { useEffect, useState } from "react"
import { Button, Col, Form, Row} from "react-bootstrap"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { RouteNames } from "../../constants"
import PutovanjaService from "../../services/putovanja/PutovanjaService"
import ItinerarService from "../../services/itinerar/ItinerarService"
import { FaArrowLeft, FaPlus, FaTimes } from "react-icons/fa"


export default function ItinerarNovo() {

    const navigate = useNavigate()

    const [searchParams] = useSearchParams()
    const putovanjeSifra = searchParams.get('putovanjeSifra')

    const [putovanja, setPutovanja] = useState([])
    const [stavka, setStavka] = useState({
        putovanjeSifra: putovanjeSifra || '',
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

        const novaStavka = {
            ...stavka,
            putovanjeSifra: parseInt(stavka.putovanjeSifra, 10),
            dan: parseInt(stavka.dan, 10)
        }

        await ItinerarService.dodaj(novaStavka)

        navigate(
            `${RouteNames.ITINERAR}?putovanjeSifra=${novaStavka.putovanjeSifra}`
        )
    }

    return (

        <section className="novi-itinerar">

            <Link
                to={
                    stavka.putovanjeSifra
                        ? `${RouteNames.ITINERAR}?putovanjeSifra=${stavka.putovanjeSifra}`
                        : RouteNames.ITINERAR
                }
                className="natrag-na-pregled"
            >
                <FaArrowLeft />
                Natrag na pregled itinerara
            </Link>

            <h2 className="novi-itinerar-naslov">
                <FaPlus />
                Nova stavka itinerara
            </h2>

            <Form onSubmit={spremi} className="itinerar-obrazac">
                <Row className="g-3">

                    <Col xs={12}>
                        <Form.Group controlId="putovanjeSifra">
                            <Form.Label>Putovanje</Form.Label>
                            <Form.Select
                                name="putovanjeSifra"
                                value={stavka.putovanjeSifra ?? ""}
                                onChange={promijeniVrijednost}
                            >
                                <option value="">Odaberi putovanje</option>

                                {putovanja && putovanja.map((p) => (
                                    <option key={p.sifra} value={p.sifra}>
                                        {p.naziv}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col xs={12} md={6}>
                        <Form.Group controlId="dan">
                            <Form.Label>Dan</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                name="dan"
                                value={stavka.dan}
                                onChange={promijeniVrijednost}
                            />
                        </Form.Group>
                    </Col>

                    <Col xs={12} md={6}>
                        <Form.Group controlId="vrijeme">
                            <Form.Label>Vrijeme</Form.Label>
                            <Form.Control
                                type="time"
                                name="vrijeme"
                                value={stavka.vrijeme}
                                onChange={promijeniVrijednost}
                                onClick={(e) => e.currentTarget.showPicker()}
                            />
                        </Form.Group>
                    </Col>

                    <Col xs={12}>
                        <Form.Group controlId="naziv">
                            <Form.Label>Naziv</Form.Label>
                            <Form.Control
                                type="text"
                                name="naziv"
                                placeholder="Npr. Razgledavanje grada"
                                value={stavka.naziv}
                                onChange={promijeniVrijednost}
                            />
                        </Form.Group>
                    </Col>

                    <Col xs={12}>
                        <Form.Group controlId="biljeska">
                            <Form.Label>Bilješka</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="biljeska"
                                placeholder="Dodatne informacije o aktivnosti..."
                                value={stavka.biljeska}
                                onChange={promijeniVrijednost}
                            />
                        </Form.Group>
                    </Col>

                </Row>

                <div className="itinerar-obrazac-akcije">
                    <Link
                        to={
                            stavka.putovanjeSifra
                                ? `${RouteNames.ITINERAR}?putovanjeSifra=${stavka.putovanjeSifra}`
                                : RouteNames.ITINERAR
                        }
                        className="btn btn-outline-secondary"
                    >
                        <FaTimes />
                        Odustani
                    </Link>

                    <Button type="submit" variant="primary">
                        <FaPlus />
                        Dodaj aktivnost
                    </Button>
                </div>
            </Form>

        </section>

    )


}