import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Button, Form } from "react-bootstrap"
import { FaArrowLeft, FaSave } from "react-icons/fa"
import { RouteNames } from "../../constants"
import FotografijeService from "../../services/fotografije/FotografijeService"
import SlikaUploader from "../../components/obrasci/SlikaUploader"
import { useObavijesti } from "../../components/zajednicko/Obavijesti"
import { ShemaFotografija } from "../../schemas/ShemaFotografije"

export default function FotografijaPromjena() {
    const { sifra } = useParams()
    const navigate = useNavigate()
    const obavijesti = useObavijesti()
    const [errors, setErrors] = useState({})
    const [fotografija, setFotografija] = useState(null)
    const [ucitavanje, setUcitavanje] = useState(true)
    const [greska, setGreska] = useState("")
    const [spremanje, setSpremanje] = useState(false)

    const povratak = fotografija
        ? `${RouteNames.FOTOGRAFIJE}?putovanjeSifra=${fotografija.putovanjeSifra}`
        : RouteNames.FOTOGRAFIJE

    useEffect(() => {
        let aktivno = true

        async function ucitajFotografiju() {
            setUcitavanje(true)
            setGreska("")
            setFotografija(null)

            try {
                const odgovor = await FotografijeService.getBySifra(sifra)

                if (aktivno) {
                    setFotografija(
                        odgovor.data ? { ...odgovor.data } : null
                    )
                }
            } catch (error) {
                console.error(error)

                if (aktivno) {
                    setGreska("Učitavanje fotografije nije uspjelo.")
                }
            } finally {
                if (aktivno) {
                    setUcitavanje(false)
                }
            }
        }

        ucitajFotografiju()

        return () => {
            aktivno = false
        }
    }, [sifra])

    async function obradiSubmit(e) {
        e.preventDefault()

        if (!fotografija || spremanje) {
            return
        }

        setErrors({})

        const rezultat = ShemaFotografija.safeParse({
            naziv: fotografija.naziv ?? "",
            opis: fotografija.opis ?? "",
            slika: fotografija.slika
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

        setSpremanje(true)

        try {
            await FotografijeService.promijeni(sifra, rezultat.data)

            obavijesti("Promjene fotografije su spremljene.")
            navigate(povratak)
        } catch (error) {
            console.error(error)

            obavijesti(
                error.message || "Spremanje promjena nije uspjelo.",
                "danger"
            )
        } finally {
            setSpremanje(false)
        }
    }

    return (
        <section className="fotografija-promjena">
            <Link
                to={povratak}
                className="natrag-na-pregled"
            >
                <FaArrowLeft />
                {" "}Natrag na galeriju
            </Link>

            <h2>Promjena fotografije</h2>

            {ucitavanje ? (
                <p>Učitavanje...</p>
            ) : greska ? (
                <p role="alert">{greska}</p>
            ) : !fotografija ? (
                <p role="alert">
                    Fotografija nije pronađena. Možda je obrisana.
                </p>
            ) : (
                <Form onSubmit={obradiSubmit} noValidate >
                    <fieldset disabled={spremanje}>
                        <Form.Group
                            controlId="fotografija-naziv"
                            className="mb-3"
                        >
                            <Form.Label>Naziv fotografije</Form.Label>

                            <Form.Control
                                type="text"
                                value={fotografija.naziv ?? ""}
                                maxLength={100}
                                required
                                isInvalid={!!errors.naziv}
                                onFocus={() => setErrors(prethodne => ({
                                    ...prethodne,
                                    naziv: ""
                                }))}
                                onChange={e => {
                                    const naziv = e.target.value

                                    setFotografija(prethodna => ({
                                        ...prethodna,
                                        naziv
                                    }))
                                }}
                            />

                            <Form.Control.Feedback type="invalid">
                                {errors.naziv}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group
                            controlId="fotografija-opis"
                            className="mb-3"
                        >
                            <Form.Label>Opis</Form.Label>

                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={fotografija.opis ?? ""}
                                maxLength={1000}
                                isInvalid={!!errors.opis}
                                onFocus={() => setErrors(prethodne => ({
                                    ...prethodne,
                                    opis: ""
                                }))}
                                onChange={e => {
                                    const opis = e.target.value

                                    setFotografija(prethodna => ({
                                        ...prethodna,
                                        opis
                                    }))
                                }}
                            />

                            <Form.Control.Feedback type="invalid">
                                {errors.opis}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <div className="mb-4">
                            <p className="form-label">Fotografija</p>

                            <SlikaUploader
                                value={fotografija.slika}
                                onChange={slika => {
                                    setFotografija(prethodna => ({
                                        ...prethodna,
                                        slika
                                    }))

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
                            <FaSave />
                            {" "}
                            {spremanje
                                ? "Spremanje..."
                                : "Spremi promjene"}
                        </Button>
                    </fieldset>
                </Form>
            )}
        </section>
    )
}