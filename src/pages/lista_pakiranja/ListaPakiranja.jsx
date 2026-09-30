import { useEffect, useState } from "react";
import PutovanjaService from "../../services/putovanja/PutovanjaService";
import { Tab, Tabs } from "react-bootstrap";


export default function ListaPakiranja() {

    const [putovanja, setPutovanja] = useState([])

    useEffect(() => {
        ucitajPutovanja()
    }, [])

    async function ucitajPutovanja() {
        await PutovanjaService.get().then((odgovor) => {
            setPutovanja(odgovor.data)
        })
    }

    return (
        <>

            <h3>Lista pakiranja</h3>

            <Tabs
                defaultActiveKey={1}
                variant="pills"
                className="mb-3"
            >

            </Tabs>

        </>
    )
}