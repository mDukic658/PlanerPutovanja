import { useState, useEffect } from "react"
import { Button, Form } from "react-bootstrap"
import OdabirLokacije from "./OdabirLokacije"
import PretragaDrzava from "../PretragaDrzava"
import DrzaveService from "../../services/drzave/DrzaveService"
import PretragaLokacije from "./PretragaLokacije"

export default function PosjetObrazac({
    pocetniPodaci = {},
    onSpremi,
    onOdustani,
    spremanje = false
}) {
    const [drzava, setDrzava] = useState(pocetniPodaci.drzava || "")
    const [iso2, setIso2] = useState(pocetniPodaci.iso2 || "")
    const [grad, setGrad] = useState(pocetniPodaci.grad || "")
    const [datumPosjeta, setDatumPosjeta] = useState(
        String(pocetniPodaci.datumPosjeta || "").substring(0, 10)
    )
    const [napomena, setNapomena] = useState(
        pocetniPodaci.napomena || ""
    )
    const [lokacija, setLokacija] = useState(() =>
        Number.isFinite(pocetniPodaci.lat) &&
            Number.isFinite(pocetniPodaci.lng)
            ? {
                lat: pocetniPodaci.lat,
                lng: pocetniPodaci.lng
            }
            : null
    )
    const [greske, setGreske] = useState({})

    const [drzave, setDrzave] = useState([])
    const [ucitavanjeDrzava, setUcitavanjeDrzava] = useState(true)
    const [greskaDrzava, setGreskaDrzava] = useState("")

    useEffect(() => {
        let aktivno = true

        async function ucitajDrzave() {
            try {
                const odgovor = await DrzaveService.get()

                if (aktivno) {
                    setDrzave(odgovor.data)
                }
            } catch (error) {
                console.error(error)

                if (aktivno) {
                    setGreskaDrzava("Učitavanje država nije uspjelo.")
                }
            } finally {
                if (aktivno) {
                    setUcitavanjeDrzava(false)
                }
            }
        }

        ucitajDrzave()

        return () => {
            aktivno = false
        }
    }, [])

    function odaberiDrzavu(naziv) {
        const odabrana = drzave.find(
            stavka => stavka.naziv === naziv
        )

        setDrzava(odabrana?.naziv || "")
        setIso2(odabrana?.kod?.trim().toUpperCase() || "")
        setLokacija(null)

        setGreske(prethodne => ({
            ...prethodne,
            drzava: "",
            iso2: ""
        }))
    }

    function promijeniGrad(vrijednost) {
        setGrad(vrijednost)
        setLokacija(null)
    }

    function postaviLokaciju(novaLokacija) {
        setLokacija(novaLokacija)

        setGreske(prethodne => ({
            ...prethodne,
            lokacija: ""
        }))
    }

    function obradiSubmit(e) {
        e.preventDefault()

        if (spremanje) {
            return
        }

        const podaci = {
            drzava: drzava.trim(),
            iso2: iso2.trim().toUpperCase(),
            grad: grad.trim(),
            datumPosjeta,
            napomena: napomena.trim(),
            lat: lokacija?.lat,
            lng: lokacija?.lng
        }

        const noveGreske = {}

        if (podaci.drzava.length < 2 || podaci.drzava.length > 100) {
            noveGreske.drzava =
                "Naziv države mora imati između 2 i 100 znakova."
        }

        if (!/^[A-Z]{2}$/.test(podaci.iso2)) {
            noveGreske.iso2 =
                "Odaberi državu koja ima valjanu dvoslovnu oznaku."
        }

        if (podaci.grad.length < 2 || podaci.grad.length > 100) {
            noveGreske.grad =
                "Naziv mjesta mora imati između 2 i 100 znakova."
        }

        const datum = new Date(`${podaci.datumPosjeta}T00:00:00Z`)

        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(podaci.datumPosjeta) ||
            !Number.isFinite(datum.getTime()) ||
            datum.toISOString().substring(0, 10) !== podaci.datumPosjeta
        ) {
            noveGreske.datumPosjeta = "Unesi valjan datum posjeta."
        }

        if (
            !Number.isFinite(podaci.lat) ||
            !Number.isFinite(podaci.lng) ||
            podaci.lat < -90 ||
            podaci.lat > 90 ||
            podaci.lng < -180 ||
            podaci.lng > 180
        ) {
            noveGreske.lokacija = "Odaberi lokaciju na karti."
        }

        if (podaci.napomena.length > 1000) {
            noveGreske.napomena =
                "Napomena smije imati najviše 1000 znakova."
        }

        setGreske(noveGreske)

        if (Object.keys(noveGreske).length > 0) {
            return
        }

        onSpremi(podaci)
    }

    return (
        <Form onSubmit={obradiSubmit} noValidate>
            <fieldset disabled={spremanje}>
                <div className="mb-3">
                    {ucitavanjeDrzava ? (
                        <p>Učitavanje država...</p>
                    ) : greskaDrzava ? (
                        <p className="text-danger" role="alert">
                            {greskaDrzava}
                        </p>
                    ) : (
                        <PretragaDrzava
                            drzave={drzave}
                            odabranaDrzava={drzava}
                            onOdaberi={odaberiDrzavu}
                        />
                    )}

                    {(greske.drzava || greske.iso2) && (
                        <p className="text-danger mt-2 mb-0" role="alert">
                            {greske.drzava || greske.iso2}
                        </p>
                    )}
                </div>

                <PretragaLokacije
                    grad={grad}
                    iso2={iso2}
                    onPromjenaGrada={promijeniGrad}
                    onOdaberi={postaviLokaciju}
                    greskaPolja={greske.grad}
                    disabled={spremanje}
                />

                <Form.Group controlId="posjet-datum" className="mb-3">
                    <Form.Label>Datum posjeta</Form.Label>

                    <Form.Control
                        type="date"
                        value={datumPosjeta}
                        onChange={e => setDatumPosjeta(e.target.value)}
                        onClick={e => e.currentTarget.showPicker?.()}
                        isInvalid={Boolean(greske.datumPosjeta)}
                        required
                    />

                    <Form.Control.Feedback type="invalid">
                        {greske.datumPosjeta}
                    </Form.Control.Feedback>
                </Form.Group>

                <div className="mb-3">
                    <h3 className="h6">Lokacija</h3>

                    <OdabirLokacije
                        value={lokacija}
                        onChange={postaviLokaciju}
                        disabled={spremanje}
                    />

                    {greske.lokacija && (
                        <p className="text-danger mt-2" role="alert">
                            {greske.lokacija}
                        </p>
                    )}
                </div>

                <Form.Group controlId="posjet-napomena" className="mb-4">
                    <Form.Label>Napomena</Form.Label>

                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={napomena}
                        onChange={e => setNapomena(e.target.value)}
                        maxLength={1000}
                        isInvalid={Boolean(greske.napomena)}
                    />

                    <Form.Control.Feedback type="invalid">
                        {greske.napomena}
                    </Form.Control.Feedback>
                </Form.Group>

                <div className="d-flex flex-wrap gap-2">
                    <Button type="submit">
                        {spremanje ? "Spremanje..." : "Spremi posjet"}
                    </Button>

                    <Button
                        type="button"
                        variant="outline-secondary"
                        onClick={onOdustani}
                    >
                        Odustani
                    </Button>
                </div>
            </fieldset>
        </Form>
    )
}