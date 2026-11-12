import { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Button, Form } from "react-bootstrap"
import { FaArrowLeft, FaPlus } from "react-icons/fa"
import { RouteNames } from "../../constants"
import PutovanjaService from "../../services/putovanja/PutovanjaService"
import BudzetServis from "../../services/budzet/BudzetServis"
import { useObavijesti } from "../../components/zajednicko/Obavijesti"
import { kategorije } from "../../services/budzet/BudzetKategorije"

export default function BudzetNovo() {

    const [searchParams] = useSearchParams()
    const putovanjeSifra = searchParams.get("putovanjeSifra") || ""

    const [putovanje, setPutovanje] = useState(null)
    const [ucitavanje, setUcitavanje] = useState(true)
    const [greska, setGreska] = useState("")
    const [spremanje, setSpremanje] = useState(false)

    const navigate = useNavigate()
    const obavijesti = useObavijesti()

    const povratak = putovanjeSifra
        ? `${RouteNames.BUDZET}?putovanjeSifra=${encodeURIComponent(putovanjeSifra)}`
        : RouteNames.BUDZET

    useEffect(() => {
        let aktivno = true

        async function ucitajPutovanje() {
            setUcitavanje(true)
            setGreska("")
            setPutovanje(null)

            try {
                const sifra = Number(putovanjeSifra)

                if (!Number.isSafeInteger(sifra) || sifra <= 0) {
                    if (aktivno) {
                        setGreska("Prvo odaberi putovanje na pregledu budžeta.")
                    }

                    return
                }

                const odgovor = await PutovanjaService.getBySifra(sifra)

                if (aktivno) {
                    if (odgovor.data) {
                        setPutovanje(odgovor.data)
                    } else {
                        setGreska("Odabrano putovanje nije pronađeno.")
                    }
                }
            } catch (error) {
                console.error(error)

                if (aktivno) {
                    setGreska("Učitavanje putovanja nije uspjelo.")
                }
            } finally {
                if (aktivno) {
                    setUcitavanje(false)
                }
            }
        }

        ucitajPutovanje()

        return () => {
            aktivno = false
        }
    }, [putovanjeSifra])

    async function obradiSubmit(e) {
        e.preventDefault()

        if (spremanje || !putovanje) {
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
            const odgovor = await PutovanjaService.getBySifra(
                putovanje.sifra
            )

            if (!odgovor.data) {
                setGreska("Odabrano putovanje više ne postoji.")
                setPutovanje(null)
                return
            }

            await BudzetServis.dodaj({
                putovanjeSifra: Number(putovanje.sifra),
                naziv,
                iznos: Math.round(iznos * 100) / 100,
                kategorija,
                datum,
                napomena
            })

            obavijesti("Trošak je dodan.")
            navigate(povratak)
        } catch (error) {
            console.error(error)
            obavijesti("Dodavanje troška nije uspjelo.", "danger")
        } finally {
            setSpremanje(false)
        }
    }

    return (
        <section className="budzet-novo">
            <Link to={povratak} className="natrag-na-pregled">
                <FaArrowLeft />
                {" "}Natrag na pregled budžeta
            </Link>

            <h2 className="my-4">Dodavanje troška</h2>

            {ucitavanje ? (
                <p>Učitavanje...</p>
            ) : greska ? (
                <p role="alert">{greska}</p>
            ) : putovanje && (
                <>
                    <div className="itinerar-odabrano mb-4">
                        <strong>{putovanje.naziv}</strong>

                        <span>
                            {putovanje.destinacija},
                            {" "}{putovanje.drzava}
                        </span>
                    </div>

                    <Form onSubmit={obradiSubmit}>
                        <fieldset disabled={spremanje}>
                            <Form.Group
                                controlId="trosak-naziv"
                                className="mb-3"
                            >
                                <Form.Label>Naziv troška</Form.Label>

                                <Form.Control
                                    name="naziv"
                                    type="text"
                                    placeholder="Npr. Povratne autobusne karte"
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
                                    placeholder="Npr. 45,50"
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
                                    defaultValue=""
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
                                    required
                                    onClick={e => e.currentTarget.showPicker?.()}
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
                                    maxLength={1000}
                                />
                            </Form.Group>

                            <Button type="submit">
                                <FaPlus />
                                {" "}
                                {spremanje ? "Spremanje..." : "Dodaj trošak"}
                            </Button>
                        </fieldset>
                    </Form>
                </>
            )}
        </section>
    )

}