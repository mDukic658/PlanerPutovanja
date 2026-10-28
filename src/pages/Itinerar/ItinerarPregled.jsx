import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Badge, Card, Form, Row, Col } from "react-bootstrap"
import { RouteNames } from "../../constants";
import PutovanjaService from '../../services/putovanja/PutovanjaService'
import ItinerarService from '../../services/itinerar/ItinerarService'
import { FaRoute, FaPlus, FaPen, FaTrash, FaClock, FaCalendarDay } from "react-icons/fa";


export default function ItinerarPregled() {

    const [putovanja, setPutovanja] = useState([])
    const [odabranaSifra, setOdabranaSifra] = useState(null)
    const [stavke, setStavke] = useState([])
    const [odabranoPutovanje, setOdabranoPutovanje] = useState({})
    const [pretragaPutovanje, setPretragaPutovanje] = useState('')
    const [prikaziAutocomplete, setPrikaziAutocomplete] = useState(false)
    const [odabraniIndex, setOdabraniIndex] = useState(-1)

    const navigate = useNavigate()

    const [searchParams] = useSearchParams()
    const putovanjeSifra = searchParams.get("putovanjeSifra")


    useEffect(() => {
        ucitajPutovanja()
    }, [])

    useEffect(() => {
        if (!odabranaSifra) {
            setStavke([])
            return
        }

        ItinerarService.getByPutovanje(odabranaSifra).then((odgovor) => {
            setStavke(odgovor.data)
        })

    }, [odabranaSifra])

    useEffect(() => {
        if (!putovanjeSifra) return

        const putovanje = putovanja.find(
            (p) => p.sifra === Number(putovanjeSifra)
        )

        if (putovanje) {
            setOdabranoPutovanje(putovanje)
            setOdabranaSifra(putovanje.sifra)
        }
    }, [putovanja, putovanjeSifra])


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
        if (pretragaPutovanje === '') {
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
    }

    return (

        <section className="pregled-itinerara">

            <div className="itinerar-zaglavlje">
                <h2>
                    <FaRoute />
                    Itinerar
                </h2>

                {odabranoPutovanje.sifra > 0 && (
                    <Link
                        to={`${RouteNames.ITINERAR_DODAJ}?putovanjeSifra=${odabranaSifra}`}
                        className="btn btn-primary"
                    >
                        <FaPlus />
                        Dodaj aktivnost
                    </Link>
                )}
            </div>

            <div className="itinerar-odabir">
                <Form.Group
                    controlId="pretragaPutovanja"
                    className="position-relative"
                >
                    <Form.Label>Odaberi putovanje</Form.Label>

                    <Form.Control
                        type="text"
                        placeholder="Pretraži putovanja..."
                        value={pretragaPutovanje}
                        onChange={(e) => {
                            setPretragaPutovanje(e.target.value)
                            setOdabraniIndex(-1)
                            setPrikaziAutocomplete(true)
                        }}
                        onFocus={() => setPrikaziAutocomplete(true)}
                        onBlur={() => setPrikaziAutocomplete(false)}
                        onKeyUp={handleKeyUp}
                        autoComplete="off"
                    />

                    {prikaziAutocomplete && (
                        <div className="itinerar-prijedlozi">
                            {filtrirajPutovanje().map((o, index) => (
                                <div
                                    key={o.sifra}
                                    className={
                                        index === odabraniIndex
                                            ? "itinerar-prijedlog aktivan"
                                            : "itinerar-prijedlog"
                                    }
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => {
                                        postaviOdabranoPutovanje(o.sifra)
                                        setPrikaziAutocomplete(false)
                                        setPretragaPutovanje("")
                                        setOdabraniIndex(-1)
                                    }}
                                    onMouseEnter={() => {
                                        setOdabraniIndex(index)
                                    }}
                                >
                                    {o.naziv}
                                </div>
                            ))}

                            {filtrirajPutovanje().length === 0 && (
                                <div className="p-3">
                                    Nema pronađenih putovanja.
                                </div>
                            )}
                        </div>
                    )}
                </Form.Group>

                {odabranoPutovanje.sifra > 0 && (
                    <div className="itinerar-odabrano">
                        <strong>{odabranoPutovanje.naziv}</strong>
                        <span>
                            {odabranoPutovanje.destinacija},
                            {" "}{odabranoPutovanje.drzava}
                        </span>
                    </div>
                )}
            </div>

            {Object.entries(poDanima)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([dan, stavkeDana]) => (
                    <div key={dan} className="itinerar-dan">

                        <h3>
                            <FaCalendarDay />
                            Dan {dan}
                        </h3>

                        <Row xs={1} md={2} lg={3} className="g-3">
                            {[...stavkeDana]
                                .sort((a, b) =>
                                    a.vrijeme.localeCompare(b.vrijeme)
                                )
                                .map((s) => (
                                    <Col key={s.sifra}>
                                        <Card className="itinerar-kartica h-100">
                                            <Card.Body>
                                                <div className="itinerar-vrijeme">
                                                    <FaClock />
                                                    {s.vrijeme}
                                                </div>

                                                <Card.Title>
                                                    {s.naziv}
                                                </Card.Title>

                                                {s.biljeska && (
                                                    <Card.Text>
                                                        {s.biljeska}
                                                    </Card.Text>
                                                )}
                                            </Card.Body>

                                            <Card.Footer>
                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    onClick={() => {
                                                        navigate(
                                                            `${RouteNames.ITINERAR}/promjena/${s.sifra}?putovanjeSifra=${odabranaSifra}`
                                                        )
                                                    }}
                                                >
                                                    <FaPen />
                                                    Promijeni
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() => obrisi(s.sifra)}
                                                >
                                                    <FaTrash />
                                                    Izbriši
                                                </Button>
                                            </Card.Footer>
                                        </Card>
                                    </Col>
                                ))}
                        </Row>
                    </div>
                ))}

            {!odabranoPutovanje.sifra && (
                <p className="itinerar-prazno">
                    Odaberi putovanje za prikaz aktivnosti.
                </p>
            )}

            {odabranoPutovanje.sifra > 0 && stavke.length === 0 && (
                <p className="itinerar-prazno">
                    Još nema aktivnosti za ovo putovanje.
                </p>
            )}

            {odabranoPutovanje.sifra > 0 && (
                <div className="itinerar-ukupno">
                    Ukupno aktivnosti:
                    <Badge pill bg="primary">
                        {stavke.length}
                    </Badge>
                </div>
            )}

        </section>

    )

}