import { Link } from "react-router-dom"
import { Button, Card, Col, Row } from "react-bootstrap"
import { FaPen, FaTrash } from "react-icons/fa"
import { RouteNames } from "../../constants"
import FormatDatuma from "../FormatDatuma"

export default function PopisPosjeta({
    posjeti,
    onObrisi,
    brisanjeSifra
}) {
    const sortiraniPosjeti = [...posjeti].sort(
        (a, b) =>
            String(b.datumPosjeta).localeCompare(
                String(a.datumPosjeta)
            ) || Number(b.sifra) - Number(a.sifra)
    )

    return (
        <section className="mt-4" aria-labelledby="posjeti-naslov">
            <h3 id="posjeti-naslov" className="h4 mb-3">
                Evidentirani posjeti
            </h3>

            {sortiraniPosjeti.length === 0 ? (
                <p>Još nema evidentiranih posjeta.</p>
            ) : (
                <Row className="g-3">
                    {sortiraniPosjeti.map(posjet => (
                        <Col xs={12} md={6} lg={4} key={posjet.sifra}>
                            <Card className="h-100">
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title>
                                        {posjet.grad}
                                    </Card.Title>

                                    <p className="text-muted mb-2">
                                        {posjet.drzava}
                                    </p>

                                    <div className="mb-3">
                                        <FormatDatuma
                                            datum={posjet.datumPosjeta}
                                        />
                                    </div>

                                    {posjet.napomena && (
                                        <p
                                            style={{
                                                whiteSpace: "pre-wrap",
                                                overflowWrap: "anywhere"
                                            }}
                                        >
                                            {posjet.napomena}
                                        </p>
                                    )}

                                    <div className="d-flex flex-wrap gap-2 mt-auto">
                                        <Link
                                            to={RouteNames.KARTA_POSJETA_PROMJENA.replace(
                                                ":sifra",
                                                posjet.sifra
                                            )}
                                            className="btn btn-primary"
                                        >
                                            <FaPen />
                                            {" "}Promijeni
                                        </Link>

                                        <Button
                                            type="button"
                                            variant="outline-danger"
                                            disabled={brisanjeSifra !== null}
                                            onClick={() => onObrisi(posjet)}
                                        >
                                            <FaTrash />
                                            {" "}
                                            {brisanjeSifra === posjet.sifra
                                                ? "Brisanje..."
                                                : "Izbriši"}
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </section>
    )
}