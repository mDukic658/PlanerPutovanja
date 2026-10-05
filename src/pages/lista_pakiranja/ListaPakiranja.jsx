import { useEffect, useState } from "react"
import PutovanjaService from "../../services/putovanja/PutovanjaService"
import PakiranjaService from "../../services/lista_pakiranja/PakiranjaService"
import PredmetiService from "../../services/predmeti/PredmetiService"
import { Tab, Tabs } from "react-bootstrap"
import Pakiranje from "./Pakiranje"
import NovoPakiranje from "./NovoPakiranje"

export default function ListaPakiranja() {

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

    function promijeni(predmetSifra, putovanjeSifra) {

        const novaPakiranja = pakiranja.map((stavka) => {

            if (
                stavka.predmetSifra === predmetSifra &&
                stavka.putovanjeSifra === putovanjeSifra
            ) {
                return {
                    ...stavka,
                    spakirano: !stavka.spakirano
                }
            }

            return stavka
        })

        setPakiranja(novaPakiranja)
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

                        <NovoPakiranje
                            putovanjeSifra={putovanje.sifra}
                            ucitajPakiranja={ucitajPakiranja}
                        />

                    </Tab>
                ))}
            </Tabs>
        </>
    )
}