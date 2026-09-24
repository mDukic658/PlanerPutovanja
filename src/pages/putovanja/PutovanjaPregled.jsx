import { useEffect, useState } from "react"
import PutovanjaService from "../../services/putovanja/PutovanjaService"

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
            Ovdje dođe pregled putovanja
            <hr />
            <pre>
                {JSON.stringify(putovanja, null, 2)}
            </pre>
        </>
    )
}