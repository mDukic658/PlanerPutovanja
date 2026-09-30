import { useEffect, useState } from "react";
import PutovanjaService from "../../services/putovanja/PutovanjaService";
import { Table } from "react-bootstrap";


export default function ListaPakiranja() {

    const [putovanja, setPutovanja] = useState([])

    useEffect(() => {
        ucitajPutovanja()
    }, [])

    async function ucitajPutovanja(){
        await PutovanjaService.get().then((odgovor) => {
            setPutovanja(odgovor.data)
        })
    }

    return (
        <>
        
        <h3>Lista pakiranja</h3>

        <Table hover striped border>
            <thead>
                <tr>
                    <th>Naziv</th>
                    <th>Destinacija</th>
                    <th>Država</th>
                </tr>
            </thead>

            <tbody>
                {putovanja && putovanja.map((putovanje) => (
                    <tr key={putovanje.sifra}>
                        <td> {putovanje.naziv} </td>
                        <td> {putovanje.destinacija} </td>
                        <td> {putovanje.drzava} </td>
                    </tr>
                ))}
            </tbody>

        </Table>

        </>
    )
}