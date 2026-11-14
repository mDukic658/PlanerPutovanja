import { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Button, Form } from "react-bootstrap"
import { FaArrowLeft, FaPlus } from "react-icons/fa"
import { RouteNames } from "../../constants"
import PutovanjaService from "../../services/putovanja/PutovanjaService"
import FotografijeService from "../../services/fotografije/FotografijeService"
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
    const [datoteke, setDatoteke] = useState([])
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

    function procitajSliku(datoteka) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()

            reader.onload = () => resolve(reader.result)

            reader.onerror = () => reject(
                new Error(`Učitavanje datoteke ${datoteka.name} nije uspjelo.`)
            )

            reader.onabort = () => reject(
                new Error("Učitavanje slike je prekinuto.")
            )

            reader.readAsDataURL(datoteka)
        })
    }

    async function obradiSubmit(e) {
        e.preventDefault()

        if (spremanje) {
            return
        }

        setErrors({})

        const rezultat = ShemaNovaFotografija.safeParse({
            putovanjeSifra,
            naziv: "",
            opis: "",
            slika: datoteke[0] || null
        })

        if (!rezultat.success) {
            const noveGreske = {}

            rezultat.error.issues.forEach(issue => {
                const polje = issue.path[0]

                if (!noveGreske[polje]) {
                    noveGreske[polje] = issue.message
                }
            })

            setErrors(noveGreske)
            return
        }

        const dozvoljeniFormati = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ]

        const neispravna = datoteke.find(datoteka =>
            !dozvoljeniFormati.includes(datoteka.type) ||
            datoteka.size > 15 * 1024 * 1024
        )

        if (neispravna) {
            setErrors({
                slika: `${neispravna.name}: dozvoljeni su JPG, PNG i WEBP do 15 MB po slici.`
            })
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
            const odgovor = await PutovanjaService.getBySifra(
                sifraPutovanja
            )

            if (!odgovor.data) {
                setErrors({
                    putovanjeSifra: "Odabrano putovanje više ne postoji."
                })
                return
            }

            const fotografije = []

            for (const datoteka of datoteke) {
                const slika = await procitajSliku(datoteka)

                fotografije.push({
                    putovanjeSifra: sifraPutovanja,
                    naziv: "",
                    opis: "",
                    slika
                })
            }

            await FotografijeService.dodajVise(fotografije)

            obavijesti(`Dodano fotografija: ${fotografije.length}.`)
            navigate(povratak)
        } catch (error) {
            console.error(error)

            obavijesti(
                error.name === "QuotaExceededError"
                    ? "Nema dovoljno prostora u lokalnoj pohrani. Odaberite manje slika. Ova skupina nije spremljena."
                    : "Spremanje fotografija nije uspjelo. Pokušajte ponovno.",
                "danger"
            )
        } finally {
            setSpremanje(false)
        }
    }

    return (
        <section className="fotografija-novo">
            <Link to={povratak} className="natrag-na-pregled">
                <FaArrowLeft />
                {" "}Natrag na album
            </Link>

            <h2>Dodavanje fotografija</h2>

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

                        <Form.Group
                            controlId="fotografije-datoteke"
                            className="mb-4"
                        >
                            <Form.Label>Fotografije</Form.Label>

                            <Form.Control
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                isInvalid={!!errors.slika}
                                onChange={e => {
                                    setDatoteke(Array.from(e.target.files || []))

                                    setErrors(prethodne => ({
                                        ...prethodne,
                                        slika: ""
                                    }))
                                }}
                                aria-describedby="fotografije-upute"
                            />

                            <Form.Control.Feedback type="invalid">
                                {errors.slika}
                            </Form.Control.Feedback>

                            <Form.Text id="fotografije-upute">
                                Možeš odabrati više fotografija odjednom.
                                Dozvoljeni su JPG, PNG i WEBP do 15 MB po slici.
                                Naziv i opis možeš dodati kasnije kroz uređivanje.
                            </Form.Text>

                            <p className="mt-2 mb-0" role="status">
                                Odabrano fotografija: {datoteke.length}
                            </p>
                        </Form.Group>

                        <Button
                            type="submit"
                            disabled={spremanje || datoteke.length === 0}
                        >
                            <FaPlus />
                            {" "}
                            {spremanje
                                ? "Spremanje..."
                                : `Dodaj fotografije (${datoteke.length})`}
                        </Button>
                    </fieldset>
                </Form>
            )}
        </section>
    )
}