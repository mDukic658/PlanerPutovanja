import { Button, Col, Form, Row } from "react-bootstrap"
import { Link, useNavigate, useParams } from "react-router-dom"
import { RouteNames } from "../../constants"
import PutovanjaService from "../../services/putovanja/PutovanjaService"
import DrzaveService from "../../services/drzave/DrzaveService"
import { useState, useEffect } from "react"
import PretragaDrzava from "../../components/obrasci/PretragaDrzava"
import { FaPen, FaSave, FaTimes, FaArrowLeft } from "react-icons/fa"
import { useObavijesti } from "../../components/zajednicko/Obavijesti"
import SlikaUploader from "../../components/obrasci/SlikaUploader"
import { ShemaPutovanje } from "../../schemas/ShemaPutovanje"

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
    const [greske, setGreske] = useState({})

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

    function ocistiGresku(polje) {
        setGreske(prethodne => {
            const nove = { ...prethodne }
            delete nove[polje]
            return nove
        })
    }

    function obradiSubmit(e) {
        e.preventDefault()
        setGreske({})

        const podaci = new FormData(e.currentTarget)
        const rezultat = ShemaPutovanje.safeParse(
            Object.fromEntries(podaci)
        )

        if (!rezultat.success) {
            const noveGreske = {}

            rezultat.error.issues.forEach((issue) => {
                const polje = issue.path[0]

                if (!noveGreske[polje]) {
                    noveGreske[polje] = issue.message
                }
            })

            setGreske(noveGreske)
            return
        }

        const vrijednosti = rezultat.data

        promijeni({
            ...vrijednosti,
            datumPolaska: new Date(vrijednosti.datumPolaska).toISOString(),
            datumPovratka: new Date(vrijednosti.datumPovratka).toISOString(),
            slika: putovanje.slika ?? null
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
                noValidate
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
                                isInvalid={!!greske.naziv}
                                onChange={() => ocistiGresku('naziv')}
                                defaultValue={putovanje.naziv}
                            />
                            <Form.Control.Feedback type="invalid">
                                {greske.naziv}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>

                    <Col xs={12} md={6}>
                        <Form.Group controlId="destinacija">
                            <Form.Label>Destinacija</Form.Label>
                            <Form.Control
                                type="text"
                                name="destinacija"
                                defaultValue={putovanje.destinacija}
                                isInvalid={!!greske.destinacija}
                                onChange={() => ocistiGresku('destinacija')}
                            />
                            <Form.Control.Feedback type="invalid">
                                {greske.destinacija}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>

                    <Col xs={12} md={6}>
                        <Form.Group controlId="drzava">
                            <PretragaDrzava
                                drzave={drzave}
                                odabranaDrzava={putovanje.drzava}
                                onOdaberi={(drzava) => {
                                    setPutovanje(prethodno => ({
                                        ...prethodno,
                                        drzava
                                    }))
                                    ocistiGresku('drzava')
                                }}
                            />

                            {greske.drzava && (
                                <div className="text-danger small mt-1" role="alert">
                                    {greske.drzava}
                                </div>
                            )}
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
                                isInvalid={!!greske.datumPolaska}
                                onChange={() => ocistiGresku('datumPolaska')}
                            />
                            <Form.Control.Feedback type="invalid">
                                {greske.datumPolaska}
                            </Form.Control.Feedback>
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
                                isInvalid={!!greske.datumPovratka}
                                onChange={() => ocistiGresku('datumPovratka')}
                            />
                            <Form.Control.Feedback type="invalid">
                                {greske.datumPovratka}
                            </Form.Control.Feedback>
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
                                isInvalid={!!greske.budzet}
                                onChange={() => ocistiGresku('budzet')}
                            />
                            <Form.Control.Feedback type="invalid">
                                {greske.budzet}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>

                    <Col xs={12}>
                        <Form.Group>
                            <Form.Label>Naslovna slika putovanja</Form.Label>

                            <SlikaUploader
                                value={putovanje.slika}
                                onChange={(slika) =>
                                    setPutovanje(prethodno => ({
                                        ...prethodno,
                                        slika
                                    }))
                                }
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