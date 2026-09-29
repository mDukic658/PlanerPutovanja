import { Button, Col, Form, Row } from "react-bootstrap"
import { Link, useNavigate } from "react-router-dom"
import { RouteNames } from "../../constants"
import PutovanjaService from "../../services/putovanja/PutovanjaService"

export default function NovoPutovanje() {

    const navigate = useNavigate()

    async function dodaj(putovanje) {
        await PutovanjaService.dodaj(putovanje).then(() => {
            navigate(RouteNames.PUTOVANJA)
        })
    }

    function obradiSubmit(e) {
        e.preventDefault()
        const podaci = new FormData(e.target)
        dodaj({
            naziv: podaci.get('naziv'),
            destinacija: podaci.get('destinacija'),
            drzava: podaci.get('drzava'),
            datumPolaska: new Date(podaci.get('datumPolaska')).toISOString(),
            datumPovratka: new Date(podaci.get('datumPovratka')).toISOString(),
            budzet: parseFloat(podaci.get('budzet'))
        })
    }

    return (
        <>
            <h3>Dodavanje novog putovanja</h3>

            <Form onSubmit={obradiSubmit}>

                <Form.Group controlId="naziv">
                    <Form.Label> Naziv </Form.Label>
                    <Form.Control type="text" name="naziv" required />
                </Form.Group>

                <Form.Group controlId="destinacija">
                    <Form.Label> Destinacija </Form.Label>
                    <Form.Control type="text" name="destinacija" />
                </Form.Group>

                <Form.Group controlId="drzava">
                    <Form.Label> Država </Form.Label>
                    <Form.Control type="text" name="drzava" />
                </Form.Group>

                <Form.Group controlId="datumPolaska">
                    <Form.Label> Datum polaska </Form.Label>
                    <Form.Control type="date" name="datumPolaska" />
                </Form.Group>

                <Form.Group controlId="datumPovratka">
                    <Form.Label> Datum povratka </Form.Label>
                    <Form.Control type="date" name="datumPovratka" />
                </Form.Group>

                <Form.Group controlId="budzet">
                    <Form.Label> Budžet </Form.Label>
                    <Form.Control type="number" name="budzet" step={0.01} />
                </Form.Group>


                <Row className="mt-4">
                    <Col>
                    <Link to={RouteNames.PUTOVANJA}
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