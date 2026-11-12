import { Button, Form } from "react-bootstrap"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import PredmetiService from "../../services/predmeti/PredmetiService"
import { RouteNames } from "../../constants"
import { FaArrowLeft, FaPen, FaSave, FaTimes } from "react-icons/fa"
import { ShemaPredmet } from "../../schemas/ShemaPredmeti"

export default function PredmetPromjena() {

    const navigate = useNavigate()
    const params = useParams()
    const [errors, setErrors] = useState({})
    const [predmet, setPredmet] = useState(null)
    const [ucitavanje, setUcitavanje] = useState(true)
    const [greska, setGreska] = useState('')

    useEffect(() => {
        ucitajPredmet()
    }, [])

    async function ucitajPredmet() {
        setUcitavanje(true)
        setGreska('')

        try {
            const odgovor = await PredmetiService.getBySifra(
                Number(params.sifra)
            )

            setPredmet(odgovor.data || null)
        } catch (error) {
            console.error(error)
            setGreska("Učitavanje predmeta nije uspjelo.")
        } finally {
            setUcitavanje(false)
        }
    }

    async function obradiSubmit(e) {
        e.preventDefault()

        const podaci = new FormData(e.currentTarget)

        setErrors({})

        const rezultat = ShemaPredmet.safeParse(
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

        await PredmetiService.promijeni(
            Number(params.sifra),
            rezultat.data
        )

        navigate(RouteNames.PREDMETI)
    }

    if (ucitavanje) {
        return <p>Učitavanje...</p>
    }

    if (greska || !predmet) {
        return (
            <section className="promjena-predmeta">
                <Link
                    to={RouteNames.PREDMETI}
                    className="natrag-na-pregled"
                >
                    <FaArrowLeft />
                    {" "}Natrag na pregled predmeta
                </Link>

                <p role="alert">
                    {greska || "Predmet nije pronađen. Možda je obrisan."}
                </p>
            </section>
        )
    }

    return (
        <section className="promjena-predmeta">

            <Link
                to={RouteNames.PREDMETI}
                className="natrag-na-pregled"
            >
                <FaArrowLeft />
                Natrag na pregled predmeta
            </Link>

            <h2 className="promjena-predmeta-naslov">
                <FaPen />
                Promjena predmeta
            </h2>

            <Form
                noValidate
                onSubmit={obradiSubmit}
                className="promjena-predmeta-obrazac"
            >
                <Form.Group controlId="naziv">
                    <Form.Label>Naziv predmeta</Form.Label>

                    <Form.Control
                        type="text"
                        name="naziv"
                        defaultValue={predmet.naziv}
                        isInvalid={!!errors.naziv}
                        onFocus={() => setErrors({})}
                    />

                    <Form.Control.Feedback type="invalid">
                        {errors.naziv}
                    </Form.Control.Feedback>
                </Form.Group>

                <div className="promjena-predmeta-akcije">
                    <Button
                        type="button"
                        variant="outline-secondary"
                        onClick={() => {
                            navigate(RouteNames.PREDMETI)
                        }}
                    >
                        <FaTimes />
                        Odustani
                    </Button>

                    <Button type="submit" variant="primary">
                        <FaSave />
                        Spremi promjene
                    </Button>
                </div>
            </Form>

        </section>
    )
}