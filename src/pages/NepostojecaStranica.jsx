import { Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { RouteNames } from '../constants'

export default function NepostojecaStranica() {
    const navigate = useNavigate()

    function natrag() {
        if (window.history.state?.idx > 0) {
            navigate(-1)
        } else {
            navigate(RouteNames.HOME, { replace: true })
        }
    }

    return (
        <section className="text-center py-5">
            <p className="display-1 fw-bold text-primary">
                404
            </p>

            <h1>Stranica nije pronađena</h1>

            <p className="text-muted">
                Stranica koju tražiš ne postoji ili je premještena.
            </p>

            <div className="d-flex justify-content-center gap-3 mt-4">
                <Button as={Link} to={RouteNames.HOME}>
                    Na početnu
                </Button>

                <Button
                    variant="outline-secondary"
                    onClick={natrag}
                >
                    Natrag
                </Button>
            </div>
        </section>
    )
}