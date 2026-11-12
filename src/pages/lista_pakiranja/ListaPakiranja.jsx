import { useEffect, useState } from "react"
import PutovanjaService from "../../services/putovanja/PutovanjaService"
import PakiranjaService from "../../services/lista_pakiranja/PakiranjaService"
import PredmetiService from "../../services/predmeti/PredmetiService"
import { Button, Card, Col, Row, Form, ProgressBar, Pagination, InputGroup } from "react-bootstrap"
import Pakiranje from "./Pakiranje"
import { Link, useNavigate, useParams } from "react-router-dom"
import { FaSuitcaseRolling, FaPen, FaMapMarkerAlt, FaFilePdf, FaSearch, FaArrowLeft } from "react-icons/fa"
import { useObavijesti } from "../../components/zajednicko/Obavijesti"
import ListaPakiranjaPDFGenerator from "../../components/dokumenti/ListaPakiranjaPDFGenerator"
import Napomena from "../../components/obrasci/Napomena"
import { RouteNames } from "../../constants"

export default function ListaPakiranja() {

    const navigate = useNavigate()
    const obavijesti = useObavijesti()
    const params = useParams()
    const [uvjetPretrazivanja, setUvjetPretrazivanja] = useState('')
    const [trenutnaStranica, setTrenutnuStranicu] = useState(1)
    const [ucitavanje, setUcitavanje] = useState(true)
    const [greska, setGreska] = useState('')

    const velicinaStranice = 6

    const [generiranjePDFa, setGeneriranjePDFa] = useState(false)

    const [putovanja, setPutovanja] = useState([])
    const [pakiranja, setPakiranja] = useState([])
    const [predmeti, setPredmeti] = useState([])

    useEffect(() => {
        let aktivno = true

        async function ucitajPodatke() {
            try {
                const [odgovorPutovanja, odgovorPakiranja, odgovorPredmeti] =
                    await Promise.all([
                        PutovanjaService.get(),
                        PakiranjaService.get(),
                        PredmetiService.get()
                    ])

                if (!aktivno) return

                setPutovanja(odgovorPutovanja.data)
                setPakiranja(odgovorPakiranja.data)
                setPredmeti(odgovorPredmeti.data)
            } catch (error) {
                console.error(error)

                if (aktivno) {
                    setGreska("Učitavanje lista pakiranja nije uspjelo.")
                }
            } finally {
                if (aktivno) {
                    setUcitavanje(false)
                }
            }
        }

        ucitajPodatke()

        return () => {
            aktivno = false
        }
    }, [])

    async function ucitajPakiranja() {
        await PakiranjaService.get().then((odgovor) => {
            setPakiranja(odgovor.data)
        })
    }

    async function promijeni(predmetSifra, putovanjeSifra) {

        const pakiranje = pakiranja.find(
            (stavka) =>
                stavka.predmetSifra === predmetSifra &&
                stavka.putovanjeSifra === putovanjeSifra
        )

        const novoPakiranje = {
            ...pakiranje,
            spakirano: !pakiranje.spakirano
        }

        await PakiranjaService.promijeni(
            predmetSifra,
            putovanjeSifra,
            novoPakiranje
        )

        ucitajPakiranja()
    }

    async function generirajPDFZaPutovanje(putovanje) {

        if (generiranjePDFa) return

        setGeneriranjePDFa(true)

        try {
            const generiraj = ListaPakiranjaPDFGenerator({
                putovanje,
                pakiranja,
                predmeti
            })

            await generiraj()
        } catch (greska) {
            console.error("Generiranje PDF-a nije uspjelo:", greska)

            obavijesti(
                "Generiranje PDF-a nije uspjelo.",
                "danger"
            )
        } finally {
            setGeneriranjePDFa(false)
        }
    }

    function prikaziNapredak(putovanjeSifra) {
        const stavke = pakiranja.filter(
            pakiranje =>
                Number(pakiranje.putovanjeSifra) === Number(putovanjeSifra)
        )

        const ukupno = stavke.length

        const spakirano = stavke.filter(
            pakiranje => pakiranje.spakirano
        ).length

        const postotak = ukupno === 0
            ? 0
            : Math.round((spakirano / ukupno) * 100)

        return (
            <div className="mb-4">
                <p className="mb-2">
                    Spakirano <strong>{spakirano}</strong> od{" "}
                    <strong>{ukupno}</strong> predmeta
                </p>

                <ProgressBar
                    now={postotak}
                    label={`${postotak}%`}
                    variant={postotak === 100 ? "success" : "primary"}
                    aria-label="Napredak pakiranja"
                />

                {ukupno > 0 && spakirano === ukupno && (
                    <p className="text-success mt-2 mb-0">
                        Sve je spakirano!
                    </p>
                )}
            </div>
        )
    }

    const odabranoPutovanje = params.sifra
        ? putovanja.find(
            p => Number(p.sifra) === Number(params.sifra)
        )
        : null

    const uvjet = uvjetPretrazivanja.toLowerCase().trim()

    const filtriranaPutovanja = putovanja.filter(putovanje =>
        [
            putovanje.naziv,
            putovanje.destinacija,
            putovanje.drzava
        ].some(vrijednost =>
            (vrijednost || '').toLowerCase().includes(uvjet)
        )
    )

    const ukupnoStranica = Math.ceil(
        filtriranaPutovanja.length / velicinaStranice
    )

    const putovanjaStranice = filtriranaPutovanja.slice(
        (trenutnaStranica - 1) * velicinaStranice,
        trenutnaStranica * velicinaStranice
    )

    const odabranaPakiranja = odabranoPutovanje
        ? pakiranja.filter(
            p => Number(p.putovanjeSifra) === Number(odabranoPutovanje.sifra)
        )
        : []

    function promijeniPretragu(e) {
        setUvjetPretrazivanja(e.target.value)
        setTrenutnuStranicu(1)
    }

    function prikaziDatum(datum) {
        if (!datum) return ''

        return new Date(datum).toLocaleDateString('hr-HR')
    }

    return (
        <section className="pregled-pakiranja">
            <h2 className="pakiranja-naslov">
                <FaSuitcaseRolling />
                {" "}Liste pakiranja
            </h2>

            {ucitavanje ? (
                <p>Učitavanje...</p>
            ) : greska ? (
                <div className="alert alert-danger" role="alert">
                    {greska}
                </div>
            ) : params.sifra ? (
                <>
                    <Link
                        to={RouteNames.LISTA_PAKIRANJA}
                        className="natrag-na-pregled"
                    >
                        <FaArrowLeft />
                        {" "}Natrag na sva pakiranja
                    </Link>

                    {!odabranoPutovanje ? (
                        <p className="pakiranja-prazno">
                            Putovanje nije pronađeno. Možda je obrisano.
                        </p>
                    ) : (
                        <div className="pakiranja-pregled-kartica">
                            <div className="pakiranja-zaglavlje">
                                <div>
                                    <h3>{odabranoPutovanje.naziv}</h3>

                                    <p className="pakiranja-lokacija">
                                        <FaMapMarkerAlt />
                                        {" "}{odabranoPutovanje.destinacija},
                                        {" "}{odabranoPutovanje.drzava}
                                    </p>

                                    <p className="text-muted">
                                        {prikaziDatum(odabranoPutovanje.datumPolaska)}
                                        {" – "}
                                        {prikaziDatum(odabranoPutovanje.datumPovratka)}
                                    </p>
                                </div>

                                <div className="d-flex flex-wrap gap-2 mb-3">
                                    <Button
                                        onClick={() => navigate(
                                            `/lista/pakiranja/${odabranoPutovanje.sifra}`
                                        )}
                                    >
                                        <FaPen className="me-2" />
                                        Uredi listu
                                    </Button>

                                    <Button
                                        variant="outline-primary"
                                        disabled={generiranjePDFa}
                                        onClick={() =>
                                            generirajPDFZaPutovanje(odabranoPutovanje)
                                        }
                                    >
                                        <FaFilePdf className="me-2" />
                                        {generiranjePDFa
                                            ? "Generiranje..."
                                            : "Prikaži PDF"}
                                    </Button>
                                </div>
                            </div>

                            {prikaziNapredak(odabranoPutovanje.sifra)}

                            {odabranaPakiranja.length === 0 ? (
                                <p className="pakiranja-prazno">
                                    Još nema predmeta za ovo putovanje.
                                    Dodaj ih kroz uređivanje liste.
                                </p>
                            ) : (
                                <div className="pakiranja-stavke">
                                    {odabranaPakiranja.map((pakiranje, indeks) => (
                                        <div
                                            className="pakiranje-red"
                                            key={`${pakiranje.predmetSifra}-${indeks}`}
                                        >
                                            <div className="d-flex flex-wrap align-items-center gap-3 w-100">
                                                <Pakiranje
                                                    pakiranje={pakiranje}
                                                    predmeti={predmeti}
                                                    promijeni={promijeni}
                                                />

                                                <Napomena
                                                    pakiranje={pakiranje}
                                                    ucitajPakiranja={ucitajPakiranja}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            ) : putovanja.length === 0 ? (
                <p className="pakiranja-prazno">
                    Prvo dodaj putovanje kako bi mogao napraviti listu pakiranja.
                </p>
            ) : (
                <>
                    <InputGroup className="mb-4">
                        <InputGroup.Text>
                            <FaSearch aria-hidden="true" />
                        </InputGroup.Text>

                        <Form.Control
                            type="search"
                            placeholder="Pretraži putovanja po nazivu, destinaciji ili državi..."
                            aria-label="Pretraži liste pakiranja"
                            value={uvjetPretrazivanja}
                            onChange={promijeniPretragu}
                        />
                    </InputGroup>

                    {filtriranaPutovanja.length === 0 ? (
                        <p className="pakiranja-prazno">
                            Nema putovanja koja odgovaraju pretrazi.
                        </p>
                    ) : (
                        <Row className="g-4">
                            {putovanjaStranice.map(putovanje => (
                                <Col xs={12} md={6} lg={4} key={putovanje.sifra}>
                                    <Card className="h-100 border-0 shadow-sm">
                                        <Card.Body className="d-flex flex-column">
                                            <Card.Title>
                                                {putovanje.naziv}
                                            </Card.Title>

                                            <p className="text-muted mb-2">
                                                <FaMapMarkerAlt className="me-1" />
                                                {putovanje.destinacija},
                                                {" "}{putovanje.drzava}
                                            </p>

                                            <p className="small text-muted mb-3">
                                                {prikaziDatum(putovanje.datumPolaska)}
                                                {" – "}
                                                {prikaziDatum(putovanje.datumPovratka)}
                                            </p>

                                            {prikaziNapredak(putovanje.sifra)}

                                            <Button
                                                className="mt-auto"
                                                onClick={() => navigate(
                                                    `/lista/pakiranja/odabrano/${putovanje.sifra}`
                                                )}
                                            >
                                                <FaSuitcaseRolling className="me-2" />
                                                Otvori listu
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}

                    {ukupnoStranica > 1 && (
                        <Pagination className="justify-content-center flex-wrap mt-4">
                            <Pagination.First
                                disabled={trenutnaStranica === 1}
                                onClick={() => setTrenutnuStranicu(1)}
                            />

                            <Pagination.Prev
                                disabled={trenutnaStranica === 1}
                                onClick={() =>
                                    setTrenutnuStranicu(trenutnaStranica - 1)
                                }
                            />

                            {Array.from(
                                { length: ukupnoStranica },
                                (_, indeks) => indeks + 1
                            ).map(brojStranice => {
                                if (
                                    brojStranice === 1 ||
                                    brojStranice === ukupnoStranica ||
                                    (
                                        brojStranice >= trenutnaStranica - 2 &&
                                        brojStranice <= trenutnaStranica + 2
                                    )
                                ) {
                                    return (
                                        <Pagination.Item
                                            key={brojStranice}
                                            active={brojStranice === trenutnaStranica}
                                            onClick={() =>
                                                setTrenutnuStranicu(brojStranice)
                                            }
                                        >
                                            {brojStranice}
                                        </Pagination.Item>
                                    )
                                }

                                if (
                                    brojStranice === trenutnaStranica - 3 ||
                                    brojStranice === trenutnaStranica + 3
                                ) {
                                    return (
                                        <Pagination.Ellipsis
                                            key={brojStranice}
                                            disabled
                                        />
                                    )
                                }

                                return null
                            })}

                            <Pagination.Next
                                disabled={trenutnaStranica === ukupnoStranica}
                                onClick={() =>
                                    setTrenutnuStranicu(trenutnaStranica + 1)
                                }
                            />

                            <Pagination.Last
                                disabled={trenutnaStranica === ukupnoStranica}
                                onClick={() => setTrenutnuStranicu(ukupnoStranica)}
                            />
                        </Pagination>
                    )}
                </>
            )}
        </section>
    )
}