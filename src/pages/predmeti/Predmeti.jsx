import { useEffect, useState } from "react"
import { Button, Form, Table, Pagination } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import PredmetiService from "../../services/predmeti/PredmetiService"
import { RouteNames } from "../../constants"
import { FaListUl, FaPlus, FaPen, FaTrash } from "react-icons/fa"
import { useObavijesti } from "../../components/Obavijesti"

export default function Predmeti() {

    const navigate = useNavigate()
    const obavijesti = useObavijesti()

    const [predmeti, setPredmeti] = useState([])
    const [trenutnaStranica, setTrenutnuStranicu] = useState(1)
    const [ukupnoStranica, setUkupnoStranica] = useState(0)
    const [ukupnoStavki, setUkupnoStavki] = useState(0)

    const velicinaStranice = 10


    useEffect(() => {
        ucitajPredmete(trenutnaStranica).catch((error) => {
            console.error(error)
            obavijesti("Učitavanje predmeta nije uspjelo.", "danger")
        })
    }, [trenutnaStranica])

    async function ucitajPredmete(stranica) {
        const odgovor = await PredmetiService.dohvatiStranicu(
            stranica,
            velicinaStranice
        )

        setPredmeti(odgovor.data)
        setUkupnoStranica(odgovor.ukupnoStranica)
        setUkupnoStavki(odgovor.ukupnoStavki)
    }

    function promijeniStranicu(stranica) {
        setTrenutnuStranicu(stranica)
    }

    async function obradiSubmit(e) {
        e.preventDefault()

        const obrazac = e.currentTarget
        const podaci = new FormData(obrazac)
        const naziv = podaci.get("naziv").trim()

        if (!naziv) {
            obavijesti("Unesi naziv predmeta.", "danger")
            return
        }

        try {
            await PredmetiService.dodaj({ naziv })
        } catch (error) {
            console.error(error)
            obavijesti("Dodavanje predmeta nije uspjelo.", "danger")
            return
        }

        obrazac.reset()
        obavijesti("Predmet je dodan.")

        try {
            await ucitajPredmete(trenutnaStranica)
        } catch (error) {
            console.error(error)
            obavijesti(
                "Predmet je dodan, ali osvježavanje popisa nije uspjelo.",
                "danger"
            )
        }
    }

    async function obrisi(sifra) {
        try {
            await PredmetiService.obrisi(sifra)
        } catch (error) {
            console.error(error)
            obavijesti("Brisanje predmeta nije uspjelo.", "danger")
            return
        }

        obavijesti("Predmet je obrisan.")

        const noveUkupneStavke = ukupnoStavki - 1

        const noveUkupneStranice = Math.max(
            1,
            Math.ceil(noveUkupneStavke / velicinaStranice)
        )

        if (trenutnaStranica > noveUkupneStranice) {
            setTrenutnuStranicu(noveUkupneStranice)
        } else {
            try {
                await ucitajPredmete(trenutnaStranica)
            } catch (error) {
                console.error(error)
                obavijesti(
                    "Predmet je obrisan, ali osvježavanje popisa nije uspjelo.",
                    "danger"
                )
            }
        }
    }

    return (
        <section className="pregled-predmeta">

            <h2 className="predmeti-naslov">
                <FaListUl />
                {" "}  Predmeti
            </h2>

            <div className="predmeti-tablica">
                <Table hover responsive className="mb-0">
                    <thead>
                        <tr>
                            <th>Naziv predmeta</th>
                            <th>Akcija</th>
                        </tr>
                    </thead>

                    <tbody>
                        {predmeti.map((predmet) => (
                            <tr key={predmet.sifra}>
                                <td className="predmet-naziv">
                                    {predmet.naziv}
                                </td>

                                <td>
                                    <div className="predmeti-akcije">
                                        <Button
                                            variant="primary"
                                            onClick={() => {
                                                navigate(
                                                    RouteNames.PREDMET_PROMJENA.replace(
                                                        ":sifra",
                                                        String(predmet.sifra)
                                                    )
                                                )
                                            }}
                                        >
                                            <FaPen />
                                            {" "}Promijeni
                                        </Button>

                                        <Button
                                            variant="danger"
                                            onClick={() => obrisi(predmet.sifra)}
                                        >
                                            <FaTrash />
                                            {" "}Obriši
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {predmeti.length === 0 && (
                            <tr>
                                <td colSpan={2} className="predmeti-prazno">
                                    Trenutno nema dodanih predmeta.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>

            {ukupnoStranica > 1 && (
                <nav
                    aria-label="Stranice predmeta"
                    className="mt-4"
                >
                    <Pagination className="justify-content-center flex-wrap">

                        <Pagination.First
                            disabled={trenutnaStranica === 1}
                            onClick={() => promijeniStranicu(1)}
                        />

                        <Pagination.Prev
                            disabled={trenutnaStranica === 1}
                            onClick={() =>
                                promijeniStranicu(trenutnaStranica - 1)
                            }
                        />

                        {Array.from(
                            { length: ukupnoStranica },
                            (_, indeks) => {
                                const brojStranice = indeks + 1

                                if (
                                    brojStranice === 1 ||
                                    brojStranice === ukupnoStranica ||
                                    (
                                        brojStranice >= trenutnaStranica - 2 &&
                                        brojStranice <= trenutnaStranica + 2
                                    )
                                ) {
                                    return (
                                        <Pagination.Item
                                            key={brojStranice}
                                            active={
                                                brojStranice === trenutnaStranica
                                            }
                                            onClick={() =>
                                                promijeniStranicu(brojStranice)
                                            }
                                        >
                                            {brojStranice}
                                        </Pagination.Item>
                                    )
                                }

                                if (
                                    brojStranice === trenutnaStranica - 3 ||
                                    brojStranice === trenutnaStranica + 3
                                ) {
                                    return (
                                        <Pagination.Ellipsis
                                            key={brojStranice}
                                            disabled
                                        />
                                    )
                                }

                                return null
                            }
                        )}

                        <Pagination.Next
                            disabled={
                                trenutnaStranica === ukupnoStranica
                            }
                            onClick={() =>
                                promijeniStranicu(trenutnaStranica + 1)
                            }
                        />

                        <Pagination.Last
                            disabled={
                                trenutnaStranica === ukupnoStranica
                            }
                            onClick={() =>
                                promijeniStranicu(ukupnoStranica)
                            }
                        />

                    </Pagination>
                </nav>
            )}

            <p className="predmeti-ukupno">
                Ukupno predmeta:
                <span>{ukupnoStavki}</span>
            </p>

            <Form
                onSubmit={obradiSubmit}
                className="dodavanje-predmeta"
            >
                <h3>
                    <FaPlus />
                    {" "}Dodaj predmet
                </h3>

                <Form.Group controlId="naziv">
                    <Form.Label>Naziv predmeta</Form.Label>

                    <Form.Control
                        type="text"
                        name="naziv"
                        placeholder="Npr. Putovnica"
                        required
                    />
                </Form.Group>

                <Button
                    type="submit"
                    variant="primary"
                    className="mt-3"
                >
                    <FaPlus />
                    {" "}Dodaj predmet
                </Button>
            </Form>

        </section>
    )
}