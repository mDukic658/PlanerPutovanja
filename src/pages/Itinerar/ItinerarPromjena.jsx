import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom"
import { Button, Card, Form } from "react-bootstrap";
import ItinerarService from "../../services/itinerar/ItinerarService"
import { RouteNames } from "../../constants"

export default function ItinerarPromjena() {

    const navigate = useNavigate()
    const { sifra } = useParams()
    const [searchParams] = useSearchParams()

    const putovanjeSifra = searchParams.get('putovanjeSifra')

    const [stavka, setStavka] = useState({
        putovanjeSifra: "",
        dan: 1,
        vrijeme: "",
        naziv: "",
        biljeska: ""
    })

    useEffect(() => {
        ucitajStavku()
    }, [sifra])

    async function ucitajStavku() {
        const odgovor = await ItinerarService.getBySifra(sifra)

        if (odgovor.data) {
            setStavka(odgovor.data)
        }
    }

    function promijeniVrijednost(e) {
        const { name, value } = e.target

        setStavka(stara => ({
            ...stara,
            [name]: value
        }))
    }

    async function spremi(e) {
        e.preventDefault()

        const promijenjenaStavka = {
            ...stavka,
            putovanjeSifra: parseInt(stavka.putovanjeSifra, 10),
            dan: parseInt(stavka.dan, 10)
        }

        await ItinerarService.promijeni(sifra, promijenjenaStavka)


        navigate(
            putovanjeSifra
                ? `${RouteNames.ITINERAR}?putovanjeSifra=${putovanjeSifra}`
                : RouteNames.ITINERAR
        )

    }

    return (
        <>
            <h2 className="my-3">Promjena stavke itinerara</h2>

            <Card>
                <Card.Body>
                    <Form onSubmit={spremi}>

                        <Form.Group className="mb-3">
                            <Form.Label>Dan</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                name="dan"
                                value={stavka.dan}
                                onChange={promijeniVrijednost}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Vrijeme</Form.Label>
                            <Form.Control
                                type="time"
                                name="vrijeme"
                                value={stavka.vrijeme || ""}
                                onChange={promijeniVrijednost}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Naziv</Form.Label>
                            <Form.Control
                                type="text"
                                name="naziv"
                                value={stavka.naziv}
                                onChange={promijeniVrijednost}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Bilješka</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="biljeska"
                                value={stavka.biljeska || ""}
                                onChange={promijeniVrijednost}
                            />
                        </Form.Group>

                        <Button type="submit" variant="success">
                            Spremi promjene
                        </Button>

                        <Link
                            to={
                                putovanjeSifra
                                    ? `${RouteNames.ITINERAR}?putovanjeSifra=${putovanjeSifra}`
                                    : RouteNames.ITINERAR
                            }
                            className="btn btn-danger ms-2"
                        >
                            Odustani
                        </Link>

                    </Form>
                </Card.Body>
            </Card>
        </>
    )
}