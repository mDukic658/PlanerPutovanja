import { useEffect, useState } from "react"
import PutovanjaService from "../../services/putovanja/PutovanjaService"
import { Button, Badge, Table } from "react-bootstrap"
import FormatDatuma from "../../components/FormatDatuma"
import { NumericFormat } from "react-number-format"
import { Link, useNavigate } from "react-router-dom"
import { RouteNames } from "../../constants"

export default function PutovanjePregled() {

    const [putovanja, setPutovanja] = useState([])

    const navigate = useNavigate()

    useEffect(() => {
        console.log('Došao na pregled putovanja')
        ucitajPutovanja()
    }, [])

    async function ucitajPutovanja() {
        await PutovanjaService.get().then((odgovor) => {
            setPutovanja(odgovor.data)
        })
    }

    async function obrisi(sifra){
        if(!confirm('Sigurno obrisati?')){
            return
        }

        await PutovanjaService.obrisi(sifra)
        ucitajPutovanja()
    }

    return (
        <>

            <Link to={RouteNames.PUTOVANJA_DODAJ}
                className="btn btn-success w-100 my-3"
            >
                Dodavanje novog putovanja
            </Link>

            <Table hover striped bordered>
                <thead>
                    <tr>
                        <th>Naziv</th>
                        <th>Destinacija</th>
                        <th>Država</th>
                        <th>Datum Polaska</th>
                        <th>Datum povratka</th>
                        <th>Budžet</th>
                        <th>Promjena</th>
                        <th>Brisanje</th>
                    </tr>
                </thead>
                <tbody>

                    {putovanja && putovanja.map((p) => (

                        <tr key={p.sifra}>
                            <td className="lead">
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
                                <Button
                                    onClick={() => { navigate(`/putovanja/${p.sifra}`) }}>
                                    Promijeni
                                </Button>
                            </td>
                            <td>
                                <Button
                                variant="danger"
                                onClick = {() => obrisi(p.sifra)} >
                                    Izbriši
                                </Button>
                            </td>
                        </tr>

                    ))}

                </tbody>
            </Table>

            Ukupno &nbsp;
            <Badge pill bg="success">
                {putovanja && putovanja.length}
            </Badge>
            &nbsp; putovanja

            {/* <pre>
                {JSON.stringify(putovanja, null, 2)}
            </pre> */}
        </>
    )
}