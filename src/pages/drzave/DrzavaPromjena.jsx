import { Button, Form } from 'react-bootstrap'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { RouteNames } from '../../constants'
import DrzaveService from '../../services/drzave/DrzaveService'
import { useState, useEffect } from 'react'
import { FaArrowLeft, FaPen, FaSave, FaTimes } from 'react-icons/fa'

export default function DrzavaPromjena() {
    const navigate = useNavigate()
    const { sifra } = useParams()

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

        const podaci = new FormData(e.target)

        promijeni({
            naziv: podaci.get('naziv').trim(),
        })
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
                onSubmit={obradiSubmit}
                className="promjena-drzave-obrazac"
            >
                <Form.Group controlId="naziv">
                    <Form.Label>Naziv države</Form.Label>

                    <Form.Control
                        type="text"
                        name="naziv"
                        required
                        value={drzava.naziv || ''}
                        onChange={(e) =>
                            setDrzava({
                                ...drzava,
                                naziv: e.target.value,
                            })
                        }
                    />
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