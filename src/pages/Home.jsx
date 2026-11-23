import { useEffect, useState } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import PutovanjaService from "../services/putovanja/PutovanjaService"
import { RouteNames } from "../constants";
import { Link } from "react-router-dom";
import { FaPlaneDeparture } from "react-icons/fa6";
import { FaMapPin } from "react-icons/fa";
import { BsSuitcase2Fill } from "react-icons/bs";
import KartaPosjeta from "../components/karta/KartaPosjeta";
import KartaServis from "../services/karta/KartaServis"
import useAuth from "../hooks/useAuth";


export default function Home() {
    const { isLoggedIn } = useAuth()

    return isLoggedIn ? <PrijavljenaPocetna /> : <JavnaPocetna />
}

function JavnaPocetna() {
    return (
        <section className="py-5">
            <h1>Planer putovanja</h1>

            <p className="lead">
                Isplaniraj putovanje, složi dnevni itinerar i listu pakiranja
                te prati troškove na jednom mjestu.
            </p>

            <div className="d-flex flex-wrap gap-2">
                <Button as={Link} to={RouteNames.LOGIN} variant="primary">
                    Prijavi se
                </Button>

                <Button as={Link} to={RouteNames.O_APLIKACIJI} variant="outline-primary">
                    O aplikaciji
                </Button>
            </div>
        </section>
    )
}

function PrijavljenaPocetna() {
    const [putovanja, setPutovanja] = useState([])
    const [animiraniBrojevi, setAnimiraniBrojevi] = useState({
        putovanja: 0,
        nadolazeca: 0,
        drzave: 0
    })
    const [posjeti, setPosjeti] = useState([])
    const [ucitavanjeKarte, setUcitavanjeKarte] = useState(true)
    const [greskaKarte, setGreskaKarte] = useState("")

    useEffect(() => {
        ucitajPutovanja()
    }, [])

    useEffect(() => {
        let aktivno = true

        async function ucitajPosjete() {
            try {
                const odgovor = await KartaServis.get()

                if (aktivno) {
                    setPosjeti(odgovor.data)
                }
            } catch (error) {
                console.error(error)

                if (aktivno) {
                    setGreskaKarte("Učitavanje karte posjeta nije uspjelo.")
                }
            } finally {
                if (aktivno) {
                    setUcitavanjeKarte(false)
                }
            }
        }

        ucitajPosjete()

        return () => {
            aktivno = false
        }
    }, [])

    async function ucitajPutovanja() {
        const odgovor = await PutovanjaService.get()
        setPutovanja(odgovor.data)
    }

    const danas = new Date()
    danas.setHours(0, 0, 0, 0)

    const brojPutovanja = putovanja.length

    const brojNadolazecih = putovanja.filter((putovanje) => {
        const polazak = new Date(String(putovanje.datumPolaska).slice(0, 10) + "T00:00:00")
        return polazak >= danas
    }).length

    const zavrsenaPutovanja = putovanja.filter((putovanje) => {
        const povratak = new Date(String(putovanje.datumPovratka).slice(0, 10) + "T00:00:00")
        return povratak < danas
    })

    const brojPosjecenihDrzava = new Set(
        zavrsenaPutovanja
            .map((putovanje) => putovanje.drzava.trim().toLowerCase())
            .filter((drzava) => drzava !== "")
    ).size

    useEffect(() => {

        const trajanje = 1000
        let pocetak = null
        let animacija

        function animiraj(vrijeme) {

            if (pocetak === null) {
                pocetak = vrijeme
            }

            const napredak = Math.min((vrijeme - pocetak) / trajanje, 1)

            setAnimiraniBrojevi({
                putovanja: Math.round(napredak * brojPutovanja),
                nadolazeca: Math.round(napredak * brojNadolazecih),
                drzave: Math.round(napredak * brojPosjecenihDrzava)
            })

            if (napredak < 1) {
                animacija = requestAnimationFrame(animiraj)
            }
        }

        animacija = requestAnimationFrame(animiraj)

        return () => cancelAnimationFrame(animacija)

    }, [brojPutovanja, brojNadolazecih, brojPosjecenihDrzava])

    const statistika = [
        {
            naziv: "Ukupno putovanja",
            broj: animiraniBrojevi.putovanja,
            ikona: <BsSuitcase2Fill />
        },
        {
            naziv: "Nadolazeća putovanja",
            broj: animiraniBrojevi.nadolazeca,
            ikona: <FaPlaneDeparture />
        },
        {
            naziv: "Posjećene države",
            broj: animiraniBrojevi.drzave,
            ikona: <FaMapPin />
        }
    ]

    return (
        <>
            <Row className="g-4 align-items-center mb-5">
                <Col xs={12} lg={5}>
                    <h1>Planer putovanja</h1>

                    <p>Otvori svoja putovanja, provjeri kalendar ili isplaniraj novi put.</p>

                    <div className="d-flex flex-wrap gap-2">
                        <Button as={Link} to={RouteNames.PUTOVANJA_DODAJ} variant="primary">
                            <FaPlaneDeparture aria-hidden="true" />
                            {" "}Novo putovanje
                        </Button>

                        <Button as={Link} to={RouteNames.PUTOVANJA} variant="outline-primary">
                            Moja putovanja
                        </Button>

                        <Button as={Link} to={RouteNames.KALENDAR} variant="outline-primary">
                            Kalendar
                        </Button>
                    </div>
                </Col>

                <Col xs={12} lg={7}>
                    <section aria-labelledby="pocetna-karta-naslov">
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                            <h2
                                id="pocetna-karta-naslov"
                                className="h5 mb-0"
                            >
                                <FaMapPin />
                                {" "}Moja karta posjeta
                            </h2>

                            <Link to={RouteNames.KARTA_POSJETA}>
                                Otvori kartu posjeta
                            </Link>
                        </div>

                        {ucitavanjeKarte ? (
                            <p role="status">Učitavanje karte...</p>
                        ) : greskaKarte ? (
                            <p className="text-danger" role="alert">
                                {greskaKarte}
                            </p>
                        ) : (
                            <>
                                <KartaPosjeta
                                    posjeti={posjeti}
                                    visina={320}
                                />

                                {posjeti.length === 0 && (
                                    <p className="text-muted small mt-2 mb-0">
                                        Još nema zabilježenih posjeta.
                                        Dodaj prvi posjet kroz kartu posjeta.
                                    </p>
                                )}
                            </>
                        )}
                    </section>
                </Col>
            </Row>

            <Row className="g-3 mb-4">
                {statistika.map((stavka) => (
                    <Col xs={12} md={4} key={stavka.naziv}>
                        <Card className="h-100 border-0 shadow-sm">
                            <Card.Body className="text-center py-4">
                                <div className="fs-2 text-primary mb-2">
                                    {stavka.ikona}
                                </div>

                                <h2 className="fw-bold mb-1">
                                    {stavka.broj}
                                </h2>

                                <p className="text-muted mb-0">
                                    {stavka.naziv}
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </>
    )

}