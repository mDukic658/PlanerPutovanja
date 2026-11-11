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

    function promijeniPutovanje(e) {
        const novaSifra = e.target.value

        setSearchParams(
            novaSifra ? { putovanjeSifra: novaSifra } : {}
        )
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
                    <Form.Group
                        controlId="galerija-putovanje"
                        className="mb-4"
                    >
                        <Form.Label>Putovanje</Form.Label>

                        <Form.Select
                            value={putovanjeSifra}
                            onChange={promijeniPutovanje}
                        >
                            <option value="">Sva putovanja</option>

                            {putovanja.map(putovanje => (
                                <option
                                    key={putovanje.sifra}
                                    value={putovanje.sifra}
                                >
                                    {putovanje.naziv}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

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