import { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Button, Form } from "react-bootstrap"
import { FaArrowLeft, FaPlus } from "react-icons/fa"
import { RouteNames } from "../../constants"
import PutovanjaService from "../../services/putovanja/PutovanjaService"
import FotografijeService from "../../services/fotografije/FotografijeService"
import SlikaUploader from "../../components/obrasci/SlikaUploader"
import { useObavijesti } from "../../components/zajednicko/Obavijesti"
import { ShemaNovaFotografija } from "../../schemas/ShemaFotografije"

export default function FotografijaNovo() {
    const navigate = useNavigate()
    const obavijesti = useObavijesti()
    const [searchParams] = useSearchParams()
    const [errors, setErrors] = useState({})
    const [putovanja, setPutovanja] = useState([])
    const [putovanjeSifra, setPutovanjeSifra] = useState(
        searchParams.get("putovanjeSifra") || ""
    )
    const [slika, setSlika] = useState(null)
    const [ucitavanje, setUcitavanje] = useState(true)
    const [greska, setGreska] = useState("")
    const [spremanje, setSpremanje] = useState(false)

    const povratak = putovanjeSifra
        ? `${RouteNames.FOTOGRAFIJE}?putovanjeSifra=${putovanjeSifra}`
        : RouteNames.FOTOGRAFIJE

    useEffect(() => {
        let aktivno = true

        async function ucitajPutovanja() {
            try {
                const odgovor = await PutovanjaService.get()

                if (aktivno) {
                    setPutovanja(odgovor.data)
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

        ucitajPutovanja()

        return () => {
            aktivno = false
        }
    }, [])

    async function obradiSubmit(e) {
        e.preventDefault()

        if (spremanje) {
            return
        }

        setErrors({})

        const podaci = new FormData(e.currentTarget)

        const rezultat = ShemaNovaFotografija.safeParse({
            putovanjeSifra,
            naziv: String(podaci.get("naziv") || ""),
            opis: String(podaci.get("opis") || ""),
            slika
        })

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

        const sifraPutovanja = rezultat.data.putovanjeSifra

        if (!putovanja.some(p => Number(p.sifra) === sifraPutovanja)) {
            setErrors({
                putovanjeSifra: "Odaberite postojeće putovanje."
            })
            return
        }

        setSpremanje(true)

        try {
            const odgovor = await PutovanjaService.getBySifra(sifraPutovanja)

            if (!odgovor.data) {
                setErrors({
                    putovanjeSifra: "Odabrano putovanje više ne postoji."
                })
                return
            }

            await FotografijeService.dodaj(rezultat.data)

            obavijesti("Fotografija je dodana.")
            navigate(povratak)
        } catch (error) {
            console.error(error)
            obavijesti("Spremanje fotografije nije uspjelo.", "danger")
        } finally {
            setSpremanje(false)
        }
    }

    return (
        <section className="fotografija-novo">
            <Link to={povratak} className="natrag-na-pregled">
                <FaArrowLeft />
                {" "}Natrag na galeriju
            </Link>

            <h2>Dodavanje fotografije</h2>

            {ucitavanje ? (
                <p>Učitavanje...</p>
            ) : greska ? (
                <p role="alert">{greska}</p>
            ) : putovanja.length === 0 ? (
                <p>Prvo dodajte putovanje kojem pripada fotografija.</p>
            ) : (
                <Form onSubmit={obradiSubmit} noValidate >
                    <fieldset disabled={spremanje}>
                        <Form.Group controlId="fotografija-putovanje" className="mb-3">
                            <Form.Label>Putovanje</Form.Label>

                            <Form.Select
                                value={putovanjeSifra}
                                onChange={e => setPutovanjeSifra(e.target.value)}
                                required
                                isInvalid={!!errors.putovanjeSifra}
                                onFocus={() => setErrors(prethodne => ({
                                    ...prethodne,
                                    putovanjeSifra: ""
                                }))}
                            >
                                <option value="">Odaberite putovanje...</option>

                                {putovanja.map(putovanje => (
                                    <option
                                        key={putovanje.sifra}
                                        value={putovanje.sifra}
                                    >
                                        {putovanje.naziv}
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {errors.putovanjeSifra}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="fotografija-naziv" className="mb-3">
                            <Form.Label>Naziv fotografije</Form.Label>

                            <Form.Control
                                type="text"
                                name="naziv"
                                maxLength={100}
                                required
                                isInvalid={!!errors.naziv}
                                onFocus={() => setErrors(prethodne => ({
                                    ...prethodne,
                                    naziv: ""
                                }))}
                            />

                            <Form.Control.Feedback type="invalid">
                                {errors.naziv}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="fotografija-opis" className="mb-3">
                            <Form.Label>Opis</Form.Label>

                            <Form.Control
                                as="textarea"
                                name="opis"
                                rows={3}
                                maxLength={1000}
                                isInvalid={!!errors.opis}
                                onFocus={() => setErrors(prethodne => ({
                                    ...prethodne,
                                    opis: ""
                                }))}
                            />

                            <Form.Control.Feedback type="invalid">
                                {errors.opis}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <div className="mb-4">
                            <p className="form-label">Fotografija</p>

                            <SlikaUploader
                                value={slika}
                                onChange={novaSlika => {
                                    setSlika(novaSlika)

                                    setErrors(prethodne => ({
                                        ...prethodne,
                                        slika: ""
                                    }))
                                }}
                            />

                            {errors.slika && (
                                <p className="text-danger mt-2 mb-0" role="alert">
                                    {errors.slika}
                                </p>
                            )}
                        </div>

                        <Button type="submit">
                            <FaPlus />
                            {" "}{spremanje ? "Spremanje..." : "Dodaj fotografiju"}
                        </Button>
                    </fieldset>
                </Form>
            )}
        </section>
    )
}