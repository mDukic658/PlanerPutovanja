import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import PutovanjaService from "../../services/putovanja/PutovanjaService"
import PakiranjaService from "../../services/lista_pakiranja/PakiranjaService"
import PredmetiService from "../../services/predmeti/PredmetiService"
import Pakiranje from "./Pakiranje"
import NovoPakiranje from "./NovoPakiranje"
import { Button } from "react-bootstrap"

export default function UrediListuPakiranja() {

    const params = useParams()

    const [putovanje, setPutovanje] = useState([])
    const [predmeti, setPredmeti] = useState([])
    const [pakiranja, setPakiranja] = useState([])

    useEffect(() => {
        ucitajPutovanje()
        ucitajPakiranja()
        ucitajPredmete()
    }, [])

    async function ucitajPutovanje() {
        await PutovanjaService.getBySifra(params.sifra).then((odgovor) => {
            setPutovanje(odgovor.data)
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

    async function obrisi(predmetSifra, putovanjeSifra) {

        await PakiranjaService.obrisi(
            predmetSifra,
            putovanjeSifra
        )

        ucitajPakiranja()
    }

    return (
        <>
            <h3>Uredi listu pakiranja</h3>

            <h4>{putovanje.naziv}</h4>

            <p>
                {putovanje.destinacija}, {putovanje.drzava}
            </p>

            <h5>Predmeti za putovanje</h5>

            {pakiranja
                .filter((pakiranje) =>
                    pakiranje.putovanjeSifra === parseInt(params.sifra)
                )
                .map((pakiranje) => (
                    <div key={pakiranje.predmetSifra}>

                        <Pakiranje
                            pakiranje={pakiranje}
                            predmeti={predmeti}
                            promijeni={promijeni}
                        />

                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() =>
                                obrisi(
                                    pakiranje.predmetSifra,
                                    pakiranje.putovanjeSifra
                                )
                            }
                        >
                            Obriši
                        </Button>

                    </div>
                ))
            }

            <h5 className="mt-4">Dodaj predmet</h5>

            <NovoPakiranje
                putovanjeSifra={parseInt(params.sifra)}
                ucitajPakiranja={ucitajPakiranja}
            />
        </>
    )
}