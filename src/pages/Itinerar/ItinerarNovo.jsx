import { useEffect, useState } from "react"
import { Button, Col, Form, Row } from "react-bootstrap"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { RouteNames } from "../../constants"
import PutovanjaService from "../../services/putovanja/PutovanjaService"
import ItinerarService from "../../services/itinerar/ItinerarService"
import { FaArrowLeft, FaPlus, FaTimes } from "react-icons/fa"
import { Timepicker } from "timepicker-ui-react"
import "timepicker-ui/main.css"
import { useObavijesti } from "../../components/Obavijesti"


export default function ItinerarNovo() {

    const navigate = useNavigate()
    const obavijesti = useObavijesti()

    const [searchParams] = useSearchParams()
    const putovanjeSifra = searchParams.get("putovanjeSifra")

    const [putovanja, setPutovanja] = useState([])
    const [aktivnosti, setAktivnosti] = useState([])
    const [ucitavanje, setUcitavanje] = useState(true)
    const [spremanje, setSpremanje] = useState(false)
    const [greska, setGreska] = useState("")

    const [stavka, setStavka] = useState({
        putovanjeSifra: putovanjeSifra || "",
        dan: 1,
        vrijeme: "07:00",
        naziv: "",
        biljeska: ""
    })

    useEffect(() => {
        let aktivno = true

        async function ucitajPodatke() {
            setUcitavanje(true)
            setGreska("")

            try {
                const odgovorPutovanja = await PutovanjaService.get()
                const odgovorAktivnosti = await ItinerarService.get()

                if (!aktivno) {
                    return
                }

                setPutovanja(odgovorPutovanja.data)
                setAktivnosti(odgovorAktivnosti.data)

                const prijedlog = putovanjeSifra
                    ? predloziDanIVrijeme(
                        putovanjeSifra,
                        odgovorPutovanja.data,
                        odgovorAktivnosti.data
                    )
                    : { dan: 1, vrijeme: "07:00" }

                setStavka((stara) => ({
                    ...stara,
                    putovanjeSifra: putovanjeSifra || "",
                    ...prijedlog
                }))
            } catch (error) {
                console.error(error)

                if (aktivno) {
                    setGreska(
                        "Učitavanje podataka nije uspjelo. Osvježi stranicu."
                    )
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
    }, [putovanjeSifra])

    function brojDanaPutovanja(putovanje) {
        if (!putovanje) {
            return 1
        }

        const polazak = Date.parse(putovanje.datumPolaska.slice(0, 10))
        const povratak = Date.parse(putovanje.datumPovratka.slice(0, 10))

        return Math.max(
            1,
            Math.round((povratak - polazak) / 86400000) + 1
        )
    }

    function predloziVrijeme(sifraPutovanja, dan, sveAktivnosti) {
        const vremena = sveAktivnosti
            .filter((aktivnost) =>
                Number(aktivnost.putovanjeSifra) === Number(sifraPutovanja) &&
                Number(aktivnost.dan) === Number(dan)
            )
            .map((aktivnost) => aktivnost.vrijeme)
            .filter((vrijeme) =>
                /^([01]\d|2[0-3]):[0-5]\d$/.test(vrijeme)
            )

        if (vremena.length === 0) {
            return "07:00"
        }

        const vremenaUMinutama = vremena.map((vrijeme) => {
            const [sati, minute] = vrijeme.split(":").map(Number)
            return sati * 60 + minute
        })

        const prijedlog = Math.max(...vremenaUMinutama) + 30

        if (prijedlog >= 24 * 60) {
            return ""
        }

        const sati = String(Math.floor(prijedlog / 60)).padStart(2, "0")
        const minute = String(prijedlog % 60).padStart(2, "0")

        return `${sati}:${minute}`
    }

    function predloziDanIVrijeme(sifraPutovanja, svaPutovanja, sveAktivnosti) {
        const putovanje = svaPutovanja.find(
            (p) => Number(p.sifra) === Number(sifraPutovanja)
        )

        const dani = sveAktivnosti
            .filter((aktivnost) =>
                Number(aktivnost.putovanjeSifra) === Number(sifraPutovanja)
            )
            .map((aktivnost) => Number(aktivnost.dan))
            .filter((dan) => Number.isInteger(dan) && dan >= 1)

        const posljednjiDan = Math.max(0, ...dani)

        const dan = Math.min(
            posljednjiDan + 1,
            brojDanaPutovanja(putovanje)
        )

        return {
            dan,
            vrijeme: predloziVrijeme(sifraPutovanja, dan, sveAktivnosti)
        }
    }

    function promijeniVrijednost(e) {
        const { name, value } = e.target

        if (name === "putovanjeSifra") {
            return
        }

        if (name === "dan") {
            setStavka((stara) => ({
                ...stara,
                dan: value,
                vrijeme: predloziVrijeme(
                    stara.putovanjeSifra,
                    value,
                    aktivnosti
                )
            }))

            return
        }

        setStavka((stara) => ({
            ...stara,
            [name]: value
        }))
    }

    async function spremi(e) {
        e.preventDefault()

        if (ucitavanje || spremanje || greska) {
            return
        }

        if (
            !putovanjeSifra ||
            !odabranoPutovanje ||
            Number(stavka.putovanjeSifra) !== Number(putovanjeSifra)
        ) {
            obavijesti(
                "Vrati se na pregled itinerara i odaberi putovanje prije dodavanja aktivnosti.",
                "danger"
            )
            return
        }

        const dan = Number(stavka.dan)

        if (
            !Number.isInteger(dan) ||
            dan < 1 ||
            dan > maksimalniDan
        ) {
            obavijesti(
                `Dan mora biti između 1 i ${maksimalniDan}.`,
                "danger"
            )
            return
        }

        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(stavka.vrijeme)) {
            obavijesti("Odaberi vrijeme aktivnosti.", "danger")
            return
        }

        if (!stavka.naziv.trim()) {
            obavijesti("Unesi naziv aktivnosti.", "danger")
            return
        }

        const novaStavka = {
            ...stavka,
            putovanjeSifra: Number(putovanjeSifra),
            dan,
            naziv: stavka.naziv.trim()
        }

        setSpremanje(true)

        try {
            await ItinerarService.dodaj(novaStavka)
        } catch (error) {
            console.error(error)
            obavijesti("Dodavanje aktivnosti nije uspjelo.", "danger")
            setSpremanje(false)
            return
        }

        obavijesti("Aktivnost je dodana.")

        navigate(
            `${RouteNames.ITINERAR}?putovanjeSifra=${novaStavka.putovanjeSifra}`
        )
    }

    const odabranoPutovanje = putovanja.find(
        (p) => Number(p.sifra) === Number(stavka.putovanjeSifra)
    )

    const maksimalniDan = brojDanaPutovanja(odabranoPutovanje)
    const onemoguceno = ucitavanje || spremanje || Boolean(greska)

    return (
        <section className="novi-itinerar">

            <Link
                to={
                    stavka.putovanjeSifra
                        ? `${RouteNames.ITINERAR}?putovanjeSifra=${stavka.putovanjeSifra}`
                        : RouteNames.ITINERAR
                }
                className="natrag-na-pregled"
            >
                <FaArrowLeft />
                {" "}Natrag na pregled itinerara
            </Link>

            <h2 className="novi-itinerar-naslov">
                <FaPlus />
                {" "}Nova stavka itinerara
            </h2>

            {greska && (
                <div className="alert alert-danger" role="alert">
                    {greska}
                </div>
            )}

            <Form onSubmit={spremi} className="itinerar-obrazac">
                <Row className="g-3">

                    <Col xs={12}>
                        <Form.Group controlId="putovanjeSifra">
                            <Form.Label>Putovanje</Form.Label>

                            <Form.Control
                                type="text"
                                value={
                                    ucitavanje
                                        ? "Učitavanje..."
                                        : odabranoPutovanje?.naziv || "Putovanje nije odabrano"
                                }
                                readOnly
                            />
                        </Form.Group>
                    </Col>

                    <Col xs={12} md={6}>
                        <Form.Group controlId="dan">
                            <Form.Label>Dan</Form.Label>

                            <Form.Control
                                type="number"
                                min="1"
                                max={maksimalniDan}
                                step="1"
                                name="dan"
                                value={stavka.dan}
                                onChange={promijeniVrijednost}
                                disabled={
                                    onemoguceno || !odabranoPutovanje
                                }
                                required
                            />
                        </Form.Group>
                    </Col>

                    <Col xs={12} md={6}>
                        <Form.Group controlId="vrijeme">
                            <Form.Label>Vrijeme</Form.Label>

                            <Timepicker
                                id="vrijeme"
                                name="vrijeme"
                                className="form-control"
                                placeholder="Odaberi vrijeme"
                                value={stavka.vrijeme}
                                disabled={
                                    onemoguceno || !odabranoPutovanje
                                }
                                options={{
                                    clock: {
                                        type: "24h",
                                        autoSwitchToMinutes: true
                                    },
                                    labels: {
                                        ok: "Potvrdi",
                                        cancel: "Odustani"
                                    }
                                }}
                                onConfirm={(podaci) => {
                                    const sati = String(
                                        podaci.hour
                                    ).padStart(2, "0")

                                    const minute = String(
                                        podaci.minutes
                                    ).padStart(2, "0")

                                    setStavka((stara) => ({
                                        ...stara,
                                        vrijeme: `${sati}:${minute}`
                                    }))
                                }}
                            />

                            {!stavka.vrijeme && (
                                <Form.Text className="text-muted">
                                    Prijedlog prelazi ponoć.
                                    Odaberi vrijeme ručno ili promijeni dan.
                                </Form.Text>
                            )}
                        </Form.Group>
                    </Col>

                    <Col xs={12}>
                        <Form.Group controlId="naziv">
                            <Form.Label>Naziv</Form.Label>

                            <Form.Control
                                type="text"
                                name="naziv"
                                placeholder="Npr. Razgledavanje grada"
                                value={stavka.naziv}
                                onChange={promijeniVrijednost}
                                disabled={onemoguceno}
                                required
                            />
                        </Form.Group>
                    </Col>

                    <Col xs={12}>
                        <Form.Group controlId="biljeska">
                            <Form.Label>Bilješka</Form.Label>

                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="biljeska"
                                placeholder="Dodatne informacije o aktivnosti..."
                                value={stavka.biljeska}
                                onChange={promijeniVrijednost}
                                disabled={onemoguceno}
                            />
                        </Form.Group>
                    </Col>

                </Row>

                <div className="itinerar-obrazac-akcije">
                    <Link
                        to={
                            stavka.putovanjeSifra
                                ? `${RouteNames.ITINERAR}?putovanjeSifra=${stavka.putovanjeSifra}`
                                : RouteNames.ITINERAR
                        }
                        className="btn btn-outline-secondary"
                    >
                        <FaTimes />
                        {" "}Odustani
                    </Link>

                    <Button
                        type="submit"
                        variant="primary"
                        disabled={onemoguceno}
                    >
                        <FaPlus />
                        {" "}{spremanje ? "Spremanje..." : "Dodaj aktivnost"}
                    </Button>
                </div>
            </Form>

        </section>
    )
}