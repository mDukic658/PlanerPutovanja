import { useEffect, useState } from "react"
import { Link, useParams, useLocation } from "react-router-dom"
import { FaArrowLeft, FaPen, FaImages, FaSuitcaseRolling, FaList } from "react-icons/fa"
import { RouteNames } from "../../constants"
import { Card, Row, Col, Button, Modal } from "react-bootstrap"
import { NumericFormat } from "react-number-format"
import FormatDatuma from "../../components/FormatDatuma"
import PutovanjaService from "../../services/putovanja/PutovanjaService"
import ItinerarService from "../../services/itinerar/ItinerarService"
import PakiranjaService from "../../services/lista_pakiranja/PakiranjaService"
import FotografijeService from "../../services/fotografije/FotografijeService"


export default function PutovanjaDetalji() {
    const { sifra } = useParams()
    const location = useLocation()

    const povratakNaPregled = location.state?.povratakNaPregled || RouteNames.PUTOVANJA

    const [putovanje, setPutovanje] = useState(null)
    const [aktivnosti, setAktivnosti] = useState([])
    const [pakiranja, setPakiranja] = useState([])
    const [fotografije, setFotografije] = useState([])
    const [ucitavanje, setUcitavanje] = useState(true)
    const [greska, setGreska] = useState("")
    const [otvorenaSifra, setOtvorenaSifra] = useState(null)

    useEffect(() => {
        let aktivno = true

        async function ucitajPodatke() {
            setUcitavanje(true)
            setGreska("")
            setPutovanje(null)
            setAktivnosti([])
            setPakiranja([])
            setFotografije([])
            setOtvorenaSifra(null)

            try {
                const odgovorPutovanja =
                    await PutovanjaService.getBySifra(sifra)

                if (!aktivno) {
                    return
                }

                if (!odgovorPutovanja.data) {
                    return
                }

                const [
                    odgovorAktivnosti,
                    odgovorPakiranja,
                    odgovorFotografija
                ] = await Promise.all([
                    ItinerarService.get(),
                    PakiranjaService.get(),
                    FotografijeService.getByPutovanje(sifra)
                ])

                if (!aktivno) {
                    return
                }

                const sifraPutovanja = Number(sifra)

                setPutovanje(odgovorPutovanja.data)

                setAktivnosti(
                    odgovorAktivnosti.data
                        .filter(
                            aktivnost =>
                                Number(aktivnost.putovanjeSifra) ===
                                sifraPutovanja
                        )
                        .sort(
                            (a, b) =>
                                Number(a.dan) - Number(b.dan) ||
                                String(a.vrijeme || "").localeCompare(
                                    String(b.vrijeme || "")
                                )
                        )
                )

                setPakiranja(
                    odgovorPakiranja.data.filter(
                        pakiranje =>
                            Number(pakiranje.putovanjeSifra) ===
                            sifraPutovanja
                    )
                )

                setFotografije(odgovorFotografija.data)
            } catch (error) {
                console.error(error)

                if (aktivno) {
                    setGreska(
                        "Učitavanje detalja putovanja nije uspjelo."
                    )
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
    }, [sifra])

    const trenutniIndeks = fotografije.findIndex(
        fotografija => fotografija.sifra === otvorenaSifra
    )

    const otvorenaFotografija = fotografije[trenutniIndeks]

    function promijeniSliku(pomak) {
        if (trenutniIndeks === -1 || fotografije.length < 2) {
            return
        }

        const noviIndeks = (
            trenutniIndeks + pomak + fotografije.length
        ) % fotografije.length

        setOtvorenaSifra(fotografije[noviIndeks].sifra)
    }

    useEffect(() => {
        if (!otvorenaFotografija || fotografije.length < 2) {
            return
        }

        function obradiTipku(e) {
            let pomak

            if (e.key === "ArrowLeft") {
                pomak = -1
            } else if (e.key === "ArrowRight") {
                pomak = 1
            } else {
                return
            }

            e.preventDefault()

            const noviIndeks = (
                trenutniIndeks + pomak + fotografije.length
            ) % fotografije.length

            setOtvorenaSifra(fotografije[noviIndeks].sifra)
        }

        document.addEventListener("keydown", obradiTipku)

        return () => {
            document.removeEventListener("keydown", obradiTipku)
        }
    }, [otvorenaFotografija, trenutniIndeks, fotografije])

    const aktivnostiPoDanima = aktivnosti.reduce(
        (dani, aktivnost) => {
            const dan = aktivnost.dan

            if (!dani[dan]) {
                dani[dan] = []
            }

            dani[dan].push(aktivnost)

            return dani
        },
        {}
    )

    const dani = Object.keys(aktivnostiPoDanima).sort(
        (a, b) => Number(a) - Number(b)
    )

    const brojSpakiranih = pakiranja.filter(
        pakiranje => pakiranje.spakirano
    ).length

    const napredakPakiranja = pakiranja.length > 0
        ? Math.round(brojSpakiranih / pakiranja.length * 100)
        : 0

    const galerijaPutanja =
        `${RouteNames.FOTOGRAFIJE}?putovanjeSifra=${sifra}`

    const itinerarPutanja =
        `${RouteNames.ITINERAR}?putovanjeSifra=${sifra}`

    return (
        <section className="putovanje-detalji">
            <Link
                to={povratakNaPregled}
                className="natrag-na-pregled"
            >
                <FaArrowLeft />
                {" "}Natrag na pregled putovanja
            </Link>

            {ucitavanje ? (
                <p className="mt-4">Učitavanje...</p>
            ) : greska ? (
                <p className="mt-4" role="alert">
                    {greska}
                </p>
            ) : !putovanje ? (
                <p className="mt-4" role="alert">
                    Putovanje nije pronađeno. Možda je obrisano.
                </p>
            ) : (
                <>
                    {putovanje.slika && (
                        <img
                            src={putovanje.slika}
                            alt={`Naslovna slika putovanja ${putovanje.naziv}`}
                            className="putovanje-detalji-cover w-100 rounded mt-4"
                            style={{
                                maxHeight: 420,
                                objectFit: "cover"
                            }}
                        />
                    )}

                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 my-4">
                        <div>
                            <h2>{putovanje.naziv}</h2>

                            <p className="text-muted mb-0">
                                {putovanje.destinacija}, {putovanje.drzava}
                            </p>
                        </div>

                        <Link
                            to={RouteNames.PUTOVANJA_PROMIJENA.replace(
                                ":sifra",
                                sifra
                            )}
                            className="btn btn-primary"
                        >
                            <FaPen />
                            {" "}Promijeni putovanje
                        </Link>
                    </div>

                    <Row className="g-3 mb-4">
                        <Col xs={12} md={4}>
                            <Card className="h-100">
                                <Card.Body>
                                    <h3 className="h6">Polazak</h3>

                                    <FormatDatuma
                                        datum={putovanje.datumPolaska}
                                    />
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xs={12} md={4}>
                            <Card className="h-100">
                                <Card.Body>
                                    <h3 className="h6">Povratak</h3>

                                    <FormatDatuma
                                        datum={putovanje.datumPovratka}
                                    />
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xs={12} md={4}>
                            <Card className="h-100">
                                <Card.Body>
                                    <h3 className="h6">
                                        Planirani budžet
                                    </h3>

                                    <Link
                                        to={`${RouteNames.BUDZET}?putovanjeSifra=${sifra}`}
                                        className="budzet-poveznica">
                                        <NumericFormat
                                            value={putovanje.budzet}
                                            displayType="text"
                                            decimalSeparator=","
                                            thousandSeparator="."
                                            decimalScale={2}
                                            fixedDecimalScale
                                            suffix=" €"
                                        />
                                    </Link>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <section
                        className="mb-5"
                        aria-labelledby="detalji-itinerar"
                    >
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
                            <h3 id="detalji-itinerar" className="h4 mb-0">
                                Itinerar
                            </h3>

                            <Link
                                to={itinerarPutanja}
                                className="btn btn-primary"
                            >
                                <FaList />
                                {" "}Upravljaj itinerarom
                            </Link>
                        </div>

                        {dani.length === 0 ? (
                            <p>Još nema planiranih aktivnosti.</p>
                        ) : (
                            <Row className="g-3">
                                {dani.map(dan => (
                                    <Col xs={12} lg={6} key={dan}>
                                        <Card className="h-100">
                                            <Card.Body>
                                                <h4 className="h5 mb-3">
                                                    {dan}. dan
                                                </h4>

                                                <ul className="list-unstyled mb-0">
                                                    {aktivnostiPoDanima[dan].map(
                                                        aktivnost => (
                                                            <li
                                                                key={aktivnost.sifra}
                                                                className="border-top py-3"
                                                            >
                                                                <div className="d-flex gap-3">
                                                                    <strong className="text-nowrap">
                                                                        {aktivnost.vrijeme || "—"}
                                                                    </strong>

                                                                    <div>
                                                                        <h5 className="h6 mb-1">
                                                                            {aktivnost.naziv}
                                                                        </h5>

                                                                        {aktivnost.biljeska && (
                                                                            <p
                                                                                className="text-muted mb-0"
                                                                                style={{
                                                                                    whiteSpace: "pre-wrap",
                                                                                    overflowWrap: "anywhere"
                                                                                }}
                                                                            >
                                                                                {aktivnost.biljeska}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </section>

                    <section
                        className="mb-5"
                        aria-labelledby="detalji-pakiranje"
                    >
                        <Card>
                            <Card.Body>
                                <h3
                                    id="detalji-pakiranje"
                                    className="h4"
                                >
                                    Lista pakiranja
                                </h3>

                                {pakiranja.length === 0 ? (
                                    <p>Još nema predmeta na listi pakiranja.</p>
                                ) : (
                                    <p>
                                        Spakirano {brojSpakiranih} od{" "}
                                        {pakiranja.length} predmeta
                                        {" "}({napredakPakiranja}%).
                                    </p>
                                )}

                                <Link
                                    to={RouteNames.LISTA_PAKIRANJA_ODABRANO.replace(
                                        ":sifra",
                                        sifra
                                    )}
                                    className="btn btn-primary"
                                >
                                    <FaSuitcaseRolling />
                                    {" "}Otvori listu pakiranja
                                </Link>
                            </Card.Body>
                        </Card>
                    </section>

                    <section
                        className="mb-4"
                        aria-labelledby="detalji-galerija"
                    >
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
                            <h3
                                id="detalji-galerija"
                                className="h4 mb-0"
                            >
                                Galerija fotografija ({fotografije.length})
                            </h3>

                            <Link
                                to={galerijaPutanja}
                                className="btn btn-primary"
                            >
                                <FaImages />
                                {" "}Otvori galeriju
                            </Link>
                        </div>

                        {fotografije.length === 0 ? (
                            <p>
                                Ovo putovanje još nema fotografija.
                                Dodaj ih kroz galeriju.
                            </p>
                        ) : (
                            <Row className="g-3">
                                {fotografije.slice(0, 4).map(
                                    fotografija => (
                                        <Col
                                            xs={6}
                                            lg={3}
                                            key={fotografija.sifra}
                                        >
                                            <Button
                                                type="button"
                                                variant="link"
                                                className="d-block w-100 border-0 p-0 text-start text-decoration-none text-reset"
                                                aria-label={`Otvori fotografiju ${fotografija.naziv}`}
                                                onClick={() => setOtvorenaSifra(fotografija.sifra)}
                                            >
                                                <img
                                                    src={fotografija.slika}
                                                    alt={fotografija.naziv}
                                                    loading="lazy"
                                                    className="w-100 rounded"
                                                    style={{
                                                        height: 180,
                                                        objectFit: "cover"
                                                    }}
                                                />

                                                <p className="mt-2 mb-0">
                                                    {fotografija.naziv}
                                                </p>
                                            </Button>
                                        </Col>
                                    )
                                )}
                            </Row>
                        )}
                    </section>
                </>
            )}

            <Modal
                show={Boolean(otvorenaFotografija)}
                onHide={() => setOtvorenaSifra(null)}
                size="xl"
                centered
                className="galerija-modal"
                aria-labelledby="detalji-fotografija-naslov"
            >
                <Modal.Header closeButton closeLabel="Zatvori">
                    <Modal.Title id="detalji-fotografija-naslov">
                        {otvorenaFotografija?.naziv}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="text-center">
                    {otvorenaFotografija && (
                        <>
                            <img
                                src={otvorenaFotografija.slika}
                                alt={otvorenaFotografija.naziv}
                                style={{
                                    width: "100%",
                                    maxHeight: "70vh",
                                    objectFit: "contain"
                                }}
                            />

                            {otvorenaFotografija.opis && (
                                <p className="mt-3 mb-0">
                                    {otvorenaFotografija.opis}
                                </p>
                            )}
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer className="justify-content-between">
                    <Button
                        type="button"
                        variant="outline-primary"
                        disabled={fotografije.length < 2}
                        onClick={() => promijeniSliku(-1)}
                    >
                        ← Prethodna
                    </Button>

                    <span aria-live="polite" aria-atomic="true">
                        {trenutniIndeks + 1} / {fotografije.length}
                    </span>

                    <Button
                        type="button"
                        variant="outline-primary"
                        disabled={fotografije.length < 2}
                        onClick={() => promijeniSliku(1)}
                    >
                        Sljedeća →
                    </Button>
                </Modal.Footer>
            </Modal>

        </section>
    )
}