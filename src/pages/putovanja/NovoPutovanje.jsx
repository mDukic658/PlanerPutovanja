import { Button, Col, Form, Row } from "react-bootstrap"
import { Link, useNavigate } from "react-router-dom"
import { RouteNames } from "../../constants"
import PutovanjaService from "../../services/putovanja/PutovanjaService"
import DrzaveService from '../../services/drzave/DrzaveService'
import { useEffect, useState } from "react"
import PretragaDrzava from "../../components/obrasci/PretragaDrzava"
import { FaArrowLeft, FaPlaneDeparture, FaPlus, FaTimes } from "react-icons/fa"
import { useObavijesti } from "../../components/zajednicko/Obavijesti"
import SlikaUploader from "../../components/obrasci/SlikaUploader"
import { ShemaNovoPutovanje } from "../../schemas/ShemaPutovanje"


export default function NovoPutovanje({
    pocetniDatumi = {}, onSpremi, onOdustani
}) {

    const navigate = useNavigate()

    const obavijesti = useObavijesti()
    const [drzave, setDrzave] = useState([])
    const [odabranaDrzava, setOdabranaDrzava] = useState("")
    const [slika, setSlika] = useState(null)
    const [greske, setGreske] = useState({})

    function odustani() {
        if (onOdustani) {
            onOdustani()
        } else {
            navigate(RouteNames.PUTOVANJA)
        }
    }

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
        } catch (error) {
            console.error(error)
            obavijesti("Dodavanje putovanja nije uspjelo.", "danger")
            return
        }

        obavijesti("Putovanje je uspješno dodano.")

        if (onSpremi) {
            await onSpremi()
        } else {
            navigate(RouteNames.PUTOVANJA)
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
        const rezultat = ShemaNovoPutovanje.safeParse(
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

        dodaj({
            ...vrijednosti,
            datumPolaska: new Date(vrijednosti.datumPolaska).toISOString(),
            datumPovratka: new Date(vrijednosti.datumPovratka).toISOString(),
            slika
        })
    }

    return (
        <section className="novo-putovanje">

            {!onOdustani && (
                <Link
                    to={RouteNames.PUTOVANJA}
                    className="natrag-na-pregled"
                >
                    <FaArrowLeft />
                    Natrag na pregled putovanja
                </Link>
            )}

            <h2 className="novo-putovanje-naslov">
                <FaPlaneDeparture />
                Dodavanje novog putovanja
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
                                placeholder="Npr. Ljetovanje u Italiji"
                                isInvalid={!!greske.naziv}
                                onChange={() => ocistiGresku('naziv')}
                            />
                            <Form.Control.Feedback type="invalid">
                                {greske.naziv}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>

                    <Col xs={12} md={6}>
                        <Form.Group controlId="drzava">
                            <PretragaDrzava
                                drzave={drzave}
                                odabranaDrzava={odabranaDrzava}
                                onOdaberi={(drzava) => {
                                    setOdabranaDrzava(drzava)
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
                        <Form.Group controlId="destinacija">
                            <Form.Label>Destinacija</Form.Label>
                            <Form.Control
                                type="text"
                                name="destinacija"
                                placeholder="Npr. Rim"
                                isInvalid={!!greske.destinacija}
                                onChange={() => ocistiGresku('destinacija')}
                            />
                            <Form.Control.Feedback type="invalid">
                                {greske.destinacija}
                            </Form.Control.Feedback>
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
                                defaultValue={pocetniDatumi.datumPolaska || ""}
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
                                defaultValue={pocetniDatumi.datumPovratka || ""}
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
                                placeholder="Npr. 800"
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
                                value={slika}
                                onChange={setSlika}
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
                        <FaPlus />
                        Dodaj putovanje
                    </Button>
                </div>

            </Form>
        </section>
    )

}