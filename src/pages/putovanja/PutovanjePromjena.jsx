import { Button, Col, Form, Row } from "react-bootstrap"
import { Link, useNavigate, useParams } from "react-router-dom"
import { RouteNames } from "../../constants"
import PutovanjaService from "../../services/putovanja/PutovanjaService"
import DrzaveService from "../../services/drzave/DrzaveService"
import { useState, useEffect } from "react"
import PretragaDrzava from "../../components/PretragaDrzava"
import { FaPen, FaSave, FaTimes, FaArrowLeft } from "react-icons/fa"
import { useObavijesti } from "../../components/Obavijesti"

export default function PutovanjePromjena({
    pocetnaSifra,
    onSpremi,
    onOdustani
}) {

    const navigate = useNavigate()
    const obavijesti = useObavijesti()
    const params = useParams()
    const sifra = pocetnaSifra ?? params.sifra
    const [putovanje, setPutovanje] = useState(null)
    const [ucitavanje, setUcitavanje] = useState(true)
    const [greska, setGreska] = useState('')
    const [drzave, setDrzave] = useState([])

    async function ucitajPutovanje() {
        setUcitavanje(true)
        setGreska('')

        try {
            const odgovor = await PutovanjaService.getBySifra(sifra)
            const podaci = odgovor.data

            if (!podaci) {
                setPutovanje(null)
                return
            }

            setPutovanje({
                ...podaci,
                datumPolaska: podaci.datumPolaska.slice(0, 10),
                datumPovratka: podaci.datumPovratka.slice(0, 10)
            })
        } catch (error) {
            console.error(error)
            setGreska("Učitavanje putovanja nije uspjelo.")
        } finally {
            setUcitavanje(false)
        }
    }

    async function ucitajDrzave() {
        const odgovor = await DrzaveService.get()
        setDrzave(odgovor.data)
    }

    useEffect(() => {
        ucitajPutovanje()
        ucitajDrzave()
    }, [sifra])

    function odustani() {
        if (onOdustani) {
            onOdustani()
        } else {
            navigate(RouteNames.PUTOVANJA)
        }
    }

    async function promijeni(putovanje) {
        try {
            await PutovanjaService.promijeni(sifra, putovanje)

            obavijesti("Promjene putovanja su spremljene.")

            if (onSpremi) {
                await onSpremi()
            } else {
                navigate(RouteNames.PUTOVANJA)
            }

        } catch (error) {
            console.error(error)
            obavijesti(
                error.message || "Spremanje promjena nije uspjelo.",
                "danger"
            )
        }
    }

    function obradiSubmit(e) {
        e.preventDefault()

        const podaci = new FormData(e.currentTarget)

        const naziv = String(podaci.get('naziv') || '').trim()
        const destinacija = String(podaci.get('destinacija') || '').trim()
        const drzava = String(podaci.get('drzava') || '').trim()
        const datumPolaska = String(podaci.get('datumPolaska') || '')
        const datumPovratka = String(podaci.get('datumPovratka') || '')
        const unosBudzeta = String(podaci.get('budzet') || '').trim()

        if (naziv.length < 3 || naziv.length > 50) {
            obavijesti(
                "Naziv mora imati između 3 i 50 znakova.",
                "danger"
            )
            return
        }

        if (destinacija.length < 2 || destinacija.length > 50) {
            obavijesti(
                "Destinacija mora imati između 2 i 50 znakova.",
                "danger"
            )
            return
        }

        if (!drzava) {
            obavijesti("Morate odabrati državu!", "danger")
            return
        }

        if (!datumPolaska || !datumPovratka) {
            obavijesti(
                "Morate odabrati datum polaska i povratka.",
                "danger"
            )
            return
        }

        const polazak = new Date(datumPolaska)
        const povratak = new Date(datumPovratka)

        if (
            Number.isNaN(polazak.getTime()) ||
            Number.isNaN(povratak.getTime())
        ) {
            obavijesti("Datumi nisu ispravni.", "danger")
            return
        }

        if (povratak < polazak) {
            obavijesti(
                "Datum povratka ne može biti prije datuma polaska.",
                "danger"
            )
            return
        }

        if (unosBudzeta === '') {
            obavijesti("Budžet je obavezan.", "danger")
            return
        }

        const budzet = Number(unosBudzeta)

        if (!Number.isFinite(budzet) || budzet < 0 || budzet > 100000) {
            obavijesti(
                "Budžet mora biti broj između 0 i 100000 €.",
                "danger"
            )
            return
        }

        promijeni({
            naziv,
            destinacija,
            drzava,
            datumPolaska: polazak.toISOString(),
            datumPovratka: povratak.toISOString(),
            budzet
        })
    }

    if (ucitavanje) {
        return <p>Učitavanje...</p>
    }

    if (greska || !putovanje) {
        return (
            <section className="promjena-putovanja">
                <Button
                    variant="link"
                    className="natrag-na-pregled"
                    onClick={odustani}
                >
                    <FaArrowLeft />
                    {" "}Natrag
                </Button>

                <p role="alert">
                    {greska || "Putovanje nije pronađeno. Možda je obrisano."}
                </p>
            </section>
        )
    }

    return (
        <section className="promjena-putovanja">

            {!onOdustani && (
                <Link
                    to={RouteNames.PUTOVANJA}
                    className="natrag-na-pregled"
                >
                    <FaArrowLeft />
                    Natrag na pregled putovanja
                </Link>
            )}

            <h2 className="promjena-putovanja-naslov">
                <FaPen />
                Promjena putovanja
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
                                required
                                defaultValue={putovanje.naziv}
                            />
                        </Form.Group>
                    </Col>

                    <Col xs={12} md={6}>
                        <Form.Group controlId="destinacija">
                            <Form.Label>Destinacija</Form.Label>
                            <Form.Control
                                type="text"
                                name="destinacija"
                                defaultValue={putovanje.destinacija}
                            />
                        </Form.Group>
                    </Col>

                    <Col xs={12} md={6}>
                        <Form.Group controlId="drzava">
                            <PretragaDrzava
                                drzave={drzave}
                                odabranaDrzava={putovanje.drzava}
                                onOdaberi={(drzava) =>
                                    setPutovanje({
                                        ...putovanje,
                                        drzava: drzava
                                    })
                                }
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
                                defaultValue={putovanje.datumPolaska}
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
                                defaultValue={putovanje.datumPovratka}
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
                                defaultValue={putovanje.budzet}
                            />
                        </Form.Group>
                    </Col>

                </Row>

                <div className="putovanje-obrazac-akcije">
                    <Button
                        type="button"
                        variant="outline-secondary"
                        onClick={odustani}
                    >
                        <FaTimes />
                        Odustani
                    </Button>

                    <Button type="submit" variant="primary">
                        <FaSave />
                        Spremi promjene
                    </Button>
                </div>

            </Form>
        </section>
    )
}