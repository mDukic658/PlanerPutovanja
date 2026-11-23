import { useObavijesti } from "../../components/zajednicko/Obavijesti"
import PotvrdaBrisanja from "../../components/zajednicko/PotvrdaBrisanja"
import { useEffect, useState } from "react"
import OperaterService from "../../services/operateri/OperaterService"
import { Table, Button } from "react-bootstrap"
import { Link, useNavigate } from "react-router-dom"
import { IME_APLIKACIJE, RouteNames } from "../../constants"
import { FaEdit, FaTrash, FaKey } from "react-icons/fa"

export default function OperaterPregled() {

    const navigate = useNavigate()
    const obavijesti = useObavijesti()
    const [operateri, setOperateri] = useState([])
    const [brisanjeUTijeku, setBrisanjeUTijeku] = useState(false)
    const [operaterZaBrisanje, setOperaterZaBrisanje] = useState(null)

    useEffect(()=>{document.title='Operateri, ' + IME_APLIKACIJE})

    useEffect(() => {
        ucitajOperatere()
    }, [])

    async function ucitajOperatere() {
        await OperaterService.get().then((odgovor) => {
            if (!odgovor.success) {
                alert('Nije implementiran servis')
                return
            }
            setOperateri(odgovor.data)
        })
    }

    async function obrisi() {
        if (!operaterZaBrisanje || brisanjeUTijeku) return

        setBrisanjeUTijeku(true)
        try {
            const odgovor = await OperaterService.obrisi(operaterZaBrisanje.sifra)
            if (odgovor?.success === false) {
                throw new Error(odgovor.message)
            }

            setOperateri(prethodni => prethodni.filter(
                stavka => stavka.sifra !== operaterZaBrisanje.sifra
            ))
            obavijesti("Operater je obrisan.")
        } catch (error) {
            console.error(error)
            obavijesti("Brisanje operatera nije uspjelo.", "danger")
        } finally {
            setOperaterZaBrisanje(null)
            setBrisanjeUTijeku(false)
        }
    }

    return (
        <>
            <Link to={RouteNames.OPERATERI_NOVI}
                className="btn btn-success w-100 my-3">
                Dodavanje novog operatera
            </Link>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Uloga</th>
                        <th className="text-center" style={{width: '200px'}}>Akcije</th>
                    </tr>
                </thead>
                <tbody>
                    {operateri && operateri.map((operater) => (
                        <tr key={operater.sifra}>
                            <td>{operater.email}</td>
                            <td>
                                <span className={`badge ${operater.uloga === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                                    {operater.uloga}
                                </span>
                            </td>
                            <td className="text-center">
                                <div className="d-flex gap-2 justify-content-center">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => navigate(`/operateri/${operater.sifra}`)}
                                        title="Promjeni email"
                                    >
                                        <FaEdit />
                                    </Button>
                                    <Button
                                        variant="outline-warning"
                                        size="sm"
                                        onClick={() => navigate(`/operateri/${operater.sifra}/lozinka`)}
                                        title="Promjeni lozinku"
                                    >
                                        <FaKey />
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => setOperaterZaBrisanje(operater)}
                                        title="Obriši"
                                    >
                                        <FaTrash />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <PotvrdaBrisanja
                otvoreno={operaterZaBrisanje !== null}
                naslov="Brisanje operatera"
                brisanjeUTijeku={brisanjeUTijeku}
                onOdustani={() => setOperaterZaBrisanje(null)}
                onPotvrdi={obrisi}
            >
                Želiš li obrisati operatera „{operaterZaBrisanje?.email}”?
            </PotvrdaBrisanja>
        </>
    )
}
