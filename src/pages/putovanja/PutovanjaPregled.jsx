import { useEffect, useState } from "react"
import PutovanjaService from "../../services/putovanja/PutovanjaService"
import { Button, Badge, Table } from "react-bootstrap"
import FormatDatuma from "../../components/FormatDatuma"
import { NumericFormat } from "react-number-format"
import { Link, useNavigate } from "react-router-dom"
import { RouteNames } from "../../constants"
import { BsSuitcase2Fill } from "react-icons/bs"
import { FaPlus, FaPen, FaTrash } from "react-icons/fa"

export default function PutovanjePregled() {

    const [putovanja, setPutovanja] = useState([])

    const navigate = useNavigate()

    useEffect(() => {
        ucitajPutovanja()
    }, [])

    async function ucitajPutovanja() {
        await PutovanjaService.get().then((odgovor) => {
            setPutovanja(odgovor.data)
        })
    }

    async function obrisi(sifra) {
        if (!confirm('Sigurno obrisati?')) {
            return
        }

        await PutovanjaService.obrisi(sifra)
        ucitajPutovanja()
    }

    return (
            <section className="pregled-putovanja" >

                <div className="putovanje-zaglavlje" >
                    <h2>
                        <BsSuitcase2Fill />
                        Putovanja
                    </h2>

                    <Link to={RouteNames.PUTOVANJA_DODAJ}
                        className="btn btn-primary"
                    >
                        <FaPlus />
                        Novo Putovanje
                    </Link>
                </div>

                <div className="putovanje-tablica" >
                    <Table hover responsive striped bordered className="mb-0" >
                        <thead>
                            <tr>
                                <th>Naziv</th>
                                <th>Destinacija</th>
                                <th>Država</th>
                                <th>Datum Polaska</th>
                                <th>Datum povratka</th>
                                <th>Budžet</th>
                                <th>Akcija</th>
                            </tr>
                        </thead>
                        <tbody>

                            {putovanja && putovanja.map((p) => (

                                <tr key={p.sifra}>
                                    <td className="putovanje-naziv">
                                        {p.naziv}
                                    </td>

                                    <td> {p.destinacija} </td>
                                    <td> {p.drzava} </td>
                                    <td>
                                        <FormatDatuma datum={p.datumPolaska} />
                                    </td>
                                    <td>
                                        <FormatDatuma datum={p.datumPovratka} />
                                    </td>
                                    <td className="desno">
                                        <NumericFormat
                                            value={p.budzet}
                                            displayType={'text'}
                                            decimalSeparator=","
                                            decimalScale={2}
                                            fixedDecimalScale
                                            thousandSeparator='.'
                                            suffix=" €"
                                        />
                                    </td>
                                    <td>
                                        <div className="putovanja-akcije" >
                                            <Button
                                                onClick={() => { navigate(`/putovanja/${p.sifra}`) }}>
                                                <FaPen />
                                                Promijeni
                                            </Button>

                                            <Button
                                                variant="danger"
                                                onClick={() => obrisi(p.sifra)} >
                                                <FaTrash />
                                                Izbriši
                                            </Button>
                                        </div>
                                    </td>
                                </tr>

                            ))}

                            {putovanja.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="putovanja-prazno">
                                        Trenutno nemaš niti jedno putovanje.
                                    </td>
                                </tr>
                            )}

                        </tbody>
                    </Table>
                </div>

                <div className="putovanja-ukupno" >
                    Ukupno &nbsp;
                    <Badge pill bg="success">
                        {putovanja && putovanja.length}
                    </Badge>
                    &nbsp; putovanja
                </div>
            </section>
    )
}