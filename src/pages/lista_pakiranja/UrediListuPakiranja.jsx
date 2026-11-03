import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import PutovanjaService from "../../services/putovanja/PutovanjaService"
import PakiranjaService from "../../services/lista_pakiranja/PakiranjaService"
import PredmetiService from "../../services/predmeti/PredmetiService"
import Pakiranje from "./Pakiranje"
import NovoPakiranje from "./NovoPakiranje"
import { Button, Form } from "react-bootstrap"
import { RouteNames } from "../../constants"
import { FaArrowLeft, FaPen, FaTrash, FaPlus, FaMapMarkerAlt } from "react-icons/fa"
import { useObavijesti } from "../../components/Obavijesti"

export default function UrediListuPakiranja() {

    const params = useParams()
    const obavijesti = useObavijesti()

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

    async function spremiNapomenu(e, pakiranje) {
        e.preventDefault()

        const podaci = new FormData(e.currentTarget)
        const napomena = String(podaci.get("napomena") ?? "").trim()
        const prethodnaNapomena = String(pakiranje.napomena ?? "").trim()

        if (napomena === prethodnaNapomena) {
            obavijesti("Napomena nije promijenjena.", "info")
            return
        }

        const novoPakiranje = {
            ...pakiranje,
            napomena
        }

        try {
            await PakiranjaService.promijeni(
                pakiranje.predmetSifra,
                pakiranje.putovanjeSifra,
                novoPakiranje
            )
        } catch (error) {
            console.error(error)
            obavijesti("Spremanje napomene nije uspjelo.", "danger")
            return
        }

        obavijesti(
            !napomena
                ? "Napomena je uklonjena."
                : prethodnaNapomena
                    ? "Napomena je uspješno promijenjena."
                    : "Napomena je uspješno dodana.",
            "success"
        )

        await ucitajPakiranja()
    }

    async function obrisi(predmetSifra, putovanjeSifra) {

        await PakiranjaService.obrisi(
            predmetSifra,
            putovanjeSifra
        )

        ucitajPakiranja()
    }

    return (
        <section className="uredivanje-pakiranja">

            <Link
                to={RouteNames.LISTA_PAKIRANJA}
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
                    {pakiranja
                        .filter((pakiranje) =>
                            pakiranje.putovanjeSifra === parseInt(params.sifra)
                        )
                        .map((pakiranje) => (
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

                                    <Form
                                        className="mt-4 ms-4"
                                        onSubmit={(e) =>
                                            spremiNapomenu(e, pakiranje)
                                        }
                                    >
                                        <Form.Group
                                            controlId={`napomena-${pakiranje.putovanjeSifra}-${pakiranje.predmetSifra}`}
                                        >
                                            <Form.Label>
                                                Napomena
                                            </Form.Label>

                                            <Form.Control
                                                as="textarea"
                                                rows={2}
                                                name="napomena"
                                                defaultValue={
                                                    pakiranje.napomena ?? ""
                                                }
                                                placeholder="Napomena za ovaj predmet"
                                            />
                                        </Form.Group>

                                        <Button
                                            type="submit"
                                            variant="primary"
                                            size="sm"
                                            className="mt-2"
                                        >
                                            Spremi napomenu
                                        </Button>
                                    </Form>
                                </div>

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
                                    <FaTrash />
                                    Obriši
                                </Button>
                            </div>
                        ))}
                </div>

                {!pakiranja.some((pakiranje) =>
                    pakiranje.putovanjeSifra === parseInt(params.sifra)
                ) && (
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
                        putovanjeSifra={parseInt(params.sifra)}
                        ucitajPakiranja={ucitajPakiranja}
                    />
                </div>

            </div>

        </section>
    )
}