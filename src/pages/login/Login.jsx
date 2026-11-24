import { useState } from 'react'
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { ShemaLogin } from '../../schemas/ShemaOperater'
import useAuth from '../../hooks/useAuth'
import { RouteNames } from '../../constants'

export default function Login() {
    const [email, setEmail] = useState('')
    const [lozinka, setLozinka] = useState('')
    const [prikaziLozinku, setPrikaziLozinku] = useState(false)
    const [errors, setErrors] = useState({})
    const [prijavaUTijeku, setPrijavaUTijeku] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()

    async function odradiSubmit(e) {
        e.preventDefault()
        if (prijavaUTijeku) return

        setErrors({})

        const rezultat = ShemaLogin.safeParse({
            email: email.trim(),
            lozinka
        })

        if (!rezultat.success) {
            const greske = {}

            rezultat.error.issues.forEach((issue) => {
                const polje = issue.path[0]

                if (!greske[polje]) {
                    greske[polje] = issue.message
                }
            })

            setErrors(greske)
            return
        }

        setPrijavaUTijeku(true)

        try {
            const odgovor = await login(
                rezultat.data.email,
                rezultat.data.lozinka
            )

            if (!odgovor.success) {
                setErrors({ opce: odgovor.message })
                return
            }

            navigate(RouteNames.HOME, { replace: true })
        } finally {
            setPrijavaUTijeku(false)
        }
    }

    return (
        <Row className="justify-content-center my-4">
            <Col xs={12} md={8} lg={5}>
                <Card className="shadow-sm">
                    <Card.Body>
                        <h1 className="h4 mb-4">Prijava</h1>

                        {errors.opce && (
                            <Alert variant="danger">
                                {errors.opce}
                            </Alert>
                        )}

                        <Form onSubmit={odradiSubmit} noValidate>
                            <Form.Group
                                controlId="prijava-email"
                                className="mb-3"
                            >
                                <Form.Label>E-mail</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    autoComplete="username"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    isInvalid={!!errors.email}
                                    disabled={prijavaUTijeku}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.email}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group
                                controlId="prijava-lozinka"
                                className="mb-2"
                            >
                                <Form.Label>Lozinka</Form.Label>
                                <Form.Control
                                    type={prikaziLozinku ? 'text' : 'password'}
                                    name="lozinka"
                                    autoComplete="current-password"
                                    value={lozinka}
                                    onChange={(e) => setLozinka(e.target.value)}
                                    isInvalid={!!errors.lozinka}
                                    disabled={prijavaUTijeku}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.lozinka}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Check
                                type="checkbox"
                                id="prijava-prikazi-lozinku"
                                className="mb-4"
                                label={prikaziLozinku ? 'Sakrij lozinku' : 'Pokaži lozinku'}
                                checked={prikaziLozinku}
                                onChange={(e) => setPrikaziLozinku(e.target.checked)}
                            />

                            <Button
                                type="submit"
                                variant="success"
                                className="w-100"
                                disabled={prijavaUTijeku}
                            >
                                {prijavaUTijeku
                                    ? 'Prijava u tijeku…'
                                    : 'Prijavi se'}
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    )
}
