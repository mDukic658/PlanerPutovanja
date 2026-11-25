import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import PutovanjaService from "../../services/putovanja/PutovanjaService"
import PakiranjaService from "../../services/lista_pakiranja/PakiranjaService"
import PredmetiService from "../../services/predmeti/PredmetiService"
import PotvrdaBrisanja from "../../components/zajednicko/PotvrdaBrisanja"
import Pakiranje from "./Pakiranje"
import NovoPakiranje from "./NovoPakiranje"
import { Button } from "react-bootstrap"
import { FaArrowLeft, FaPen, FaTrash, FaPlus, FaMapMarkerAlt } from "react-icons/fa"

export default function UrediListuPakiranja() {

    const params = useParams()

    const [putovanje, setPutovanje] = useState([])
    const [predmeti, setPredmeti] = useState([])
    const [pakiranja, setPakiranja] = useState([])

    const [pakiranjeZaBrisanje, setPakiranjeZaBrisanje] = useState(null)
    const [brisanjeUTijeku, setBrisanjeUTijeku] = useState(false)
    const [greskaBrisanja, setGreskaBrisanja] = useState("")

    const pakiranjaPutovanja = pakiranja.filter(
        pakiranje => String(pakiranje.putovanjeSifra) === params.sifra
    )
    const nazivPredmetaZaBrisanje = predmeti.find(
        predmet => predmet.sifra === pakiranjeZaBrisanje?.predmetSifra
    )?.naziv

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

    async function potvrdiBrisanje() {
        if (!pakiranjeZaBrisanje || brisanjeUTijeku) return

        const { predmetSifra, putovanjeSifra } = pakiranjeZaBrisanje

        setBrisanjeUTijeku(true)
        setGreskaBrisanja("")

        try {
            const odgovor = await PakiranjaService.obrisi(predmetSifra, putovanjeSifra)

            if (odgovor?.success === false) {
                throw new Error(odgovor.message)
            }

            setPakiranja(stavke => stavke.filter(stavka =>
                stavka.predmetSifra !== predmetSifra ||
                stavka.putovanjeSifra !== putovanjeSifra
            ))
            setPakiranjeZaBrisanje(null)
        } catch {
            setGreskaBrisanja("Uklanjanje stavke nije uspjelo.")
        } finally {
            setBrisanjeUTijeku(false)
        }
    }

    return (
        <section className="uredivanje-pakiranja">

            <Link
                to={`/lista/pakiranja/odabrano/${params.sifra}`}
                className="natrag-na-pregled"
            >
                <FaArrowLeft />
                Natrag na pregled pakiranja
            </Link>

            <h2 className="uredivanje-pakiranja-naslov">
                <FaPen />
                Uredi listu pakiranja
            </h2>

            <div className="uredivanje-pakiranja-kartica">

                <div className="uredivanje-pakiranja-putovanje">
                    <h3>{putovanje.naziv}</h3>

                    <p className="pakiranja-lokacija">
                        <FaMapMarkerAlt />
                        {putovanje.destinacija},
                        {" "}{putovanje.drzava}
                    </p>
                </div>

                <h4 className="pakiranja-podnaslov">
                    Predmeti za putovanje
                </h4>

                <div className="pakiranja-stavke">
                    {pakiranjaPutovanja.map((pakiranje) => (
                        <div
                            key={pakiranje.predmetSifra}
                            className="pakiranje-red"
                        >
                            <div className="flex-grow-1">
                                <Pakiranje
                                    pakiranje={pakiranje}
                                    predmeti={predmeti}
                                    promijeni={promijeni}
                                />

                                {pakiranje.napomena && (
                                    <p
                                        className="small text-muted mt-2 mb-0"
                                        style={{
                                            whiteSpace: "pre-wrap",
                                            overflowWrap: "anywhere"
                                        }}
                                    >
                                        {pakiranje.napomena}
                                    </p>
                                )}
                            </div>

                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                    setGreskaBrisanja("")
                                    setPakiranjeZaBrisanje(pakiranje)
                                }}
                            >
                                <FaTrash />
                                Obriši
                            </Button>
                        </div>
                    ))}
                </div>

                {pakiranjaPutovanja.length === 0 && (
                    <p className="pakiranja-prazno">
                        Lista je prazna. Dodaj prvi predmet ispod.
                    </p>
                )}

                <div className="pakiranja-dodavanje">
                    <h4 className="pakiranja-podnaslov">
                        <FaPlus />
                        Dodaj predmet
                    </h4>

                    <NovoPakiranje
                        putovanjeSifra={params.sifra}
                        ucitajPakiranja={ucitajPakiranja}
                    />
                </div>

            </div>

            <PotvrdaBrisanja
                otvoreno={pakiranjeZaBrisanje !== null}
                naslov="Uklanjanje stavke s liste pakiranja"
                tekstPotvrde="Ukloni"
                brisanjeUTijeku={brisanjeUTijeku}
                onOdustani={() => setPakiranjeZaBrisanje(null)}
                onPotvrdi={potvrdiBrisanje}
            >
                <p className="mb-0">
                    Želiš li ukloniti {nazivPredmetaZaBrisanje
                        ? `„${nazivPredmetaZaBrisanje}”`
                        : "ovu stavku"} s liste pakiranja?
                </p>
                {greskaBrisanja && <p className="text-danger mt-2 mb-0" role="alert">{greskaBrisanja}</p>}
            </PotvrdaBrisanja>

        </section>
    )
}