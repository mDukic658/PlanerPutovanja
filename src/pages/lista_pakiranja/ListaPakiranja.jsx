import { useEffect, useState } from "react"
import PutovanjaService from "../../services/putovanja/PutovanjaService"
import PakiranjaService from "../../services/lista_pakiranja/PakiranjaService"
import PredmetiService from "../../services/predmeti/PredmetiService"
import { Button, Tab, Tabs } from "react-bootstrap"
import Pakiranje from "./Pakiranje"
import { useNavigate } from "react-router-dom"

export default function ListaPakiranja() {

    const navigate = useNavigate()

    const [putovanja, setPutovanja] = useState([])
    const [pakiranja, setPakiranja] = useState([])
    const [predmeti, setPredmeti] = useState([])

    useEffect(() => {
        ucitajPutovanja()
        ucitajPakiranja()
        ucitajPredmete()
    }, [])

    async function ucitajPutovanja() {
        await PutovanjaService.get().then((odgovor) => {
            setPutovanja(odgovor.data)
        })
    }

    async function ucitajPakiranja() {
        await PakiranjaService.get().then((odgovor) => {
            setPakiranja(odgovor.data)
        })
    }

    async function ucitajPredmete() {
        await PredmetiService.get().then((odgovor) => {
            setPredmeti(odgovor.data)
        })
    }

    async function promijeni(predmetSifra, putovanjeSifra) {

        const pakiranje = pakiranja.find(
            (stavka) =>
                stavka.predmetSifra === predmetSifra &&
                stavka.putovanjeSifra === putovanjeSifra
        )

        const novoPakiranje = {
            ...pakiranje,
            spakirano: !pakiranje.spakirano
        }

        await PakiranjaService.promijeni(
            predmetSifra,
            putovanjeSifra,
            novoPakiranje
        )

        ucitajPakiranja()
    }

    return (
        <>
            <h3>Lista pakiranja</h3>

            <Tabs
                defaultActiveKey={1}
                variant="pills"
                className="lista-pakiranja-tabs mb-3"
            >
                {putovanja && putovanja.map((putovanje) => (
                    <Tab
                        eventKey={putovanje.sifra}
                        title={putovanje.naziv}
                        key={putovanje.sifra}
                    >
                        <h4>{putovanje.naziv}</h4>

                        <p>
                            {putovanje.destinacija}, {putovanje.drzava}
                        </p>

                        <Button
                            variant="primary"
                            onClick={() => {
                                navigate('/lista/pakiranja/' + putovanje.sifra)
                            }}
                        >
                            Uredi listu pakiranja
                        </Button>

                        {pakiranja
                            .filter((pakiranje) =>
                                pakiranje.putovanjeSifra === putovanje.sifra
                            )
                            .map((pakiranje) => (
                                <Pakiranje
                                    key={pakiranje.predmetSifra}
                                    pakiranje={pakiranje}
                                    predmeti={predmeti}
                                    promijeni={promijeni}
                                />
                            ))
                        }

                    </Tab>
                ))}
            </Tabs>
        </>
    )
}