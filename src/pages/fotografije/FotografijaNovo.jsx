import { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Button, Form } from "react-bootstrap"
import { FaArrowLeft, FaPlus } from "react-icons/fa"
import { RouteNames } from "../../constants"
import PutovanjaService from "../../services/putovanja/PutovanjaService"
import FotografijeService from "../../services/fotografije/FotografijeService"
import SlikaUploader from "../../components/SlikaUploader"
import { useObavijesti } from "../../components/Obavijesti"

export default function FotografijaNovo() {
    const navigate = useNavigate()
    const obavijesti = useObavijesti()
    const [searchParams] = useSearchParams()

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

        const podaci = new FormData(e.currentTarget)
        const naziv = String(podaci.get("naziv") || "").trim()
        const opis = String(podaci.get("opis") || "").trim()
        const sifraPutovanja = Number(putovanjeSifra)

        if (!putovanja.some(p => p.sifra === sifraPutovanja)) {
            obavijesti("Odaberite putovanje.", "danger")
            return
        }

        if (!naziv || naziv.length > 100) {
            obavijesti(
                "Naziv fotografije mora imati između 1 i 100 znakova.",
                "danger"
            )
            return
        }

        if (opis.length > 1000) {
            obavijesti("Opis smije imati najviše 1000 znakova.", "danger")
            return
        }

        if (!slika) {
            obavijesti("Odaberite sliku i kliknite Primijeni.", "danger")
            return
        }

        setSpremanje(true)

        try {
            const odgovor = await PutovanjaService.getBySifra(sifraPutovanja)

            if (!odgovor.data) {
                obavijesti("Odabrano putovanje više ne postoji.", "danger")
                return
            }

            await FotografijeService.dodaj({
                putovanjeSifra: sifraPutovanja,
                naziv,
                opis,
                slika
            })

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
                <Form onSubmit={obradiSubmit}>
                    <fieldset disabled={spremanje}>
                        <Form.Group controlId="fotografija-putovanje" className="mb-3">
                            <Form.Label>Putovanje</Form.Label>

                            <Form.Select
                                value={putovanjeSifra}
                                onChange={e => setPutovanjeSifra(e.target.value)}
                                required
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
                        </Form.Group>

                        <Form.Group controlId="fotografija-naziv" className="mb-3">
                            <Form.Label>Naziv fotografije</Form.Label>

                            <Form.Control
                                type="text"
                                name="naziv"
                                maxLength={100}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="fotografija-opis" className="mb-3">
                            <Form.Label>Opis</Form.Label>

                            <Form.Control
                                as="textarea"
                                name="opis"
                                rows={3}
                                maxLength={1000}
                            />
                        </Form.Group>

                        <div className="mb-4">
                            <p className="form-label">Fotografija</p>
                            <SlikaUploader value={slika} onChange={setSlika} />
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