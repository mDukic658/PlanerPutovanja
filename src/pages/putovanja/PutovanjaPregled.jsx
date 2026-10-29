import { useEffect, useState } from "react"
import PutovanjaService from "../../services/putovanja/PutovanjaService"
import { Button, Badge, Card, Col, Row, Pagination } from "react-bootstrap"
import FormatDatuma from "../../components/FormatDatuma"
import { NumericFormat } from "react-number-format"
import { Link, useNavigate } from "react-router-dom"
import { RouteNames } from "../../constants"
import { BsSuitcase2Fill } from "react-icons/bs"
import { FaPlus, FaPen, FaTrash, FaCamera } from "react-icons/fa"
import { useObavijesti } from "../../components/Obavijesti"

export default function PutovanjePregled() {

    const [putovanja, setPutovanja] = useState([])

    const [trenutnaStranica, setTrenutnuStranicu] = useState(1)
    const [ukupnoStranica, setUkupnoStranica] = useState(0)
    const [ukupnoStavki, setUkupnoStavki] = useState(0)

    const velicinaStranice = 6

    const navigate = useNavigate()
    const obavijesti = useObavijesti()

    useEffect(() => {
        ucitajPutovanja(trenutnaStranica).catch((error) => {
            console.error(error)
            obavijesti("Učitavanje putovanja nije uspjelo.", "danger")
        })
    }, [trenutnaStranica])

    async function ucitajPutovanja(stranica) {
        const odgovor = await PutovanjaService.dohvatiStranicu(
            stranica,
            velicinaStranice
        )

        setPutovanja(odgovor.data)
        setUkupnoStranica(odgovor.ukupnoStranica)
        setUkupnoStavki(odgovor.ukupnoStavki)
    }

    function promijeniStranicu(stranica) {
        setTrenutnuStranicu(stranica)
    }

    async function obrisi(sifra) {
        if (!confirm("Sigurno obrisati?")) {
            return
        }

        try {
            await PutovanjaService.obrisi(sifra)
        } catch (error) {
            console.error(error)
            obavijesti("Brisanje putovanja nije uspjelo.", "danger")
            return
        }

        obavijesti("Putovanje je obrisano.")

        const noveUkupneStavke = ukupnoStavki - 1

        const noveUkupneStranice = Math.max(
            1,
            Math.ceil(noveUkupneStavke / velicinaStranice)
        )

        if (trenutnaStranica > noveUkupneStranice) {
            setTrenutnuStranicu(noveUkupneStranice)
        } else {
            try {
                await ucitajPutovanja(trenutnaStranica)
            } catch (error) {
                console.error(error)
                obavijesti(
                    "Putovanje je obrisano, ali osvježavanje popisa nije uspjelo.",
                    "danger"
                )
            }
        }
    }

    return (
        <section className="pregled-putovanja" >

            <div className="putovanje-zaglavlje" >
                <h2>
                    <BsSuitcase2Fill />
                    {" "} Putovanja
                </h2>

                <Link to={RouteNames.PUTOVANJA_DODAJ}
                    className="btn btn-primary"
                >
                    <FaPlus />
                    {" "}  Novo Putovanje
                </Link>
            </div>

            {putovanja.length === 0 ? (
                <p className="putovanja-prazno">
                    Trenutno nemaš niti jedno putovanje.
                </p>
            ) : (
                <Row className="g-4">
                    {putovanja.map((p) => (
                        <Col
                            xs={12}
                            md={6}
                            lg={4}
                            key={p.sifra}
                        >
                            <Card className="h-100 border-0 shadow-sm">

                                <div
                                    className="d-flex flex-column align-items-center justify-content-center bg-body-secondary text-secondary rounded-top"
                                    style={{ height: "180px" }}
                                >
                                    <FaCamera
                                        size={32}
                                        aria-hidden="true"
                                    />

                                    <span className="mt-2">
                                        Fotografija putovanja
                                    </span>
                                </div>

                                <Card.Body className="d-flex flex-column">

                                    <Card.Title>
                                        {p.naziv}
                                    </Card.Title>

                                    <p className="text-muted">
                                        {p.destinacija}, {p.drzava}
                                    </p>

                                    <div className="mb-2">
                                        <strong>Polazak: </strong>
                                        <FormatDatuma
                                            datum={p.datumPolaska}
                                        />
                                    </div>

                                    <div className="mb-2">
                                        <strong>Povratak: </strong>
                                        <FormatDatuma
                                            datum={p.datumPovratka}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <strong>Budžet: </strong>

                                        <NumericFormat
                                            value={p.budzet}
                                            displayType="text"
                                            decimalSeparator=","
                                            decimalScale={2}
                                            fixedDecimalScale
                                            thousandSeparator="."
                                            suffix=" €"
                                        />
                                    </div>

                                    <div className="d-flex flex-wrap gap-2 mt-auto">
                                        <Button
                                            onClick={() =>
                                                navigate(
                                                    `/putovanja/${p.sifra}`
                                                )
                                            }
                                        >
                                            <FaPen />
                                            {" "}Promijeni
                                        </Button>

                                        <Button
                                            variant="outline-danger"
                                            onClick={() => obrisi(p.sifra)}
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

            {ukupnoStranica > 1 && (
                <nav
                    aria-label="Stranice putovanja"
                    className="mt-4"
                >
                    <Pagination className="justify-content-center flex-wrap">

                        <Pagination.First
                            disabled={trenutnaStranica === 1}
                            onClick={() => promijeniStranicu(1)}
                        />

                        <Pagination.Prev
                            disabled={trenutnaStranica === 1}
                            onClick={() =>
                                promijeniStranicu(trenutnaStranica - 1)
                            }
                        />

                        {Array.from(
                            { length: ukupnoStranica },
                            (_, indeks) => {
                                const brojStranice = indeks + 1

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
                                            active={
                                                brojStranice === trenutnaStranica
                                            }
                                            onClick={() =>
                                                promijeniStranicu(brojStranice)
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
                            }
                        )}

                        <Pagination.Next
                            disabled={
                                trenutnaStranica === ukupnoStranica
                            }
                            onClick={() =>
                                promijeniStranicu(trenutnaStranica + 1)
                            }
                        />

                        <Pagination.Last
                            disabled={
                                trenutnaStranica === ukupnoStranica
                            }
                            onClick={() =>
                                promijeniStranicu(ukupnoStranica)
                            }
                        />

                    </Pagination>
                </nav>
            )}

            <div className="putovanja-ukupno mt-4">
                Ukupno{" "}
                <Badge pill bg="success">
                    {ukupnoStavki}
                </Badge>
                {" "}putovanja
            </div>
        </section>
    )
}