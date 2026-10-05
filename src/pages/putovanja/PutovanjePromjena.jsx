import { Button, Col, Form, Row } from "react-bootstrap"
import { Link, useNavigate, useParams } from "react-router-dom"
import { RouteNames } from "../../constants"
import PutovanjaService from "../../services/putovanja/PutovanjaService"
import { useState, useEffect } from "react"

export default function PutovanjePromjena() {

    const navigate = useNavigate()
    const params = useParams()
    const [putovanje, setPutovanje] = useState([])

    async function ucitajPutovanje() {
        await PutovanjaService.getBySifra(params.sifra).then((odgovor) => {
            const p = odgovor.data
            p.datumPolaska = p.datumPolaska.substring(0, 10)
            p.datumPovratka = p.datumPovratka.substring(0, 10)
            setPutovanje(p)
        })
    }

    useEffect(()=>{
        ucitajPutovanje()
    }, [])

    async function promijeni(putovanje) {
        await PutovanjaService.promijeni(params.sifra, putovanje).then(() => {
            navigate(RouteNames.PUTOVANJA)
        })
    }

    function obradiSubmit(e) {
        e.preventDefault()
        const podaci = new FormData(e.target)
        promijeni({
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
            <h3>Promjena putovanja</h3>

            <Form onSubmit={obradiSubmit}>

                <Form.Group controlId="naziv">
                    <Form.Label> Naziv </Form.Label>
                    <Form.Control type="text" name="naziv" required 
                    defaultValue={putovanje.naziv}/>
                </Form.Group>

                <Form.Group controlId="destinacija">
                    <Form.Label> Destinacija </Form.Label>
                    <Form.Control type="text" name="destinacija" 
                    defaultValue={putovanje.destinacija}/>
                </Form.Group>

                <Form.Group controlId="drzava">
                    <Form.Label> Država </Form.Label>
                    <Form.Control type="text" name="drzava"
                    defaultValue={putovanje.drzava} />
                </Form.Group>

                <Form.Group controlId="datumPolaska">
                    <Form.Label> Datum polaska </Form.Label>
                    <Form.Control type="date" name="datumPolaska" 
                    defaultValue={putovanje.datumPolaska}/>
                </Form.Group>

                <Form.Group controlId="datumPovratka">
                    <Form.Label> Datum povratka </Form.Label>
                    <Form.Control type="date" name="datumPovratka" 
                    defaultValue={putovanje.datumPovratka}/>
                </Form.Group>

                <Form.Group controlId="budzet">
                    <Form.Label> Budžet </Form.Label>
                    <Form.Control type="number" name="budzet" step={0.01} 
                    defaultValue={putovanje.budzet}/>
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
                            Promijeni
                        </Button>
                    </Col>
                </Row>
            </Form>
        </>
    )

}