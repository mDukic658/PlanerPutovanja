import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Button, Form } from "react-bootstrap"
import { FaArrowLeft, FaSave } from "react-icons/fa"
import { RouteNames } from "../../constants"
import PutovanjaService from "../../services/putovanja/PutovanjaService"
import BudzetServis from "../../services/budzet/BudzetServis"
import { kategorije } from "../../services/budzet/BudzetKategorije"
import { useObavijesti } from "../../components/zajednicko/Obavijesti"
import { ShemaBudzet } from "../../schemas/ShemaBudzet"

export default function BudzetPromjena() {

    const { sifra } = useParams()
    const navigate = useNavigate()
    const obavijesti = useObavijesti()
    const [errors, setErrors] = useState({})
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

    function ocistiGresku(polje) {
        setErrors(prethodne => ({
            ...prethodne,
            [polje]: ""
        }))
    }

    async function obradiSubmit(e) {
        e.preventDefault()

        if (spremanje || !trosak || !putovanje) {
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
                ...rezultat.data,
                putovanjeSifra: Number(trosak.putovanjeSifra)
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
                        noValidate
                    >
                        <fieldset disabled={spremanje}>
                            <Form.Group controlId="trosak-naziv" className="mb-3">
                                <Form.Label>Naziv troška</Form.Label>

                                <Form.Control
                                    name="naziv"
                                    type="text"
                                    defaultValue={trosak.naziv}
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
                                    defaultValue={String(trosak.iznos).replace(".", ",")}
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
                                    defaultValue={trosak.kategorija}
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
                                    defaultValue={String(trosak.datum || "").substring(0, 10)}
                                    onClick={e => e.currentTarget.showPicker?.()}
                                    required
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
                                    defaultValue={trosak.napomena || ""}
                                    maxLength={1000}
                                    isInvalid={!!errors.napomena}
                                    onFocus={() => ocistiGresku("napomena")}
                                />

                                <Form.Control.Feedback type="invalid">
                                    {errors.napomena}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Button type="submit">
                                <FaSave />
                                {" "}
                                {spremanje ? "Spremanje..." : "Spremi promjene"}
                            </Button>
                        </fieldset>
                    </Form>
                </>
            )}
        </section>
    )

}