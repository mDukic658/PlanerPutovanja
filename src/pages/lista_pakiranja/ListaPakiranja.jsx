import { useEffect, useState } from "react"
import PutovanjaService from "../../services/putovanja/PutovanjaService"
import PakiranjaService from "../../services/lista_pakiranja/PakiranjaService"
import PredmetiService from "../../services/predmeti/PredmetiService"
import { Button, Tab, Tabs } from "react-bootstrap"
import Pakiranje from "./Pakiranje"
import { useNavigate } from "react-router-dom"
import { FaSuitcaseRolling, FaPen, FaMapMarkerAlt } from "react-icons/fa"

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
         <section className="pregled-pakiranja">

            <h2 className="pakiranja-naslov">
                <FaSuitcaseRolling />
                Lista pakiranja
            </h2>

            {putovanja.length === 0 ? (
                <p className="pakiranja-prazno">
                    Prvo dodaj putovanje kako bi mogao napraviti listu pakiranja.
                </p>
            ) : (
                <Tabs
                    key={putovanja[0].sifra}
                    defaultActiveKey={putovanja[0].sifra}
                    variant="pills"
                    className="lista-pakiranja-tabs"
                >
                    {putovanja.map((putovanje) => (
                        <Tab
                            eventKey={putovanje.sifra}
                            title={putovanje.naziv}
                            key={putovanje.sifra}
                        >
                            <div className="pakiranja-pregled-kartica">

                                <div className="pakiranja-zaglavlje">
                                    <div>
                                        <h3>{putovanje.naziv}</h3>

                                        <p className="pakiranja-lokacija">
                                            <FaMapMarkerAlt />
                                            {putovanje.destinacija},
                                            {" "}{putovanje.drzava}
                                        </p>
                                    </div>

                                    <Button
                                        variant="primary"
                                        onClick={() => {
                                            navigate(
                                                "/lista/pakiranja/" + putovanje.sifra
                                            )
                                        }}
                                    >
                                        <FaPen />
                                        Uredi listu pakiranja
                                    </Button>
                                </div>

                                <div className="pakiranja-stavke">
                                    {pakiranja
                                        .filter((pakiranje) =>
                                            pakiranje.putovanjeSifra === putovanje.sifra
                                        )
                                        .map((pakiranje) => (
                                            <div
                                                className="pakiranje-red"
                                                key={pakiranje.predmetSifra}
                                            >
                                                <Pakiranje
                                                    pakiranje={pakiranje}
                                                    predmeti={predmeti}
                                                    promijeni={promijeni}
                                                />
                                            </div>
                                        ))}
                                </div>

                                {!pakiranja.some((pakiranje) =>
                                    pakiranje.putovanjeSifra === putovanje.sifra
                                ) && (
                                    <p className="pakiranja-prazno">
                                        Još nema predmeta za ovo putovanje.
                                        Dodaj ih kroz uređivanje liste.
                                    </p>
                                )}

                            </div>
                        </Tab>
                    ))}
                </Tabs>
            )}

        </section>
    )
}