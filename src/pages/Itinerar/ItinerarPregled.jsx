import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Badge, Card, Form, Row, Col } from "react-bootstrap"
import { RouteNames } from "../../constants";
import PutovanjaService from '../../services/putovanja/PutovanjaService'
import ItinerarService from '../../services/itinerar/ItinerarService'


export default function ItinerarPregled() {

    const [putovanja, setPutovanja] = useState([])
    const [odabranaSifra, setOdabranaSifra] = useState(null)
    const [stavke, setStavke] = useState([])

    const navigate = useNavigate()

    const [searchParams] = useSearchParams()

    useEffect(() => {
        const sifra = searchParams.get('putovanjeSifra')

        if (sifra) {
            setOdabranaSifra(parseInt(sifra, 10))
        }
    }, [searchParams])

    useEffect(() => {
        ucitajPutovanja()
    }, [])

    useEffect(() => {
        if (!odabranaSifra) {
            setStavke([])
            return
        }
        ucitajStavke()
    }, [odabranaSifra])


    async function ucitajPutovanja() {
        await PutovanjaService.get().then((odgovor) => {
            setPutovanja(odgovor.data)
        })
    }

    async function ucitajStavke() {
        await ItinerarService.getByPutovanje(odabranaSifra).then((odgovor) => {
            setStavke(odgovor.data)
        })
    }

    async function obrisi(sifra) {
        if (!confirm('Sigurno obrisati?')) {
            return
        }

        await ItinerarService.obrisi(sifra)
        ucitajStavke()
    }

    const putovanje = putovanja.find(p => p.sifra === odabranaSifra)

    const poDanima = stavke.reduce((acc, s) => {
        acc[s.dan] = acc[s.dan] || []
        acc[s.dan].push(s)
        return acc
    }, {})

    return (

        <>

            <h2 className="my-3" > Itinerar </h2>

            <Form.Select
                className="mb-3"
                value={odabranaSifra ?? ''}
                onChange={(e) => setOdabranaSifra(e.target.value ? parseInt(e.target.value) : null)}
            >
                <option value="">Odaberi putovanje</option>
                {putovanja && putovanja.map((p) => (
                    <option key={p.sifra} value={p.sifra}>{p.naziv}</option>
                ))}
            </Form.Select>

            {putovanje && (
                <Link
                    to={`${RouteNames.ITINERAR_DODAJ}?putovanjeSifra=${odabranaSifra}`}
                    className="btn btn-success w-100 my-3"
                >
                    Dodavanje nove stavke itinerara
                </Link>
            )}

            {Object.entries(poDanima).map(([dan, stavkeDana]) => (

                <div key={dan} className="mb-4">
                    <h5>Dan {dan}</h5>

                    <Row xs={1} md={2} lg={3} className="g-3">
                        {stavkeDana
                            .sort((a, b) => a.vrijeme.localeCompare(b.vrijeme))
                            .map((s) => (

                                <Col key={s.sifra}>
                                    <Card className="h-100">
                                        <Card.Body>
                                            <Card.Title>{s.naziv}</Card.Title>
                                            <Card.Subtitle className="mb-2 text-muted">
                                                {s.vrijeme}
                                            </Card.Subtitle>
                                            {s.biljeska && (
                                                <Card.Text>{s.biljeska}</Card.Text>
                                            )}
                                        </Card.Body>
                                        <Card.Footer>
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    navigate(
                                                        `${RouteNames.ITINERAR}/promjena/${s.sifra}?putovanjeSifra=${odabranaSifra}`
                                                    )
                                                }}>
                                                Promijeni
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="danger"
                                                className="ms-2"
                                                onClick={() => obrisi(s.sifra)} >
                                                Izbriši
                                            </Button>
                                        </Card.Footer>
                                    </Card>
                                </Col>

                            ))}
                    </Row>
                </div>

            ))}

            {putovanje && stavke.length === 0 && (
                <p>Nema stavki za ovo putovanje.</p>
            )}

            {putovanje && (
                <>
                    Ukupno &nbsp;
                    <Badge pill bg="success">
                        {stavke && stavke.length}
                    </Badge>
                    &nbsp; stavki itinerara
                </>
            )}

        </>

    )

}