import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Button, Form } from "react-bootstrap"
import { FaArrowLeft, FaSave } from "react-icons/fa"
import { RouteNames } from "../../constants"
import PutovanjaService from "../../services/putovanja/PutovanjaService"
import BudzetServis from "../../services/budzet/BudzetServis"
import { kategorije } from "../../services/budzet/BudzetKategorije"
import { useObavijesti } from "../../components/Obavijesti"

export default function BudzetPromjena() {

    const { sifra } = useParams()
    const navigate = useNavigate()
    const obavijesti = useObavijesti()

    const [trosak, setTrosak] = useState(null)
    const [putovanje, setPutovanje] = useState(null)
    const [ucitavanje, setUcitavanje] = useState(true)
    const [greska, setGreska] = useState("")
    const [spremanje, setSpremanje] = useState(false)

    const povratak = trosak
        ? `${RouteNames.BUDZET}?putovanjeSifra=${trosak.putovanjeSifra}`
        : RouteNames.BUDZET

    useEffect(() => {
        let aktivno = true

        async function ucitajPodatke() {
            setUcitavanje(true)
            setGreska("")
            setTrosak(null)
            setPutovanje(null)

            try {
                const odgovorTroska = await BudzetServis.getBySifra(sifra)

                if (!aktivno) {
                    return
                }

                if (!odgovorTroska.data) {
                    setGreska("Trošak nije pronađen.")
                    return
                }

                setTrosak(odgovorTroska.data)

                const odgovorPutovanja =
                    await PutovanjaService.getBySifra(
                        odgovorTroska.data.putovanjeSifra
                    )

                if (!aktivno) {
                    return
                }

                if (!odgovorPutovanja.data) {
                    setGreska("Putovanje kojem pripada trošak nije pronađeno.")
                    return
                }

                setPutovanje(odgovorPutovanja.data)
            } catch (error) {
                console.error(error)

                if (aktivno) {
                    setGreska("Učitavanje troška nije uspjelo.")
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
    }, [sifra])

    async function obradiSubmit(e) {
        e.preventDefault()

        if (spremanje || !trosak || !putovanje) {
            return
        }

        const podaci = new FormData(e.currentTarget)

        const naziv = String(podaci.get("naziv") || "").trim()
        const iznosUnos = String(podaci.get("iznos") || "").trim()
        const iznos = Number(iznosUnos.replace(",", "."))
        const kategorija = String(podaci.get("kategorija") || "")
        const datum = String(podaci.get("datum") || "")
        const napomena = String(podaci.get("napomena") || "").trim()

        if (!naziv || naziv.length > 100) {
            obavijesti(
                "Naziv troška mora imati između 1 i 100 znakova.",
                "danger"
            )
            return
        }

        if (
            !/^\d+(?:[.,]\d{1,2})?$/.test(iznosUnos) ||
            !Number.isFinite(iznos) ||
            iznos <= 0 ||
            !Number.isSafeInteger(Math.round(iznos * 100))
        ) {
            obavijesti(
                "Unesi iznos veći od nule, s najviše dvije decimale.",
                "danger"
            )
            return
        }

        if (!kategorije.includes(kategorija)) {
            obavijesti("Odaberi kategoriju troška.", "danger")
            return
        }

        if (!datum) {
            obavijesti("Unesi datum troška.", "danger")
            return
        }

        if (napomena.length > 1000) {
            obavijesti(
                "Napomena smije imati najviše 1000 znakova.",
                "danger"
            )
            return
        }

        setSpremanje(true)

        try {
            const [odgovorTroska, odgovorPutovanja] =
                await Promise.all([
                    BudzetServis.getBySifra(sifra),
                    PutovanjaService.getBySifra(trosak.putovanjeSifra)
                ])

            if (!odgovorTroska.data || !odgovorPutovanja.data) {
                setGreska("Trošak ili pripadajuće putovanje više ne postoji.")
                return
            }

            await BudzetServis.promijeni(sifra, {
                putovanjeSifra: Number(trosak.putovanjeSifra),
                naziv,
                iznos: Math.round(iznos * 100) / 100,
                kategorija,
                datum,
                napomena
            })

            obavijesti("Trošak je promijenjen.")
            navigate(povratak)
        } catch (error) {
            console.error(error)
            obavijesti("Spremanje promjena nije uspjelo.", "danger")
        } finally {
            setSpremanje(false)
        }
    }

    return (
        <section className="budzet-promjena">
            <Link to={povratak} className="natrag-na-pregled">
                <FaArrowLeft />
                {" "}Natrag na pregled budžeta
            </Link>

            <h2 className="my-4">Uređivanje troška</h2>

            {ucitavanje ? (
                <p>Učitavanje...</p>
            ) : greska ? (
                <p role="alert">{greska}</p>
            ) : trosak && putovanje && (
                <>
                    <div className="itinerar-odabrano mb-4">
                        <strong>{putovanje.naziv}</strong>

                        <span>
                            {putovanje.destinacija},
                            {" "}{putovanje.drzava}
                        </span>
                    </div>

                    <Form
                        key={trosak.sifra}
                        onSubmit={obradiSubmit}
                    >
                        <fieldset disabled={spremanje}>
                            <Form.Group
                                controlId="trosak-naziv"
                                className="mb-3"
                            >
                                <Form.Label>Naziv troška</Form.Label>

                                <Form.Control
                                    name="naziv"
                                    type="text"
                                    defaultValue={trosak.naziv}
                                    maxLength={100}
                                    required
                                />
                            </Form.Group>

                            <Form.Group
                                controlId="trosak-iznos"
                                className="mb-3"
                            >
                                <Form.Label>Iznos (€)</Form.Label>

                                <Form.Control
                                    name="iznos"
                                    type="text"
                                    inputMode="decimal"
                                    defaultValue={String(
                                        trosak.iznos
                                    ).replace(".", ",")}
                                    maxLength={16}
                                    required
                                />
                            </Form.Group>

                            <Form.Group
                                controlId="trosak-kategorija"
                                className="mb-3"
                            >
                                <Form.Label>Kategorija</Form.Label>

                                <Form.Select
                                    name="kategorija"
                                    defaultValue={trosak.kategorija}
                                    required
                                >
                                    <option value="">
                                        Odaberi kategoriju...
                                    </option>

                                    {kategorije.map(kategorija => (
                                        <option
                                            key={kategorija}
                                            value={kategorija}
                                        >
                                            {kategorija}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group
                                controlId="trosak-datum"
                                className="mb-3"
                            >
                                <Form.Label>Datum troška</Form.Label>

                                <Form.Control
                                    name="datum"
                                    type="date"
                                    defaultValue={String(
                                        trosak.datum || ""
                                    ).substring(0, 10)}
                                    onClick={e =>
                                        e.currentTarget.showPicker?.()
                                    }
                                    required
                                />
                            </Form.Group>

                            <Form.Group
                                controlId="trosak-napomena"
                                className="mb-4"
                            >
                                <Form.Label>Napomena</Form.Label>

                                <Form.Control
                                    name="napomena"
                                    as="textarea"
                                    rows={3}
                                    defaultValue={trosak.napomena || ""}
                                    maxLength={1000}
                                />
                            </Form.Group>

                            <Button type="submit">
                                <FaSave />
                                {" "}
                                {spremanje
                                    ? "Spremanje..."
                                    : "Spremi promjene"}
                            </Button>
                        </fieldset>
                    </Form>
                </>
            )}
        </section>
    )

}