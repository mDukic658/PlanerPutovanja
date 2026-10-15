import { Button, Col, Form, Row } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { RouteNames } from '../../constants'
import DrzaveService from '../../services/drzave/DrzaveService'

export default function NovaDrzava() {
    const navigate = useNavigate()

    async function dodaj(drzava) {
        await DrzaveService.dodaj(drzava).then(() => {
            navigate(RouteNames.DRZAVE)
        })
    }

    function obradiSubmit(e) {
        e.preventDefault()

        const podaci = new FormData(e.target)

        dodaj({
            naziv: podaci.get('naziv').trim(),
        })
    }

    return (
        <>
            <h3>Dodavanje nove države</h3>

            <Form onSubmit={obradiSubmit}>
                <Form.Group controlId="naziv">
                    <Form.Label>Naziv države</Form.Label>
                    <Form.Control
                        type="text"
                        name="naziv"
                        required
                    />
                </Form.Group>

                <Row className="mt-4">
                    <Col>
                        <Link
                            to={RouteNames.DRZAVE}
                            className="btn btn-danger"
                        >
                            Odustani
                        </Link>
                    </Col>

                    <Col>
                        <Button type="submit" variant="success">
                            Dodaj
                        </Button>
                    </Col>
                </Row>
            </Form>
        </>
    )
}