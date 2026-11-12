import { useEffect, useState } from "react";
import { Button, Offcanvas, ProgressBar } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaFileWord, FaFilePdf, FaSuitcaseRolling, FaClock } from "react-icons/fa";
import dayjs from "dayjs";
import ItinerarService from "../../services/itinerar/ItinerarService"
import PakiranjaService from "../../services/lista_pakiranja/PakiranjaService"
import PredmetiService from "../../services/predmeti/PredmetiService"
import { useObavijesti } from "../Obavijesti"
import { generirajItinerarWord } from "../WordGenerator"
import ListaPakiranjaPDFGenerator from "../ListaPakiranjaPDFGenerator"
import { RouteNames } from "../../constants";

export default function PutovanjePanel({
    odabranoPutovanje,
    stavkeItinerara,
    napredakOdabranogPutovanja,
    brisanje,
    onZatvori,
    dodajAktivnostOdabranomPutovanju,
    urediOdabranoPutovanje,
    obrisiOdabranoPutovanje
}) {

    const obavijesti = useObavijesti()

    const [generiranjeDokumenta, setGeneriranjeDokumenta] = useState(null)
    const [danas, setDanas] = useState(() => dayjs().startOf("day"))

    useEffect(() => {
        const interval = setInterval(() => {
            setDanas(dayjs().startOf("day"))
        }, 60000)

        return () => clearInterval(interval)
    }, [])

    function dohvatiOdbrojavanje(putovanje) {
        const polazak = dayjs(putovanje.datumPolaska).startOf("day")
        const povratak = dayjs(putovanje.datumPovratka).startOf("day")

        const brojDana = polazak.diff(danas, "day")

        if (brojDana > 0) {
            return brojDana === 1
                ? "Još 1 dan do polaska"
                : `Još ${brojDana} dana do polaska`
        }

        if (danas.isAfter(povratak, "day")) {
            return "Putovanje je završeno"
        }

        return danas.isSame(polazak, "day")
            ? "Danas je polazak!"
            : "Putovanje je u tijeku"
    }

    async function preuzmiDokument(vrsta) {
        if (!odabranoPutovanje || generiranjeDokumenta || brisanje) return

        const putovanje = odabranoPutovanje

        setGeneriranjeDokumenta(vrsta)

        try {
            if (vrsta === "word") {
                const odgovor = await ItinerarService.getByPutovanje(
                    putovanje.sifra
                )

                await generirajItinerarWord(
                    putovanje,
                    odgovor.data
                )
            } else {
                const [odgovorPakiranja, odgovorPredmeti] = await Promise.all([
                    PakiranjaService.get(),
                    PredmetiService.get()
                ])

                const generirajPDF = ListaPakiranjaPDFGenerator({
                    putovanje,
                    pakiranja: odgovorPakiranja.data,
                    predmeti: odgovorPredmeti.data
                })

                await generirajPDF()
            }
        } catch (greska) {
            console.error("Generiranje dokumenta nije uspjelo:", greska)

            obavijesti(
                "Generiranje dokumenta nije uspjelo.",
                "danger"
            )
        } finally {
            setGeneriranjeDokumenta(null)
        }
    }

    const aktivnostiOdabranogPutovanja = odabranoPutovanje
        ? stavkeItinerara
            .filter(
                stavka =>
                    Number(stavka.putovanjeSifra) ===
                    Number(odabranoPutovanje.sifra)
            )
            .sort(
                (a, b) =>
                    Number(a.dan) - Number(b.dan) ||
                    String(a.vrijeme).localeCompare(String(b.vrijeme))
            )
        : []

    const itinerarPoDanima = aktivnostiOdabranogPutovanja.reduce(
        (dani, aktivnost) => {
            dani[aktivnost.dan] = dani[aktivnost.dan] || []
            dani[aktivnost.dan].push(aktivnost)

            return dani
        },
        {}
    )

    const panelZauzet = brisanje || generiranjeDokumenta !== null

    return (

        <Offcanvas
            className="kalendar-panel"
            placement="end"
            show={odabranoPutovanje !== null}
            onHide={() => {
                if (!panelZauzet) {
                    onZatvori()
                }
            }}
            aria-labelledby="kalendar-panel-naslov"
        >
            <Offcanvas.Header closeButton={!panelZauzet}>
                <Offcanvas.Title id="kalendar-panel-naslov">
                    {odabranoPutovanje?.naziv}
                </Offcanvas.Title>
            </Offcanvas.Header>

            <Offcanvas.Body>
                {odabranoPutovanje && (
                    <>
                        <section className="kalendar-panel-detalji">
                            <p className="kalendar-panel-lokacija">
                                {odabranoPutovanje.destinacija},
                                {" "}{odabranoPutovanje.drzava}
                            </p>

                            <p>
                                {dayjs(odabranoPutovanje.datumPolaska)
                                    .format("DD.MM.YYYY.")}
                                {" – "}
                                {dayjs(odabranoPutovanje.datumPovratka)
                                    .format("DD.MM.YYYY.")}
                            </p>

                            <div
                                className="kalendar-panel-odbrojavanje"
                                role="status"
                            >
                                <FaClock />
                                {dohvatiOdbrojavanje(odabranoPutovanje)}
                            </div>
                        </section>

                        <section className="kalendar-panel-sekcija">
                            <h3>Itinerar</h3>

                            {aktivnostiOdabranogPutovanja.length === 0 ? (
                                <p className="text-muted">
                                    Još nema aktivnosti za ovo putovanje.
                                </p>
                            ) : (
                                Object.entries(itinerarPoDanima)
                                    .sort(([a], [b]) => Number(a) - Number(b))
                                    .map(([dan, aktivnosti]) => (
                                        <div
                                            key={dan}
                                            className="kalendar-panel-dan"
                                        >
                                            <h4>
                                                Dan {dan}
                                                <span>
                                                    {dayjs(
                                                        odabranoPutovanje.datumPolaska
                                                    )
                                                        .add(Number(dan) - 1, "day")
                                                        .format("DD.MM.YYYY.")}
                                                </span>
                                            </h4>

                                            {aktivnosti.map(aktivnost => (
                                                <div
                                                    key={aktivnost.sifra}
                                                    className="kalendar-panel-aktivnost"
                                                >
                                                    <span className="kalendar-panel-vrijeme">
                                                        {aktivnost.vrijeme}
                                                    </span>

                                                    <div>
                                                        <strong>
                                                            {aktivnost.naziv}
                                                        </strong>

                                                        {aktivnost.biljeska && (
                                                            <p>
                                                                {aktivnost.biljeska}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))
                            )}

                            <Button
                                type="button"
                                onClick={dodajAktivnostOdabranomPutovanju}
                                disabled={panelZauzet}
                            >
                                Dodaj aktivnost
                            </Button>
                        </section>

                        <section className="kalendar-panel-sekcija">
                            <h3>Lista pakiranja</h3>

                            <p>
                                Spakirano{" "}
                                <strong>
                                    {napredakOdabranogPutovanja.spakirano}
                                </strong>
                                {" od "}
                                <strong>
                                    {napredakOdabranogPutovanja.ukupno}
                                </strong>
                                {" predmeta"}
                            </p>

                            <ProgressBar
                                now={napredakOdabranogPutovanja.postotak}
                                label={`${napredakOdabranogPutovanja.postotak}%`}
                                variant={
                                    napredakOdabranogPutovanja.postotak === 100
                                        ? "success"
                                        : "primary"
                                }
                                aria-label="Napredak pakiranja"
                                className="mb-3"
                            />

                            <Link
                                to={`/lista/pakiranja/${odabranoPutovanje.sifra}`}
                                className="kalendar-panel-poveznica"
                            >
                                <FaSuitcaseRolling />
                                Otvori listu pakiranja
                            </Link>
                        </section>

                        <section className="kalendar-panel-sekcija">
                            <h3>Dokumenti</h3>

                            <div className="kalendar-panel-gumbi">
                                <Button
                                    type="button"
                                    variant="outline-primary"
                                    disabled={panelZauzet}
                                    onClick={() => preuzmiDokument("word")}
                                >
                                    <FaFileWord />
                                    {generiranjeDokumenta === "word"
                                        ? "Generiranje..."
                                        : "Preuzmi itinerar — Word"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline-primary"
                                    disabled={panelZauzet}
                                    onClick={() => preuzmiDokument("pdf")}
                                >
                                    <FaFilePdf />
                                    {generiranjeDokumenta === "pdf"
                                        ? "Generiranje..."
                                        : "Prikaži listu pakiranja — PDF"}
                                </Button>
                            </div>
                        </section>

                        <div className="kalendar-panel-akcije">

                            <Button
                                as={Link}
                                to={RouteNames.PUTOVANJA_DETALJI.replace(
                                    ":sifra",
                                    odabranoPutovanje.sifra
                                )}
                                variant="outline-primary"
                                disabled={panelZauzet}
                                onClick={e => {
                                    if (panelZauzet) {
                                        e.preventDefault()
                                        return
                                    }

                                    onZatvori()
                                }}
                            >
                                Detalji putovanja
                            </Button>

                            <Button
                                type="button"
                                variant="outline-primary"
                                onClick={urediOdabranoPutovanje}
                                disabled={panelZauzet}
                            >
                                Uredi putovanje
                            </Button>

                            <Button
                                type="button"
                                variant="danger"
                                onClick={obrisiOdabranoPutovanje}
                                disabled={panelZauzet}
                            >
                                {brisanje ? "Brisanje..." : "Obriši putovanje"}
                            </Button>
                        </div>
                    </>
                )}
            </Offcanvas.Body>
        </Offcanvas>

    )

}