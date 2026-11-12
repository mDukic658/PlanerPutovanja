import { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Button, Form } from "react-bootstrap"
import { FaArrowLeft, FaPlus } from "react-icons/fa"
import { RouteNames } from "../../constants"
import PutovanjaService from "../../services/putovanja/PutovanjaService"
import BudzetServis from "../../services/budzet/BudzetServis"
import { useObavijesti } from "../../components/zajednicko/Obavijesti"
import { kategorije } from "../../services/budzet/BudzetKategorije"
import { ShemaBudzet } from "../../schemas/ShemaBudzet"

export default function BudzetNovo() {

    const [searchParams] = useSearchParams()
    const putovanjeSifra = searchParams.get("putovanjeSifra") || ""
    const [errors, setErrors] = useState({})
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

    function ocistiGresku(polje) {
        setErrors(prethodne => ({
            ...prethodne,
            [polje]: ""
        }))
    }

    async function obradiSubmit(e) {
        e.preventDefault()

        if (spremanje || !putovanje) {
            return
        }

        setErrors({})

        const podaci = new FormData(e.currentTarget)

        const rezultat = ShemaBudzet.safeParse(
            Object.fromEntries(podaci)
        )

        if (!rezultat.success) {
            const noveGreske = {}

            rezultat.error.issues.forEach((issue) => {
                const kljuc = issue.path[0]

                if (!noveGreske[kljuc]) {
                    noveGreske[kljuc] = issue.message
                }
            })

            setErrors(noveGreske)
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
                ...rezultat.data,
                putovanjeSifra: Number(putovanje.sifra)
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

                    <Form onSubmit={obradiSubmit} noValidate>
                        <fieldset disabled={spremanje}>
                            <Form.Group controlId="trosak-naziv" className="mb-3">
                                <Form.Label>Naziv troška</Form.Label>

                                <Form.Control
                                    name="naziv"
                                    type="text"
                                    placeholder="Npr. Povratne autobusne karte"
                                    maxLength={100}
                                    required
                                    isInvalid={!!errors.naziv}
                                    onFocus={() => ocistiGresku("naziv")}
                                />

                                <Form.Control.Feedback type="invalid">
                                    {errors.naziv}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group controlId="trosak-iznos" className="mb-3">
                                <Form.Label>Iznos (€)</Form.Label>

                                <Form.Control
                                    name="iznos"
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="Npr. 45,50"
                                    maxLength={16}
                                    required
                                    isInvalid={!!errors.iznos}
                                    onFocus={() => ocistiGresku("iznos")}
                                />

                                <Form.Control.Feedback type="invalid">
                                    {errors.iznos}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group controlId="trosak-kategorija" className="mb-3">
                                <Form.Label>Kategorija</Form.Label>

                                <Form.Select
                                    name="kategorija"
                                    defaultValue=""
                                    required
                                    isInvalid={!!errors.kategorija}
                                    onFocus={() => ocistiGresku("kategorija")}
                                >
                                    <option value="">Odaberi kategoriju...</option>

                                    {kategorije.map(kategorija => (
                                        <option key={kategorija} value={kategorija}>
                                            {kategorija}
                                        </option>
                                    ))}
                                </Form.Select>

                                <Form.Control.Feedback type="invalid">
                                    {errors.kategorija}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group controlId="trosak-datum" className="mb-3">
                                <Form.Label>Datum troška</Form.Label>

                                <Form.Control
                                    name="datum"
                                    type="date"
                                    required
                                    onClick={e => e.currentTarget.showPicker?.()}
                                    isInvalid={!!errors.datum}
                                    onFocus={() => ocistiGresku("datum")}
                                />

                                <Form.Control.Feedback type="invalid">
                                    {errors.datum}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group controlId="trosak-napomena" className="mb-4">
                                <Form.Label>Napomena</Form.Label>

                                <Form.Control
                                    name="napomena"
                                    as="textarea"
                                    rows={3}
                                    maxLength={1000}
                                    isInvalid={!!errors.napomena}
                                    onFocus={() => ocistiGresku("napomena")}
                                />

                                <Form.Control.Feedback type="invalid">
                                    {errors.napomena}
                                </Form.Control.Feedback>
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