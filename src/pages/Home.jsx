import { useEffect, useState } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import PutovanjaService from "../services/putovanja/PutovanjaService"
import { RouteNames } from "../constants";
import { Link } from "react-router-dom";
import { FaPlaneDeparture } from "react-icons/fa6";
import { FaMapPin } from "react-icons/fa";
import { BsSuitcase2Fill } from "react-icons/bs";
import { GiAirplaneArrival, GiAirplaneDeparture } from "react-icons/gi";
import { TbMoneybag } from "react-icons/tb";


export default function Home() {

    const [putovanja, setPutovanja] = useState([])
    const [animiraniBrojevi, setAnimiraniBrojevi] = useState({
        putovanja: 0,
        nadolazeca: 0,
        drzave: 0
    })

    useEffect(() => {
        ucitajPutovanja()
    }, [])

    async function ucitajPutovanja() {
        const odgovor = await PutovanjaService.get()
        setPutovanja(odgovor.data)
    }

    const danas = new Date()
    danas.setHours(0, 0, 0, 0)

    const brojPutovanja = putovanja.length

    const brojNadolazecih = putovanja.filter((putovanje) => {
        const polazak = new Date(putovanje.datumPolaska + "T00:00:00")
        return polazak >= danas
    }).length

    const zavrsenaPutovanja = putovanja.filter((putovanje) => {
        const povratak = new Date(putovanje.datumPovratka + "T00:00:00")
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
        <div className="mb-5">
            <h1>Planer putovanja</h1>

            <p>
                Isplaniraj svoje putovanje, organiziraj lokacije, pakiranje, aktivnosti i troškove na jednom mjestu.
            </p>

            <Button
                as={Link}
                to={RouteNames.PUTOVANJA_DODAJ}
                variant="primary">
                <FaPlaneDeparture /> Novo putovanje
            </Button>
        </div>

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

        <h2 className="mt-4">
            <BsSuitcase2Fill />
            Moja putovanja
        </h2>

        {putovanja.length === 0 ? (
            <p>Trenutno nemaš niti jedno putovanje.</p>
        ) : (
            <Row>
                {putovanja.map((putovanje) => (
                    <Col md={4} key={putovanje.sifra} className="mb-4">
                        <Card>
                            <Card.Body>
                                <Card.Title>
                                    {putovanje.naziv}
                                </Card.Title>

                                <Card.Text>
                                    <FaMapPin />
                                    {putovanje.destinacija}, {putovanje.drzava}
                                </Card.Text>

                                <Card.Text>
                                    <GiAirplaneDeparture />
                                    Datum polaska: {putovanje.datumPolaska}
                                </Card.Text>

                                <Card.Text>
                                    <GiAirplaneArrival />
                                    Datum povratka: {putovanje.datumPovratka}
                                </Card.Text>

                                <Card.Text>
                                    <TbMoneybag />
                                    Budžet: {putovanje.budzet} €
                                </Card.Text>

                                <Button
                                    as={Link}
                                    to={RouteNames.PUTOVANJA_PROMIJENA.replace(
                                        ":sifra",
                                        putovanje.sifra
                                    )}
                                    variant="outline-primary"
                                >
                                    Pregledaj putovanje
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        )}

    </>
)

}