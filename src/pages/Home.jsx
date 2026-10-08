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

    useEffect(() => {
        ucitajPutovanja()
    }, [])

    async function ucitajPutovanja() {
        const odgovor = await PutovanjaService.get()
        setPutovanja(odgovor.data)
    }

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
                                        <FaMapPin/>
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