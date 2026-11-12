import { Button, Form } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { RouteNames } from '../../constants'
import DrzaveService from '../../services/drzave/DrzaveService'
import { FaArrowLeft, FaGlobeEurope, FaPlus, FaTimes } from 'react-icons/fa'
import { ShemaDrzava } from '../../schemas/ShemaDrzave'
import { useState } from 'react'

export default function NovaDrzava() {
    const navigate = useNavigate()
    const [greske, setGreske] = useState({})

    async function dodaj(drzava) {
        await DrzaveService.dodaj(drzava).then(() => {
            navigate(RouteNames.DRZAVE)
        })
    }

    function obradiSubmit(e) {
        e.preventDefault()

        const podaci = new FormData(e.currentTarget)
        const rezultat = ShemaDrzava.safeParse(
            Object.fromEntries(podaci)
        )

        if (!rezultat.success) {
            setGreske({
                naziv: rezultat.error.issues[0].message
            })
            return
        }

        setGreske({})
        dodaj(rezultat.data)
    }

    return (
        <section className="nova-drzava">

            <Link
                to={RouteNames.DRZAVE}
                className="natrag-na-pregled"
            >
                <FaArrowLeft />
                Natrag na pregled država
            </Link>

            <h2 className="nova-drzava-naslov">
                <FaGlobeEurope />
                Dodavanje nove države
            </h2>

            <Form
                noValidate
                onSubmit={obradiSubmit}
                className="nova-drzava-obrazac"
            >
                <Form.Group controlId="naziv">
                    <Form.Label>Naziv države</Form.Label>

                    <Form.Control
                        type="text"
                        name="naziv"
                        placeholder="Npr. Hrvatska"
                        isInvalid={!!greske.naziv}
                        onChange={() => setGreske({})}
                    />

                    <Form.Control.Feedback type="invalid">
                        {greske.naziv}
                    </Form.Control.Feedback>
                </Form.Group>

                <div className="nova-drzava-akcije">
                    <Link
                        to={RouteNames.DRZAVE}
                        className="btn btn-outline-secondary"
                    >
                        <FaTimes />
                        Odustani
                    </Link>

                    <Button type="submit" variant="primary">
                        <FaPlus />
                        Dodaj državu
                    </Button>
                </div>
            </Form>

        </section>
    )
}