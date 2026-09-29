import { useEffect, useState } from "react"
import PutovanjaService from "../../services/putovanja/PutovanjaService"
import { Badge, Table, Button } from "react-bootstrap"
import FormatDatuma from "../../components/FormatDatuma"
import { NumericFormat } from "react-number-format"
import { Link } from "react-router-dom"
import { RouteNames } from "../../constants"

export default function PutovanjePregled() {

    const [putovanja, setPutovanja] = useState([])
    const [prosireni, setProsireni] = useState([])

    function promijeniProsireno(sifra) {
        if (prosireni.includes(sifra)) {
            setProsireni(prosireni.filter(id => id !== sifra))
        } else {
            setProsireni([...prosireni, sifra])
        }
    }

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
                                {prosireni.includes(putovanja.sifra) ? (
                                    <>
                                        {putovanja.naziv}

                                        <br />

                                        <Button
                                            variant="info"
                                            size="sm"
                                            className="p-0"
                                            onClick={() => promijeniProsireno(putovanja.sifra)}
                                        >
                                            Sažmi
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        {putovanja.naziv.length > 25
                                            ? putovanja.naziv.substring(0, 25)
                                            : putovanja.naziv}

                                        {putovanja.naziv.length > 25 && (
                                            <Button
                                                variant="info"
                                                size="sm"
                                                className="p-0"
                                                onClick={() => promijeniProsireno(putovanja.sifra)}
                                            >
                                                ...
                                            </Button>
                                        )}
                                    </>
                                )}
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