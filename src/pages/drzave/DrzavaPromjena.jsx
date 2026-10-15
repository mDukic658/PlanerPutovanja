import { Button, Col, Form, Row } from 'react-bootstrap'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { RouteNames } from '../../constants'
import DrzaveService from '../../services/drzave/DrzaveService'
import { useState, useEffect } from 'react'

export default function DrzavaPromjena() {
    const navigate = useNavigate()
    const { sifra } = useParams()

    const [drzava, setDrzava] = useState({
        naziv: '',
    })

    async function ucitajDrzavu() {
        const odgovor = await DrzaveService.getBySifra(sifra)
        setDrzava(odgovor.data)
    }

    useEffect(() => {
        ucitajDrzavu()
    }, [sifra])

    async function promijeni(podaciDrzave) {
        await DrzaveService.promijeni(sifra, podaciDrzave)
        navigate(RouteNames.DRZAVE)
    }

    function obradiSubmit(e) {
        e.preventDefault()

        const podaci = new FormData(e.target)

        promijeni({
            naziv: podaci.get('naziv').trim(),
        })
    }

    return (
        <>
            <h3>Promjena države</h3>

            <Form onSubmit={obradiSubmit}>
                <Form.Group controlId="naziv" className="mb-3">
                    <Form.Label>Naziv države</Form.Label>
                    <Form.Control
                        type="text"
                        name="naziv"
                        required
                        value={drzava.naziv || ''}
                        onChange={(e) =>
                            setDrzava({
                                ...drzava,
                                naziv: e.target.value,
                            })
                        }
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
                            Promijeni
                        </Button>
                    </Col>
                </Row>
            </Form>
        </>
    )
}