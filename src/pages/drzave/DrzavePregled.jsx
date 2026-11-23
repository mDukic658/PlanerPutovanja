import { useObavijesti } from "../../components/zajednicko/Obavijesti"
import PotvrdaBrisanja from "../../components/zajednicko/PotvrdaBrisanja"

import { useEffect, useState } from 'react'
import { Button, Table } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import DrzaveService from '../../services/drzave/DrzaveService'
import { RouteNames } from '../../constants'
import { FaGlobeEurope, FaPlus, FaPen, FaTrash } from 'react-icons/fa'

export default function DrzavePregled() {
    const navigate = useNavigate()
    const obavijesti = useObavijesti()
    const [drzave, setDrzave] = useState([])
    const [brisanjeUTijeku, setBrisanjeUTijeku] = useState(false)
    const [drzavaZaBrisanje, setDrzavaZaBrisanje] = useState(null)

    useEffect(() => {
        ucitajDrzave()
    }, [])

    async function ucitajDrzave() {
        const odgovor = await DrzaveService.get()
        setDrzave(odgovor.data)
    }

    async function obrisi() {
        if (!drzavaZaBrisanje || brisanjeUTijeku) return

        setBrisanjeUTijeku(true)
        try {
            const odgovor = await DrzaveService.obrisi(drzavaZaBrisanje.sifra)
            if (odgovor?.success === false) {
                throw new Error(odgovor.message)
            }

            setDrzave(prethodni => prethodni.filter(
                stavka => stavka.sifra !== drzavaZaBrisanje.sifra
            ))
            obavijesti("Država je obrisana.")
        } catch (error) {
            console.error(error)
            obavijesti("Brisanje države nije uspjelo.", "danger")
        } finally {
            setDrzavaZaBrisanje(null)
            setBrisanjeUTijeku(false)
        }
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
                                            onClick={() => setDrzavaZaBrisanje(drzava)}
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

            <PotvrdaBrisanja
                otvoreno={drzavaZaBrisanje !== null}
                naslov="Brisanje države"
                brisanjeUTijeku={brisanjeUTijeku}
                onOdustani={() => setDrzavaZaBrisanje(null)}
                onPotvrdi={obrisi}
            >
                Želiš li obrisati državu „{drzavaZaBrisanje?.naziv}”?
            </PotvrdaBrisanja>
        </section>
    )
}
