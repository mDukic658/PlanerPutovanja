import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { FaPlus, FaPen, FaTrash } from "react-icons/fa";
import { RouteNames } from "../../constants"
import PutovanjaService from "../../services/putovanja/PutovanjaService"
import BudzetServis from "../../services/budzet/BudzetServis"
import FormatDatuma from "../../components/FormatDatuma"
import { useObavijesti } from "../../components/Obavijesti"
import BudzetGrafikon from "../../components/budzet/BudzetGrafikon";

function formatirajIznos(iznos) {
    return new Intl.NumberFormat("hr-HR", {
        style: "currency",
        currency: "EUR"
    }).format(iznos)
}

export default function BudzetPregled() {

    const [searchParams, setSearchParams] = useSearchParams()
    const putovanjeSifra = searchParams.get("putovanjeSifra") || ""

    const [putovanja, setPutovanja] = useState([])
    const [troskovi, setTroskovi] = useState([])
    const [pretraga, setPretraga] = useState("")
    const [prikaziPrijedloge, setPrikaziPrijedloge] = useState(false)
    const [ucitavanje, setUcitavanje] = useState(true)
    const [greska, setGreska] = useState("")
    const [brisanjeSifra, setBrisanjeSifra] = useState(null)

    const obavijesti = useObavijesti()

    useEffect(() => {
        let aktivno = true

        async function ucitajPodatke() {
            try {
                const [odgovorPutovanja, odgovorTroskova] =
                    await Promise.all([
                        PutovanjaService.get(),
                        BudzetServis.get()
                    ])

                if (aktivno) {
                    setPutovanja(odgovorPutovanja.data)
                    setTroskovi(odgovorTroskova.data)
                }
            } catch (error) {
                console.error(error)

                if (aktivno) {
                    setGreska("Učitavanje budžeta nije uspjelo.")
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

    const odabranoPutovanje = putovanja.find(
        putovanje => Number(putovanje.sifra) === Number(putovanjeSifra)
    )

    const filtriranaPutovanja = [...putovanja]
        .sort((a, b) =>
            new Date(b.datumPolaska) - new Date(a.datumPolaska))
        .filter(putovanje => putovanje.naziv.toLowerCase().includes(pretraga.trim().toLowerCase()))

    const prikazaniTroskovi = troskovi
        .filter(
            trosak =>
                Number(trosak.putovanjeSifra) === Number(putovanjeSifra)
        )
        .sort(
            (a, b) =>
                String(b.datum).localeCompare(String(a.datum)) ||
                Number(b.sifra) - Number(a.sifra)
        )

    const planiranoCenti = Math.round(
        Number(odabranoPutovanje?.budzet || 0) * 100
    )

    const potrosenoCenti = prikazaniTroskovi.reduce(
        (ukupno, trosak) =>
            ukupno + Math.round(Number(trosak.iznos) * 100),
        0
    )

    const preostaloCenti = planiranoCenti - potrosenoCenti

    function odaberiPutovanje(sifra) {
        setSearchParams({ putovanjeSifra: String(sifra) })
        setPretraga("")
        setPrikaziPrijedloge(false)
    }

    async function obrisi(trosak) {
        if (brisanjeSifra !== null) {
            return
        }

        if (!confirm(`Obrisati trošak „${trosak.naziv}”?`)) {
            return
        }

        setBrisanjeSifra(trosak.sifra)

        try {
            await BudzetServis.obrisi(trosak.sifra)

            setTroskovi(prethodni =>
                prethodni.filter(
                    stavka => stavka.sifra !== trosak.sifra
                )
            )

            obavijesti("Trošak je obrisan.")
        } catch (error) {
            console.error(error)
            obavijesti("Brisanje troška nije uspjelo.", "danger")
        } finally {
            setBrisanjeSifra(null)
        }
    }

    return (
        <section className="budzet-pregled">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <h2 className="mb-0">Budžet i troškovi</h2>

                {odabranoPutovanje && (
                    <Link
                        to={`${RouteNames.BUDZET_NOVO}?putovanjeSifra=${putovanjeSifra}`}
                        className="btn btn-primary"
                    >
                        <FaPlus />
                        {" "}Dodaj trošak
                    </Link>
                )}
            </div>

            {ucitavanje ? (
                <p>Učitavanje...</p>
            ) : greska ? (
                <p role="alert">{greska}</p>
            ) : (
                <>
                    <div className="itinerar-odabir mb-4">
                        <Form.Group
                            controlId="budzet-pretraga-putovanja"
                            className="position-relative"
                            onBlur={e => {
                                if (
                                    !e.currentTarget.contains(e.relatedTarget)
                                ) {
                                    setPrikaziPrijedloge(false)
                                }
                            }}
                            onKeyDown={e => {
                                if (e.key === "Escape") {
                                    setPrikaziPrijedloge(false)
                                }
                            }}
                        >
                            <Form.Label>Odaberi putovanje</Form.Label>

                            <Form.Control
                                type="search"
                                placeholder="Pretraži putovanja..."
                                value={pretraga}
                                autoComplete="off"
                                onChange={e => {
                                    setPretraga(e.target.value)
                                    setPrikaziPrijedloge(true)
                                }}
                                onFocus={() =>
                                    setPrikaziPrijedloge(true)
                                }
                            />

                            {prikaziPrijedloge && (
                                <div className="itinerar-prijedlozi">
                                    {filtriranaPutovanja.map(putovanje => (
                                        <button
                                            key={putovanje.sifra}
                                            type="button"
                                            className="itinerar-prijedlog border-0 w-100 text-start"
                                            onClick={() =>
                                                odaberiPutovanje(
                                                    putovanje.sifra
                                                )
                                            }
                                        >
                                            {putovanje.naziv}
                                        </button>
                                    ))}

                                    {filtriranaPutovanja.length === 0 && (
                                        <p className="p-3 mb-0">
                                            Nema pronađenih putovanja.
                                        </p>
                                    )}
                                </div>
                            )}
                        </Form.Group>

                        {odabranoPutovanje && (
                            <div className="itinerar-odabrano">
                                <strong>
                                    {odabranoPutovanje.naziv}
                                </strong>

                                <span>
                                    {odabranoPutovanje.destinacija},
                                    {" "}{odabranoPutovanje.drzava}
                                </span>
                            </div>
                        )}
                    </div>

                    {!odabranoPutovanje && (
                        <p>
                            {putovanjeSifra
                                ? "Odabrano putovanje nije pronađeno. Odaberi drugo."
                                : "Odaberi putovanje za pregled budžeta i troškova."}
                        </p>
                    )}

                    {odabranoPutovanje && (
                        <Row className="g-3 mb-4">
                            <Col xs={12} md={4}>
                                <Card className="h-100">
                                    <Card.Body>
                                        <h3 className="h6">Planirani budžet</h3>

                                        <strong>
                                            {formatirajIznos(planiranoCenti / 100)}
                                        </strong>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col xs={12} md={4}>
                                <Card className="h-100">
                                    <Card.Body>
                                        <h3 className="h6">Potrošeno</h3>

                                        <strong>
                                            {formatirajIznos(potrosenoCenti / 100)}
                                        </strong>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col xs={12} md={4}>
                                <Card className="h-100">
                                    <Card.Body>
                                        <h3 className="h6">
                                            {preostaloCenti < 0
                                                ? "Prekoračenje"
                                                : "Preostalo"}
                                        </h3>

                                        <strong
                                            className={
                                                preostaloCenti < 0
                                                    ? "text-danger"
                                                    : "text-success"
                                            }
                                        >
                                            {formatirajIznos(
                                                Math.abs(preostaloCenti) / 100
                                            )}
                                        </strong>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    )}

                    {odabranoPutovanje && (
                        <BudzetGrafikon troskovi={prikazaniTroskovi} />
                    )}

                    {odabranoPutovanje && (
                        <section aria-labelledby="budzet-troskovi-naslov">
                            <h3 id="budzet-troskovi-naslov" className="h4 mb-3">
                                Troškovi ({prikazaniTroskovi.length})
                            </h3>

                            {prikazaniTroskovi.length === 0 ? (
                                <p>
                                    Ovo putovanje još nema evidentiranih troškova.
                                </p>
                            ) : (
                                <Row className="g-3">
                                    {prikazaniTroskovi.map(trosak => (
                                        <Col
                                            xs={12}
                                            md={6}
                                            lg={4}
                                            key={trosak.sifra}
                                        >
                                            <Card className="h-100">
                                                <Card.Body className="d-flex flex-column">
                                                    <Card.Title>
                                                        {trosak.naziv}
                                                    </Card.Title>

                                                    <p className="text-muted mb-2">
                                                        {trosak.kategorija}
                                                    </p>

                                                    <strong className="mb-2">
                                                        {formatirajIznos(
                                                            Number(trosak.iznos)
                                                        )}
                                                    </strong>

                                                    <div className="mb-3">
                                                        <FormatDatuma datum={trosak.datum} />
                                                    </div>

                                                    {trosak.napomena && (
                                                        <p
                                                            style={{
                                                                whiteSpace: "pre-wrap",
                                                                overflowWrap: "anywhere"
                                                            }}
                                                        >
                                                            {trosak.napomena}
                                                        </p>
                                                    )}

                                                    <div className="d-flex flex-wrap gap-2 mt-auto">
                                                        <Link
                                                            to={`${RouteNames.BUDZET_PROMJENA.replace(
                                                                ":sifra",
                                                                trosak.sifra
                                                            )}?putovanjeSifra=${putovanjeSifra}`}
                                                            className="btn btn-primary"
                                                        >
                                                            <FaPen />
                                                            {" "}Promijeni
                                                        </Link>

                                                        <Button
                                                            type="button"
                                                            variant="outline-danger"
                                                            disabled={brisanjeSifra !== null}
                                                            onClick={() => obrisi(trosak)}
                                                        >
                                                            <FaTrash />
                                                            {" "}
                                                            {brisanjeSifra === trosak.sifra
                                                                ? "Brisanje..."
                                                                : "Izbriši"}
                                                        </Button>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            )}
                        </section>
                    )}
                </>
            )}
        </section>
    )

}