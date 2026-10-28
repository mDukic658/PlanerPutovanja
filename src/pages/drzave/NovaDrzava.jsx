import { Button, Form } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { RouteNames } from '../../constants'
import DrzaveService from '../../services/drzave/DrzaveService'
import { FaArrowLeft, FaGlobeEurope, FaPlus, FaTimes } from 'react-icons/fa'

export default function NovaDrzava() {
    const navigate = useNavigate()

    async function dodaj(drzava) {
        await DrzaveService.dodaj(drzava).then(() => {
            navigate(RouteNames.DRZAVE)
        })
    }

    function obradiSubmit(e) {
        e.preventDefault()

        const podaci = new FormData(e.target)

        dodaj({
            naziv: podaci.get('naziv').trim(),
        })
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
                onSubmit={obradiSubmit}
                className="nova-drzava-obrazac"
            >
                <Form.Group controlId="naziv">
                    <Form.Label>Naziv države</Form.Label>

                    <Form.Control
                        type="text"
                        name="naziv"
                        placeholder="Npr. Hrvatska"
                        required
                    />
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