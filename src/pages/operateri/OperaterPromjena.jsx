import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import OperaterService from "../../services/operateri/OperaterService"
import { Form, Button, Row, Col, Container, Card } from "react-bootstrap"
import { RouteNames } from "../../constants"
import { z } from 'zod'

export default function OperaterPromjena() {

    const navigate = useNavigate()
    const params = useParams()
    const [operater, setOperater] = useState({})
    const [errors, setErrors] = useState({})

    // Shema za email i ulogu (bez lozinke)
    const ShemaEmailUloga = z.object({
        email: z.string()
            .trim()
            .min(1, "Email je obavezan!")
            .email("Unesite ispravan email format!"),
        uloga: z.enum(['admin', 'korisnik'], {
            errorMap: () => ({ message: "Uloga mora biti 'admin' ili 'korisnik'!" })
        })
    })

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

    async function promjeni(operater) {
        const rezultat = await OperaterService.promjeni(params.sifra, operater)
        if (rezultat.success) {
            navigate(RouteNames.OPERATERI)
        } else {
            alert(rezultat.message || 'Greška pri promjeni operatera')
        }
    }

    function odradiSubmit(e) {
        e.preventDefault()
        const podaci = new FormData(e.target)

        setErrors({})
        const objektPodataka = Object.fromEntries(podaci)

        // Provjera pomoću Zod sheme
        const rezultat = ShemaEmailUloga.safeParse(objektPodataka)

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

        promjeni({
            email: podaci.get('email'),
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
            <h3>Promjena operatera</h3>
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
                                            defaultValue={operater.email}
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
                                    <Form.Group controlId="uloga" className="mb-3">
                                        <Form.Label className="fw-bold">Uloga</Form.Label>
                                        <Form.Select
                                            onChange={(e) => setOperater({ ...operater, uloga: e.target.value})}
                                            name="uloga"
                                            value={operater.uloga || ''}
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
                                    Promjeni operatera
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Container>
            </Form>
        </>
    )
}
