import { Spinner } from "react-bootstrap"

export default function IndikatorUcitavanja({ poruka = "Učitavanje..." }) {
    return (
        <div role="status" className="d-flex align-items-center gap-2 my-3">
            <Spinner animation="border" size="sm" aria-hidden="true" />
            <span>{poruka}</span>
        </div>
    )
}