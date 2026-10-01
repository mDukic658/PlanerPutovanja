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
                    </tr>
                </thead>
                <tbody>

                    {putovanja && putovanja.map((putovanja) => (

                        <tr key={putovanja.sifra}>
                            <td className="lead">
                                {putovanja.naziv}
                            </td>

                            <td> {putovanja.destinacija} </td>
                            <td> {putovanja.drzava} </td>
                            <td>
                                <FormatDatuma datum={putovanja.datumPolaska} />
                            </td>
                            <td>
                                <FormatDatuma datum={putovanja.datumPovratka} />
                            </td>
                            <td className="desno">
                                <NumericFormat
                                    value={putovanja.budzet}
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
                                    onClick={() => { navigate(`/putovanja/${putovanja.sifra}`) }}>
                                    Promijeni
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