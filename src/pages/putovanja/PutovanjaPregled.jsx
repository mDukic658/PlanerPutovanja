import { useEffect, useState } from "react"
import PutovanjaService from "../../services/putovanja/PutovanjaService"
import { Badge, Table } from "react-bootstrap"

export default function PutovanjePregled() {

    const [putovanja, setPutovanja] = useState([])

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
                            <td> {putovanja.naziv} </td>
                            <td> {putovanja.destinacija} </td>
                            <td> {putovanja.drzava} </td>
                            <td> {putovanja.datumPolaska} </td>
                            <td> {putovanja.datumPovratka} </td>
                            <td> {putovanja.budzet} </td>
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