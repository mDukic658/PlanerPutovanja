
import { useEffect, useState } from 'react'
import { Button, Table } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import DrzaveService from '../../services/drzave/DrzaveService'
import { RouteNames } from '../../constants'
import { FaGlobeEurope, FaPlus, FaPen, FaTrash } from 'react-icons/fa'

export default function DrzavePregled() {
    const navigate = useNavigate()
    const [drzave, setDrzave] = useState([])

    useEffect(() => {
        ucitajDrzave()
    }, [])

    async function ucitajDrzave() {
        const odgovor = await DrzaveService.get()
        setDrzave(odgovor.data)
    }

    async function obrisi(sifra) {
        await DrzaveService.obrisi(sifra)
        await ucitajDrzave()
    }

    return (
        <section className="pregled-drzava">

            <div className="drzave-zaglavlje">
                <h2>
                    <FaGlobeEurope />
                    Države
                </h2>

                <Button
                    variant="primary"
                    onClick={() => navigate(RouteNames.DRZAVE_DODAJ)}
                >
                    <FaPlus />
                    Dodaj državu
                </Button>
            </div>

            <div className="drzave-tablica">
                <Table hover responsive className="mb-0">
                    <thead>
                        <tr>
                            <th>Naziv države</th>
                            <th>Akcija</th>
                        </tr>
                    </thead>

                    <tbody>
                        {drzave.map((drzava) => (
                            <tr key={drzava.sifra}>
                                <td className="drzava-naziv">
                                    {drzava.naziv}
                                </td>

                                <td>
                                    <div className="drzave-akcije">
                                        <Button
                                            variant="primary"
                                            onClick={() =>
                                                navigate(
                                                    RouteNames.DRZAVE_PROMJENA.replace(
                                                        ':sifra',
                                                        String(drzava.sifra)
                                                    )
                                                )
                                            }
                                        >
                                            <FaPen />
                                            Promijeni
                                        </Button>

                                        <Button
                                            variant="danger"
                                            onClick={() => obrisi(drzava.sifra)}
                                        >
                                            <FaTrash />
                                            Obriši
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {drzave.length === 0 && (
                            <tr>
                                <td colSpan={2} className="drzave-prazno">
                                    Trenutno nema dodanih država.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>

            <p className="drzave-ukupno">
                Ukupno država:
                <span>{drzave.length}</span>
            </p>

        </section>
    )
}
