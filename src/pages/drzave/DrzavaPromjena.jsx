import { Button, Form } from 'react-bootstrap'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { RouteNames } from '../../constants'
import DrzaveService from '../../services/drzave/DrzaveService'
import { useState, useEffect } from 'react'
import { FaArrowLeft, FaPen, FaSave, FaTimes } from 'react-icons/fa'
import { ShemaDrzava } from '../../schemas/ShemaDrzave'

export default function DrzavaPromjena() {
    const navigate = useNavigate()
    const { sifra } = useParams()
    const [greske, setGreske] = useState({})
    const [drzava, setDrzava] = useState({
        naziv: '',
    })

    async function ucitajDrzavu() {
        const odgovor = await DrzaveService.getBySifra(sifra)
        setDrzava(odgovor.data)
    }

    useEffect(() => {
        ucitajDrzavu()
    }, [sifra])

    async function promijeni(podaciDrzave) {
        await DrzaveService.promijeni(sifra, podaciDrzave)
        navigate(RouteNames.DRZAVE)
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
        promijeni(rezultat.data)
    }

    return (
        <section className="promjena-drzave">

            <Link
                to={RouteNames.DRZAVE}
                className="natrag-na-pregled"
            >
                <FaArrowLeft />
                Natrag na pregled država
            </Link>

            <h2 className="promjena-drzave-naslov">
                <FaPen />
                Promjena države
            </h2>

            <Form
                noValidate
                onSubmit={obradiSubmit}
                className="promjena-drzave-obrazac"
            >
                <Form.Group controlId="naziv">
                    <Form.Label>Naziv države</Form.Label>

                    <Form.Control
                        type="text"
                        name="naziv"
                        value={drzava.naziv || ''}
                        isInvalid={!!greske.naziv}
                        onChange={(e) => {
                            setDrzava(prethodna => ({
                                ...prethodna,
                                naziv: e.target.value
                            }))
                            setGreske({})
                        }}
                    />

                    <Form.Control.Feedback type="invalid">
                        {greske.naziv}
                    </Form.Control.Feedback>
                </Form.Group>

                <div className="promjena-drzave-akcije">
                    <Link
                        to={RouteNames.DRZAVE}
                        className="btn btn-outline-secondary"
                    >
                        <FaTimes />
                        Odustani
                    </Link>

                    <Button type="submit" variant="primary">
                        <FaSave />
                        Spremi promjene
                    </Button>
                </div>
            </Form>

        </section>
    )
}