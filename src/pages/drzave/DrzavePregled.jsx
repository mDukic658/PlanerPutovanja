
import { useEffect, useState } from 'react'
import { Button, Table } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import DrzaveService from '../../services/drzave/DrzaveService'
import { RouteNames } from '../../constants'

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
        <>
            <h3>Države</h3>

            <Button
                variant="success"
                className="mb-3"
                onClick={() => navigate(RouteNames.DRZAVE_DODAJ)}
            >
                Dodaj državu
            </Button>

            <Table hover striped bordered responsive>
                <thead>
                    <tr>
                        <th>Naziv države</th>
                        <th>Akcija</th>
                    </tr>
                </thead>

                <tbody>
                    {drzave.map((drzava) => (
                        <tr key={drzava.sifra}>
                            <td>{drzava.naziv}</td>
                            <td>
                                <Button
                                    variant="success"
                                    onClick={() =>
                                        navigate(
                                            RouteNames.DRZAVE_PROMJENA.replace(
                                                ':sifra',
                                                String(drzava.sifra)
                                            )
                                        )
                                    }
                                >
                                    Promijeni
                                </Button>

                                <Button
                                    variant="danger"
                                    onClick={() => obrisi(drzava.sifra)}
                                >
                                    Obriši
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </>
    )
}
