import { Button, Col, Form, Row } from "react-bootstrap"
import { Link, useNavigate } from "react-router-dom"
import { RouteNames } from "../../constants"
import PutovanjaService from "../../services/putovanja/PutovanjaService"
import DrzaveService from '../../services/drzave/DrzaveService'
import { useEffect, useState } from "react"
import PretragaDrzava from "../../components/PretragaDrzava"
import { FaArrowLeft, FaPlaneDeparture, FaPlus, FaTimes } from "react-icons/fa"
import { useObavijesti } from "../../components/Obavijesti"


export default function NovoPutovanje() {

    const navigate = useNavigate()

    const obavijesti = useObavijesti()
    const [drzave, setDrzave] = useState([])
    const [odabranaDrzava, setOdabranaDrzava] = useState("")
    const [odabraniGrad, setOdabraniGrad] = useState(null)
    const [countryid, setCountryid] = useState(0)
    const [stateid, setStateid] = useState(0)

    async function ucitajDrzave() {
        const odgovor = await DrzaveService.get()
        setDrzave(odgovor.data)
    }

    useEffect(() => {
        ucitajDrzave()
    }, [])

    async function dodaj(putovanje) {
        try {
            await PutovanjaService.dodaj(putovanje)

            obavijesti("Putovanje je uspješno dodano.")
            navigate(RouteNames.PUTOVANJA)
        } catch (error) {
            console.error(error)
            obavijesti("Dodavanje putovanja nije uspjelo.", "danger")
        }
    }

    function obradiSubmit(e) {
        e.preventDefault()
        const podaci = new FormData(e.target)

        if (!podaci.get('naziv') || podaci.get('naziv').trim().length === 0) {
            alert("Naziv je obavezan i ne smije sadržavati samo razmake!")
            return
        }

        if (podaci.get('naziv').trim().length < 3 || podaci.get('naziv').trim().length > 50) {
            alert("Naziv mora imati najmanje 3 znaka i najviše 50!")
            return
        }



        if (!podaci.get('destinacija') || podaci.get('destinacija').trim().length === 0) {
            alert("Destinacija je obavezna!")
            return
        }

        if (podaci.get('destinacija').trim().length < 2 || podaci.get('destinacija').trim().length > 50) {
            alert("Destinacija mora imati najmanje 2 znaka i najviše 50!")
            return
        }



        if (!podaci.get('drzava') || podaci.get('drzava') === "") {
            alert("Morate odabrati državu!")
            return
        }


        const datumPolaska = new Date(podaci.get('datumPolaska'))
        const danas = new Date()
        danas.setHours(0, 0, 0, 0)

        if (datumPolaska < danas) {
            alert("Datum polaska ne može biti u prošlosti!")
            return
        }

        if (!podaci.get('datumPolaska') || podaci.get('datumPolaska') === "") {
            alert("Morate odabrati datum polaska!")
            return
        }



        if (!podaci.get('datumPovratka') || podaci.get('datumPovratka') === "") {
            alert("Morate odabrati datum povratka!")
            return
        }

        const datumPovratka = new Date(podaci.get('datumPovratka'))

        if (datumPovratka < datumPolaska) {
            alert("Datum povratka mora biti nakon datuma polaska!")
            return
        }



        if (!podaci.get('budzet') || podaci.get('budzet') === "") {
            alert("Budžet je obavezan!")
            return
        }

        if (isNaN(podaci.get('budzet')) || podaci.get('budzet') < 0) {
            alert("Budžet ne može biti negativan broj!")
            return
        }

        if (podaci.get('budzet') > 100000) {
            alert("Budžet ne može biti veći od 100000 €!")
            return
        }

        dodaj({
            naziv: podaci.get('naziv'),
            destinacija: podaci.get('destinacija'),
            drzava: podaci.get('drzava'),
            datumPolaska: new Date(podaci.get('datumPolaska')).toISOString(),
            datumPovratka: new Date(podaci.get('datumPovratka')).toISOString(),
            budzet: parseFloat(podaci.get('budzet'))
        })
    }

    return (
        <section className="novo-putovanje">

            <Link
                to={RouteNames.PUTOVANJA}
                className="natrag-na-pregled"
            >
                <FaArrowLeft />
                Natrag na pregled putovanja
            </Link>

            <h2 className="novo-putovanje-naslov">
                <FaPlaneDeparture />
                Dodavanje novog putovanja
            </h2>

            <Form
                onSubmit={obradiSubmit}
                className="putovanje-obrazac"
            >
                <Row className="g-3">

                    <Col xs={12}>
                        <Form.Group controlId="naziv">
                            <Form.Label>Naziv</Form.Label>
                            <Form.Control
                                type="text"
                                name="naziv"
                                placeholder="Npr. Ljetovanje u Italiji"
                                required
                            />
                        </Form.Group>
                    </Col>

                    <Col xs={12} md={6}>
                        <Form.Group controlId="drzava">
                            <PretragaDrzava
                                drzave={drzave}
                                odabranaDrzava={odabranaDrzava}
                                onOdaberi={setOdabranaDrzava}
                            />
                        </Form.Group>
                    </Col>

                    <Col xs={12} md={6}>
                        <Form.Group controlId="destinacija">
                            <Form.Label>Destinacija</Form.Label>
                            <Form.Control
                                type="text"
                                name="destinacija"
                                placeholder="Npr. Rim"
                            />
                        </Form.Group>
                    </Col>

                    <Col xs={12} md={6}>
                        <Form.Group controlId="datumPolaska">
                            <Form.Label>Datum polaska</Form.Label>
                            <Form.Control
                                type="date"
                                onClick={(e) => e.target.showPicker()}
                                onFocus={(e) => e.target.showPicker()}
                                name="datumPolaska"
                            />
                        </Form.Group>
                    </Col>

                    <Col xs={12} md={6}>
                        <Form.Group controlId="datumPovratka">
                            <Form.Label>Datum povratka</Form.Label>
                            <Form.Control
                                type="date"
                                onClick={(e) => e.target.showPicker()}
                                onFocus={(e) => e.target.showPicker()}
                                name="datumPovratka"
                            />
                        </Form.Group>
                    </Col>

                    <Col xs={12} md={6}>
                        <Form.Group controlId="budzet">
                            <Form.Label>Budžet (€)</Form.Label>
                            <Form.Control
                                type="number"
                                name="budzet"
                                step={0.01}
                                placeholder="Npr. 800"
                            />
                        </Form.Group>
                    </Col>

                </Row>

                <div className="putovanje-obrazac-akcije">
                    <Link
                        to={RouteNames.PUTOVANJA}
                        className="btn btn-outline-secondary"
                    >
                        <FaTimes />
                        Odustani
                    </Link>

                    <Button type="submit" variant="primary">
                        <FaPlus />
                        Dodaj putovanje
                    </Button>
                </div>

            </Form>
        </section>
    )

}