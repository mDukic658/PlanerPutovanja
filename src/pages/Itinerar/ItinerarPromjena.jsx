import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom"
import { Button, Row, Form, Col } from "react-bootstrap";
import ItinerarService from "../../services/itinerar/ItinerarService"
import { RouteNames } from "../../constants"
import { FaArrowLeft, FaPen, FaSave, FaTimes } from "react-icons/fa";
import { useObavijesti } from "../../components/Obavijesti";
import PutovanjaService from "../../services/putovanja/PutovanjaService";

export default function ItinerarPromjena() {

    const navigate = useNavigate()
    const { sifra } = useParams()
    const [searchParams] = useSearchParams()
    const obavijesti = useObavijesti()

    const putovanjeSifra = searchParams.get('putovanjeSifra')
    const [nazivPutovanja, setNazivPutovanja] = useState("")

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
        try {
            const odgovor = await ItinerarService.getBySifra(sifra)

            if (!odgovor.data) {
                obavijesti("Aktivnost nije pronađena.", "danger")
                return
            }

            setStavka(odgovor.data)

            const odgovorPutovanja = await PutovanjaService.getBySifra(
                odgovor.data.putovanjeSifra
            )

            setNazivPutovanja(
                odgovorPutovanja.data?.naziv || "Putovanje nije pronađeno"
            )
        } catch (error) {
            console.error(error)
            obavijesti("Učitavanje podataka nije uspjelo.", "danger")
        }
    }

    function promijeniVrijednost(e) {
        const { name, value } = e.target

        if (name === "putovanjeSifra") {
            return
        }

        setStavka(stara => ({
            ...stara,
            [name]: value
        }))
    }

    async function spremi(e) {
        e.preventDefault()

        const dan = Number(stavka.dan)

        if (!Number.isInteger(dan) || dan < 1) {
            obavijesti("Dan mora biti pozitivan cijeli broj.", "danger")
            return
        }

        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(stavka.vrijeme)) {
            obavijesti("Odaberi ispravno vrijeme aktivnosti.", "danger")
            return
        }

        if (!stavka.naziv.trim()) {
            obavijesti("Unesi naziv aktivnosti.", "danger")
            return
        }

        let izvornaStavka

        try {
            const odgovor = await ItinerarService.getBySifra(sifra)
            izvornaStavka = odgovor.data
        } catch (error) {
            console.error(error)
            obavijesti("Učitavanje aktivnosti nije uspjelo.", "danger")
            return
        }

        if (!izvornaStavka) {
            obavijesti("Aktivnost nije pronađena.", "danger")
            return
        }

        const promijenjenaStavka = {
            ...stavka,
            putovanjeSifra: izvornaStavka.putovanjeSifra,
            dan,
            naziv: stavka.naziv.trim()
        }

        try {
            await ItinerarService.promijeni(sifra, promijenjenaStavka)
        } catch (error) {
            console.error(error)
            obavijesti("Spremanje promjena nije uspjelo.", "danger")
            return
        }

        obavijesti("Promjene aktivnosti su spremljene.")

        navigate(
            `${RouteNames.ITINERAR}?putovanjeSifra=${izvornaStavka.putovanjeSifra}`
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

                    <Col xs={12}>
                        <Form.Group controlId="putovanjeSifra">
                            <Form.Label>Putovanje</Form.Label>

                            <Form.Control
                                type="text"
                                value={nazivPutovanja}
                                placeholder="Učitavanje..."
                                readOnly
                            />
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