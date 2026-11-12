import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import OperaterService from "../../services/operateri/OperaterService"
import { Form, Button, Row, Col, Container, Card, Alert } from "react-bootstrap"
import { RouteNames } from "../../constants"
import { ShemaPromjenaLozinke } from "../../schemas/ShemaOperater"

export default function OperaterPromjenaLozinke() {

    const navigate = useNavigate()
    const params = useParams()
    const [operater, setOperater] = useState({})
    const [errors, setErrors] = useState({})

    useEffect(() => {
        ucitajOperatera()
    }, [])

    async function ucitajOperatera() {
        const odgovor = await OperaterService.getBySifra(params.sifra)
        if (!odgovor.success) {
            alert('Operater nije pronađen')
            navigate(RouteNames.OPERATERI)
            return
        }
        setOperater(odgovor.data)
    }

    async function promjeniLozinku(novaLozinka) {
        const rezultat = await OperaterService.promjeniLozinku(params.sifra, novaLozinka)
        if (rezultat.success) {
            alert('Lozinka uspješno promijenjena!')
            navigate(RouteNames.OPERATERI)
        } else {
            alert(rezultat.message || 'Greška pri promjeni lozinke')
        }
    }

    function odradiSubmit(e) {
        e.preventDefault()
        const podaci = new FormData(e.target)

        setErrors({})
        const objektPodataka = Object.fromEntries(podaci)

        // Provjera pomoću Zod sheme
        const rezultat = ShemaPromjenaLozinke.safeParse(objektPodataka)

        if (!rezultat.success) {
            const noveGreske = {}

            rezultat.error.issues.forEach((issue) => {
                const kljuc = issue.path[0]
                if (!noveGreske[kljuc]) {
                    noveGreske[kljuc] = issue.message
                }
            })

            setErrors(noveGreske)
            return
        }

        promjeniLozinku(podaci.get('novaLozinka'))
    }

    const ocistiGresku = (nazivPolja) => {
        if (errors[nazivPolja]) {
            const noveGreske = { ...errors }
            delete noveGreske[nazivPolja]
            setErrors(noveGreske)
        }
    }

    return (
        <>
            <h3>Promjena lozinke</h3>
            <Form onSubmit={odradiSubmit}>
                <Container className="mt-4">
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Card.Title className="mb-4">
                                Promjena lozinke za: <strong>{operater.email}</strong>
                            </Card.Title>

                            <Alert variant="info">
                                <strong>Zahtjevi za lozinku:</strong>
                                <ul className="mb-0 mt-2">
                                    <li>Najmanje 8 znakova</li>
                                    <li>Barem jedno veliko slovo (A-Z)</li>
                                    <li>Barem jedno malo slovo (a-z)</li>
                                    <li>Barem jedan broj (0-9)</li>
                                    <li>Barem jedan interpukcijski znak (!@#$%^&*...)</li>
                                </ul>
                            </Alert>

                            <Row>
                                <Col xs={12}>
                                    <Form.Group controlId="novaLozinka" className="mb-3">
                                        <Form.Label className="fw-bold">Nova lozinka</Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="novaLozinka"
                                            placeholder="Unesite novu lozinku"
                                            isInvalid={!!errors.novaLozinka}
                                            onFocus={() => ocistiGresku('novaLozinka')}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.novaLozinka}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col xs={12}>
                                    <Form.Group controlId="potvrdaLozinke" className="mb-3">
                                        <Form.Label className="fw-bold">Potvrda lozinke</Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="potvrdaLozinke"
                                            placeholder="Ponovite novu lozinku"
                                            isInvalid={!!errors.potvrdaLozinke}
                                            onFocus={() => ocistiGresku('potvrdaLozinke')}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.potvrdaLozinke}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <hr />

                            <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                                <Link to={RouteNames.OPERATERI} className="btn btn-danger px-4">
                                    Odustani
                                </Link>
                                <Button type="submit" variant="success">
                                    Promjeni lozinku
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Container>
            </Form>
        </>
    )
}
