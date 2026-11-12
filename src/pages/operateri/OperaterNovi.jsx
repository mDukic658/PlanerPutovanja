import { Form, Button, Row, Col, Container, Card } from "react-bootstrap"
import { RouteNames } from "../../constants"
import { Link, useNavigate } from "react-router-dom"
import OperaterService from "../../services/operateri/OperaterService"
import { ShemaOperater } from "../../schemas/ShemaOperater"
import { useState } from "react"

export default function OperaterNovi() {

    const navigate = useNavigate()
    const [errors, setErrors] = useState({})

    async function dodaj(operater) {
        const rezultat = await OperaterService.dodaj(operater)
        if (rezultat.success) {
            navigate(RouteNames.OPERATERI)
        } else {
            alert(rezultat.message || 'Greška pri dodavanju operatera')
        }
    }

    function odradiSubmit(e) {
        e.preventDefault()
        const podaci = new FormData(e.target)

        setErrors({})
        const objektPodataka = Object.fromEntries(podaci)

        // Provjera pomoću Zod sheme
        const rezultat = ShemaOperater.safeParse(objektPodataka)

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

        dodaj({
            email: podaci.get('email'),
            lozinka: podaci.get('lozinka'),
            uloga: podaci.get('uloga')
        })
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
            <h3>Unos novog operatera</h3>
            <Form onSubmit={odradiSubmit}>
                <Container className="mt-4">
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Card.Title className="mb-4">Podaci o operateru</Card.Title>

                            <Row>
                                <Col xs={12}>
                                    <Form.Group controlId="email" className="mb-3">
                                        <Form.Label className="fw-bold">Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            placeholder="operater@edunova.hr"
                                            isInvalid={!!errors.email}
                                            onFocus={() => ocistiGresku('email')}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.email}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col xs={12}>
                                    <Form.Group controlId="lozinka" className="mb-3">
                                        <Form.Label className="fw-bold">Lozinka</Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="lozinka"
                                            placeholder="Min 8 znakova, velika/mala slova, broj i znak"
                                            isInvalid={!!errors.lozinka}
                                            onFocus={() => ocistiGresku('lozinka')}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.lozinka}
                                        </Form.Control.Feedback>
                                        <Form.Text className="text-muted">
                                            Lozinka mora sadržavati: najmanje 8 znakova, veliko slovo, malo slovo, broj i interpukcijski znak (!@#$%^&*...)
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col xs={12}>
                                    <Form.Group controlId="uloga" className="mb-3">
                                        <Form.Label className="fw-bold">Uloga</Form.Label>
                                        <Form.Select
                                            name="uloga"
                                            isInvalid={!!errors.uloga}
                                            onFocus={() => ocistiGresku('uloga')}
                                        >
                                            <option value="">Odaberite ulogu...</option>
                                            <option value="admin">Admin</option>
                                            <option value="korisnik">Korisnik</option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.uloga}
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
                                    Dodaj novog operatera
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Container>
            </Form>
        </>
    )
}
