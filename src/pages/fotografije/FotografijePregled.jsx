import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Button, Card, Col, Form, Row, Modal } from "react-bootstrap"
import { FaPlus, FaPen, FaTrash } from "react-icons/fa"
import { RouteNames } from "../../constants"
import FotografijeService from "../../services/fotografije/FotografijeService"
import PutovanjaService from "../../services/putovanja/PutovanjaService"
import { useObavijesti } from "../../components/Obavijesti"

export default function FotografijePregled() {
    const [searchParams, setSearchParams] = useSearchParams()
    const putovanjeSifra = searchParams.get("putovanjeSifra") || ""

    const [fotografije, setFotografije] = useState([])
    const [putovanja, setPutovanja] = useState([])
    const [ucitavanje, setUcitavanje] = useState(true)
    const [greska, setGreska] = useState("")
    const [otvorenaSifra, setOtvorenaSifra] = useState(null)
    const [pretragaPutovanje, setPretragaPutovanje] = useState("")
    const [prikaziAutocomplete, setPrikaziAutocomplete] = useState(false)
    const [odabraniIndex, setOdabraniIndex] = useState(-1)

    const obavijesti = useObavijesti()

    useEffect(() => {
        let aktivno = true

        async function ucitajPodatke() {
            setUcitavanje(true)
            setGreska("")

            try {
                const [odgovorFotografija, odgovorPutovanja] =
                    await Promise.all([
                        FotografijeService.get(),
                        PutovanjaService.get()
                    ])

                if (aktivno) {
                    setFotografije(odgovorFotografija.data)
                    setPutovanja(odgovorPutovanja.data)
                }
            } catch (error) {
                console.error(error)

                if (aktivno) {
                    setGreska("Učitavanje galerije nije uspjelo.")
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

    const prikazaneFotografije = putovanjeSifra
        ? fotografije.filter(
            fotografija =>
                Number(fotografija.putovanjeSifra) === Number(putovanjeSifra)
        )
        : fotografije

    const trenutniIndeks = prikazaneFotografije.findIndex(
        fotografija => fotografija.sifra === otvorenaSifra
    )

    const otvorenaFotografija = prikazaneFotografije[trenutniIndeks]

    function promijeniSliku(pomak) {
        if (trenutniIndeks === -1 || prikazaneFotografije.length === 0) {
            return
        }

        const noviIndeks = (
            trenutniIndeks + pomak + prikazaneFotografije.length
        ) % prikazaneFotografije.length

        setOtvorenaSifra(prikazaneFotografije[noviIndeks].sifra)
    }

    const poveznicaDodavanja = putovanjeSifra
        ? `${RouteNames.FOTOGRAFIJE_NOVO}?putovanjeSifra=${putovanjeSifra}`
        : RouteNames.FOTOGRAFIJE_NOVO

    const odabranoPutovanje = putovanja.find(
        putovanje => Number(putovanje.sifra) === Number(putovanjeSifra)
    )

    const filtriranaPutovanja = [...putovanja]
        .sort(
            (a, b) =>
                new Date(b.datumPolaska) - new Date(a.datumPolaska)
        )
        .filter(putovanje =>
            putovanje.naziv
                .toLowerCase()
                .includes(pretragaPutovanje.trim().toLowerCase())
        )

    function odaberiPutovanje(sifra) {
        setSearchParams(prethodni => {
            const novi = new URLSearchParams(prethodni)

            if (sifra) {
                novi.set("putovanjeSifra", String(sifra))
            } else {
                novi.delete("putovanjeSifra")
            }

            return novi
        })

        setOtvorenaSifra(null)
        setPretragaPutovanje("")
        setPrikaziAutocomplete(false)
        setOdabraniIndex(-1)
    }

    function obradiTipkuPutovanja(e) {
        if (e.key === "Escape") {
            setPrikaziAutocomplete(false)
            setOdabraniIndex(-1)
            return
        }

        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault()
            setPrikaziAutocomplete(true)

            if (filtriranaPutovanja.length === 0) {
                return
            }

            const pomak = e.key === "ArrowDown" ? 1 : -1

            setOdabraniIndex(prethodni => {
                if (prethodni === -1) {
                    return pomak === 1
                        ? 0
                        : filtriranaPutovanja.length - 1
                }

                return (
                    prethodni + pomak + filtriranaPutovanja.length
                ) % filtriranaPutovanja.length
            })

            return
        }

        if (
            e.key === "Enter" &&
            prikaziAutocomplete &&
            filtriranaPutovanja[odabraniIndex]
        ) {
            e.preventDefault()

            odaberiPutovanje(
                filtriranaPutovanja[odabraniIndex].sifra
            )
        }
    }

    async function obrisi(fotografija) {
        if (!confirm(`Obrisati fotografiju „${fotografija.naziv}”?`)) {
            return
        }

        try {
            await FotografijeService.obrisi(fotografija.sifra)

            setFotografije(prethodne =>
                prethodne.filter(
                    stavka => stavka.sifra !== fotografija.sifra
                )
            )

            obavijesti("Fotografija je obrisana.")
        } catch (error) {
            console.error(error)
            obavijesti("Brisanje fotografije nije uspjelo.", "danger")
        }
    }

    useEffect(() => {
        if (!otvorenaFotografija) {
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
                trenutniIndeks + pomak + prikazaneFotografije.length
            ) % prikazaneFotografije.length

            setOtvorenaSifra(prikazaneFotografije[noviIndeks].sifra)
        }

        document.addEventListener("keydown", obradiTipku)

        return () => {
            document.removeEventListener("keydown", obradiTipku)
        }
    }, [otvorenaFotografija, trenutniIndeks, prikazaneFotografije])

    return (
        <section className="fotografije-pregled">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <h2 className="mb-0">Galerija fotografija</h2>

                <Link
                    to={poveznicaDodavanja}
                    className="btn btn-primary"
                >
                    <FaPlus />
                    {" "}Dodaj fotografiju
                </Link>
            </div>

            {ucitavanje ? (
                <p>Učitavanje...</p>
            ) : greska ? (
                <p role="alert">{greska}</p>
            ) : (
                <>
                    <div className="itinerar-odabir mb-4">
                        <Form.Group
                            controlId="galerija-putovanje"
                            className="position-relative"
                        >
                            <Form.Label>Odaberi putovanje</Form.Label>

                            <Form.Control
                                type="text"
                                placeholder="Pretraži putovanja..."
                                value={pretragaPutovanje}
                                onChange={e => {
                                    setPretragaPutovanje(e.target.value)
                                    setOdabraniIndex(-1)
                                    setPrikaziAutocomplete(true)
                                }}
                                onFocus={() => setPrikaziAutocomplete(true)}
                                onBlur={() => {
                                    setPrikaziAutocomplete(false)
                                    setOdabraniIndex(-1)
                                }}
                                onKeyDown={obradiTipkuPutovanja}
                                autoComplete="off"
                                role="combobox"
                                aria-autocomplete="list"
                                aria-expanded={prikaziAutocomplete}
                                aria-controls="galerija-prijedlozi"
                                aria-activedescendant={
                                    prikaziAutocomplete &&
                                        filtriranaPutovanja[odabraniIndex]
                                        ? `galerija-prijedlog-${odabraniIndex}`
                                        : undefined
                                }
                            />

                            {prikaziAutocomplete && (
                                <div
                                    id="galerija-prijedlozi"
                                    className="itinerar-prijedlozi"
                                    role="listbox"
                                    aria-label="Putovanja"
                                >
                                    {filtriranaPutovanja.map((putovanje, index) => (
                                        <div
                                            id={`galerija-prijedlog-${index}`}
                                            key={putovanje.sifra}
                                            role="option"
                                            aria-selected={index === odabraniIndex}
                                            className={
                                                index === odabraniIndex
                                                    ? "itinerar-prijedlog aktivan"
                                                    : "itinerar-prijedlog"
                                            }
                                            onMouseDown={e => e.preventDefault()}
                                            onMouseEnter={() => setOdabraniIndex(index)}
                                            onClick={() =>
                                                odaberiPutovanje(putovanje.sifra)
                                            }
                                        >
                                            {putovanje.naziv}
                                        </div>
                                    ))}

                                    {filtriranaPutovanja.length === 0 && (
                                        <div className="p-3">
                                            Nema pronađenih putovanja.
                                        </div>
                                    )}
                                </div>
                            )}
                        </Form.Group>

                        {odabranoPutovanje && (
                            <div className="itinerar-odabrano">
                                <strong>{odabranoPutovanje.naziv}</strong>

                                <span>
                                    {odabranoPutovanje.destinacija},
                                    {" "}{odabranoPutovanje.drzava}
                                </span>
                            </div>
                        )}

                        {putovanjeSifra && (
                            <Button
                                type="button"
                                variant="outline-primary"
                                className="mt-3"
                                onClick={() => odaberiPutovanje("")}
                            >
                                Prikaži sva putovanja
                            </Button>
                        )}
                    </div>

                    {prikazaneFotografije.length === 0 ? (
                        <p>
                            {putovanjeSifra
                                ? "Ovo putovanje još nema fotografija."
                                : "Još nema dodanih fotografija."}
                        </p>
                    ) : (
                        <Row className="g-4">
                            {prikazaneFotografije.map(fotografija => (
                                <Col
                                    key={fotografija.sifra}
                                    xs={12}
                                    md={6}
                                    lg={4}
                                >
                                    <Card className="h-100 border-0 shadow-sm">
                                        <Button
                                            type="button"
                                            className="border-0 p-0 bg-transparent w-100"
                                            aria-label={`Otvori fotografiju ${fotografija.naziv}`}
                                            onClick={() => setOtvorenaSifra(fotografija.sifra)}
                                        >
                                            <Card.Img
                                                variant="top"
                                                src={fotografija.slika}
                                                alt={fotografija.naziv}
                                                loading="lazy"
                                                style={{
                                                    height: 220,
                                                    objectFit: "cover"
                                                }}
                                            />
                                        </Button>

                                        <Card.Body className="d-flex flex-column">
                                            <Card.Title>
                                                {fotografija.naziv}
                                            </Card.Title>

                                            <p className="text-muted">
                                                {putovanja.find(
                                                    putovanje =>
                                                        Number(putovanje.sifra) ===
                                                        Number(fotografija.putovanjeSifra)
                                                )?.naziv || "Nepoznato putovanje"}
                                            </p>

                                            {fotografija.opis && (
                                                <Card.Text>
                                                    {fotografija.opis}
                                                </Card.Text>
                                            )}

                                            <div className="d-flex flex-wrap gap-2 mt-auto">
                                                <Link
                                                    to={RouteNames.FOTOGRAFIJE_PROMJENA.replace(
                                                        ":sifra",
                                                        fotografija.sifra
                                                    )}
                                                    className="btn btn-primary"
                                                >
                                                    <FaPen />
                                                    {" "}Promijeni
                                                </Link>

                                                <Button
                                                    variant="outline-danger"
                                                    onClick={() => obrisi(fotografija)}
                                                >
                                                    <FaTrash />
                                                    {" "}Izbriši
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </>
            )}

            <Modal
                show={Boolean(otvorenaFotografija)}
                onHide={() => setOtvorenaSifra(null)}
                size="xl"
                centered
                className="galerija-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
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
                        disabled={prikazaneFotografije.length < 2}
                        onClick={() => promijeniSliku(-1)}
                    >
                        ← Prethodna
                    </Button>

                    <span>
                        {trenutniIndeks + 1} / {prikazaneFotografije.length}
                    </span>

                    <Button
                        type="button"
                        variant="outline-primary"
                        disabled={prikazaneFotografije.length < 2}
                        onClick={() => promijeniSliku(1)}
                    >
                        Sljedeća →
                    </Button>
                </Modal.Footer>
            </Modal>

        </section>
    )
}