import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Badge, Card, Form, Row, Col } from "react-bootstrap"
import { RouteNames } from "../../constants";
import PutovanjaService from '../../services/putovanja/PutovanjaService'
import ItinerarService from '../../services/itinerar/ItinerarService'
import { FaRoute, FaPlus, FaPen, FaTrash, FaClock, FaCalendarDay, FaFileWord } from "react-icons/fa";
import { useObavijesti } from "../../components/zajednicko/Obavijesti";
import { generirajItinerarWord } from "../../components/dokumenti/WordGenerator";
import RichTextPrikaz from "../../components/ui/RichTextEditor/RichTextPrikaz";
import PotvrdaBrisanja from "../../components/zajednicko/PotvrdaBrisanja";


export default function ItinerarPregled() {

    const [putovanja, setPutovanja] = useState([])
    const [odabranaSifra, setOdabranaSifra] = useState(null)
    const [stavke, setStavke] = useState([])
    const [odabranoPutovanje, setOdabranoPutovanje] = useState({})
    const [pretragaPutovanje, setPretragaPutovanje] = useState('')
    const [generiranjeWorda, setGeneriranjeWorda] = useState(false)
    const [aktivnostZaBrisanje, setAktivnostZaBrisanje] = useState(null)
    const [brisanjeAktivnosti, setBrisanjeAktivnosti] = useState(false)

    const obavijesti = useObavijesti()
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
            (p) => String(p.sifra) === String(putovanjeSifra)
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

    async function obrisi() {
        if (!aktivnostZaBrisanje || brisanjeAktivnosti) return

        const { sifra } = aktivnostZaBrisanje
        setBrisanjeAktivnosti(true)

        try {
            const odgovor = await ItinerarService.obrisi(sifra)

            if (odgovor?.success === false) {
                throw new Error(odgovor.message)
            }

            setStavke(prethodne => prethodne.filter(stavka => stavka.sifra !== sifra))
            setAktivnostZaBrisanje(null)
            obavijesti("Aktivnost je obrisana.")
        } catch (error) {
            console.error(error)
            obavijesti("Brisanje aktivnosti nije uspjelo.", "danger")
        } finally {
            setBrisanjeAktivnosti(false)
        }
    }

    async function generirajWord() {
        if (!odabranoPutovanje.sifra || generiranjeWorda) return

        setGeneriranjeWorda(true)

        try {
            const odgovor = await ItinerarService.getByPutovanje(
                odabranoPutovanje.sifra
            )

            await generirajItinerarWord(
                odabranoPutovanje,
                odgovor.data
            )
        } catch (greska) {
            console.error("Generiranje Worda nije uspjelo:", greska)

            obavijesti(
                "Generiranje Word dokumenta nije uspjelo.",
                "danger"
            )
        } finally {
            setGeneriranjeWorda(false)
        }
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

    function postaviOdabranoPutovanje(sifra) {
        setOdabranoPutovanje(putovanja.find(p => p.sifra === sifra))
        setOdabranaSifra(sifra)
    }

    const filtriranaPutovanja = filtrirajPutovanje()

    return (

        <section className="pregled-itinerara">

            <div className="itinerar-zaglavlje">
                <h2>
                    <FaRoute />
                    Itinerar
                </h2>

                {Boolean(odabranoPutovanje.sifra) && (
                    <div className="d-flex flex-wrap gap-2">
                        <Button
                            variant="primary"
                            disabled={generiranjeWorda}
                            onClick={generirajWord}
                        >
                            <FaFileWord className="me-2" />
                            {generiranjeWorda ? "Generiranje..." : "Preuzmi Word"}
                        </Button>

                        <Link
                            to={`${RouteNames.ITINERAR_DODAJ}?putovanjeSifra=${odabranaSifra}`}
                            className="btn btn-primary"
                        >
                            <FaPlus />
                            Dodaj aktivnost
                        </Link>
                    </div>
                )}
            </div>

            <div className="itinerar-odabir">
                <Form.Group controlId="pretragaPutovanja" className="mb-3">
                    <Form.Label>Odaberi putovanje</Form.Label>
                    <Form.Control
                        type="search"
                        placeholder="Pretraži putovanja..."
                        value={pretragaPutovanje}
                        onChange={(e) => setPretragaPutovanje(e.target.value)}
                    />
                </Form.Group>

                {filtriranaPutovanja.length === 0 ? (
                    <p>Nema pronađenih putovanja.</p>
                ) : (
                    <div className="row g-2 mb-3">
                        {filtriranaPutovanja.map((putovanje) => (
                            <div className="col-12 col-sm-6 col-lg-4" key={putovanje.sifra}>
                                <Button
                                    type="button"
                                    variant={
                                        String(odabranoPutovanje.sifra) === String(putovanje.sifra)
                                            ? "primary"
                                            : "outline-primary"
                                    }
                                    className="w-100 h-100 text-start"
                                    onClick={() => postaviOdabranoPutovanje(putovanje.sifra)}
                                >
                                    <strong className="d-block">{putovanje.naziv}</strong>
                                    <span>{putovanje.destinacija}, {putovanje.drzava}</span>
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {Boolean(odabranoPutovanje.sifra) && (
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
                                                    <div className="itinerar-biljeska">
                                                        <RichTextPrikaz html={s.biljeska} />
                                                    </div>
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
                                                    onClick={() => setAktivnostZaBrisanje(s)}
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

            {Boolean(odabranoPutovanje.sifra) && stavke.length === 0 && (
                <p className="itinerar-prazno">
                    Još nema aktivnosti za ovo putovanje.
                </p>
            )}

            {Boolean(odabranoPutovanje.sifra) && (
                <div className="itinerar-ukupno">
                    Ukupno aktivnosti:
                    <Badge pill bg="primary">
                        {stavke.length}
                    </Badge>
                </div>
            )}

            <PotvrdaBrisanja
                otvoreno={aktivnostZaBrisanje !== null}
                naslov="Brisanje aktivnosti"
                brisanjeUTijeku={brisanjeAktivnosti}
                onOdustani={() => setAktivnostZaBrisanje(null)}
                onPotvrdi={obrisi}
            >
                Želiš li obrisati aktivnost „{aktivnostZaBrisanje?.naziv}”?
            </PotvrdaBrisanja>

        </section>

    )

}