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
    const [odabranoPutovanje, setOdabranoPutovanje] = useState({})
    const [pretragaPutovanje, setPretragaPutovanje] = useState('')
    const [prikaziAutocomplete, setPrikaziAutocomplete] = useState(false)
    const [odabraniIndex, setOdabraniIndex] = useState(-1)

    const navigate = useNavigate()


    useEffect(() => {
        ucitajPutovanja()
    }, [])

    useEffect(() => {
        if (!odabranaSifra) {
            setStavke([])
            return
        }
        ucitajStavke()
    }, [])


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


    const poDanima = stavke.reduce((acc, s) => {
        acc[s.dan] = acc[s.dan] || []
        acc[s.dan].push(s)
        return acc
    }, {})




    function filtrirajPutovanje() {
        //if (!pretragaPutovanje) return []

        const sortiranaPutovanja = [...putovanja].sort((a, b) => 
            new Date(b.datumPolaska) - new Date(a.datumPolaska)
        );
        //console.log('pretragaPutovanje', pretragaPutovanje)
        if(pretragaPutovanje===''){
            return sortiranaPutovanja
        }

        return sortiranaPutovanja.filter(p =>

            p.naziv.toLowerCase().includes(pretragaPutovanje.toLowerCase())
        )
    }

    function handleKeyUp(e) {
        const filtriranaPutovanja = filtrirajPutovanje()

        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setOdabraniIndex(prev => {
                if (prev + 1 === filtriranaPutovanja.length) {
                    return 0
                }
                return prev < filtriranaPutovanja.length - 1 ? prev + 1 : prev
            }

            )
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setOdabraniIndex(prev => {
                if (prev === 0) {
                    return filtriranaPutovanja.length - 1
                }
                return prev > 0 ? prev - 1 : 0
            })
        } else if (e.key === 'Enter' && odabraniIndex >= 0 && filtriranaPutovanja.length > 0) {
            e.preventDefault()
            postaviOdabranoPutovanje(filtriranaPutovanja[odabraniIndex].sifra)
            setPrikaziAutocomplete(false)
            setPretragaPutovanje('')
            setOdabraniIndex(-1)
        } else if (e.key === 'Escape') {
            setPrikaziAutocomplete(false)
            setOdabraniIndex(-1)
        }
    }

    function postaviOdabranoPutovanje(sifra) {
        setOdabranoPutovanje(putovanja.find(p => p.sifra === sifra))
        setOdabranaSifra(sifra)
        ucitajStavke()
    }

    return (

        <>

            <h2 className="my-3" > Itinerar </h2>


            <Form.Group className="mb-3 position-relative">
                <Form.Label className="fw-bold">Odaberi putovanje <span style={{color: 'red'}}>
                    {odabranoPutovanje.naziv}
                    </span> </Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Pretraži putovanja..."
                    value={pretragaPutovanje}
                    onChange={(e) => {
                        setPretragaPutovanje(e.target.value)
                        setOdabraniIndex(-1)
                        setPrikaziAutocomplete(true)
                    }}
                    onFocus={() => {setPrikaziAutocomplete(true)}}
                    onBlur={()=>setPrikaziAutocomplete(false)}
                    onKeyUp={handleKeyUp}
                />
                {prikaziAutocomplete && (
                    <div className="position-absolute w-100 bg-white border rounded shadow-sm" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                        {filtrirajPutovanje().map((o, index) => (
                            <div
                                key={o.sifra}
                                className="p-2 cursor-pointer"
                                style={{
                                    cursor: 'pointer',
                                    backgroundColor: index === odabraniIndex ? '#007bff' : 'white',
                                    color: index === odabraniIndex ? 'white' : 'black'
                                }}
                                onClick={() => {
                                    postaviOdabranoPutovanje(o.sifra)
                                    setPrikaziAutocomplete(false)
                                    setPretragaPutovanje('')
                                    setOdabraniIndex(-1)
                                }}
                                onMouseEnter={(e) => {
                                    setOdabraniIndex(index)
                                }}
                            >
                                {o.naziv}
                            </div>
                        ))}
                    </div>
                )}
            </Form.Group>

            {odabranoPutovanje.sifra>0 && (
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

            {odabranoPutovanje.sifra>0 && stavke.length === 0 && (
                <p>Nema stavki za ovo putovanje.</p>
            )}

            {odabranoPutovanje.sifra>0 && (
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