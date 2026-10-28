import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom"
import { Button, Row, Form, Col } from "react-bootstrap";
import ItinerarService from "../../services/itinerar/ItinerarService"
import { RouteNames } from "../../constants"
import { FaArrowLeft, FaPen, FaSave, FaTimes } from "react-icons/fa";

export default function ItinerarPromjena() {

    const navigate = useNavigate()
    const { sifra } = useParams()
    const [searchParams] = useSearchParams()

    const putovanjeSifra = searchParams.get('putovanjeSifra')

    const [stavka, setStavka] = useState({
        putovanjeSifra: "",
        dan: 1,
        vrijeme: "",
        naziv: "",
        biljeska: ""
    })

    useEffect(() => {
        ucitajStavku()
    }, [sifra])

    async function ucitajStavku() {
        const odgovor = await ItinerarService.getBySifra(sifra)

        if (odgovor.data) {
            setStavka(odgovor.data)
        }
    }

    function promijeniVrijednost(e) {
        const { name, value } = e.target

        setStavka(stara => ({
            ...stara,
            [name]: value
        }))
    }

    async function spremi(e) {
        e.preventDefault()

        const promijenjenaStavka = {
            ...stavka,
            putovanjeSifra: parseInt(stavka.putovanjeSifra, 10),
            dan: parseInt(stavka.dan, 10)
        }

        await ItinerarService.promijeni(sifra, promijenjenaStavka)


        navigate(
            putovanjeSifra
                ? `${RouteNames.ITINERAR}?putovanjeSifra=${putovanjeSifra}`
                : RouteNames.ITINERAR
        )

    }

    return (
        <section className="promjena-itinerara">

            <Link
                to={
                    putovanjeSifra
                        ? `${RouteNames.ITINERAR}?putovanjeSifra=${putovanjeSifra}`
                        : RouteNames.ITINERAR
                }
                className="natrag-na-pregled"
            >
                <FaArrowLeft />
                Natrag na pregled itinerara
            </Link>

            <h2 className="promjena-itinerara-naslov">
                <FaPen />
                Promjena stavke itinerara
            </h2>

            <Form onSubmit={spremi} className="itinerar-obrazac">
                <Row className="g-3">

                    <Col xs={12} md={6}>
                        <Form.Group controlId="dan">
                            <Form.Label>Dan</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                name="dan"
                                value={stavka.dan}
                                onChange={promijeniVrijednost}
                                required
                            />
                        </Form.Group>
                    </Col>

                    <Col xs={12} md={6}>
                        <Form.Group controlId="vrijeme">
                            <Form.Label>Vrijeme</Form.Label>
                            <Form.Control
                                type="time"
                                name="vrijeme"
                                value={stavka.vrijeme || ""}
                                onChange={promijeniVrijednost}
                                required
                            />
                        </Form.Group>
                    </Col>

                    <Col xs={12}>
                        <Form.Group controlId="naziv">
                            <Form.Label>Naziv</Form.Label>
                            <Form.Control
                                type="text"
                                name="naziv"
                                value={stavka.naziv}
                                onChange={promijeniVrijednost}
                                required
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
                                value={stavka.biljeska || ""}
                                onChange={promijeniVrijednost}
                            />
                        </Form.Group>
                    </Col>

                </Row>

                <div className="itinerar-obrazac-akcije">
                    <Link
                        to={
                            putovanjeSifra
                                ? `${RouteNames.ITINERAR}?putovanjeSifra=${putovanjeSifra}`
                                : RouteNames.ITINERAR
                        }
                        className="btn btn-outline-secondary"
                    >
                        <FaTimes />
                        Odustani
                    </Link>

                    <Button type="submit" variant="primary">
                        <FaSave />
                        Spremi promjene
                    </Button>
                </div>
            </Form>

        </section>
    )
}