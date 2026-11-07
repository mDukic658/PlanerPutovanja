import { useEffect, useState } from "react"
import { Calendar, dayjsLocalizer } from "react-big-calendar"
import dayjs from "dayjs"
import "dayjs/locale/hr"
import "react-big-calendar/lib/css/react-big-calendar.css"
import PutovanjaService from "../services/putovanja/PutovanjaService"
import ItinerarService from "../services/itinerar/ItinerarService"
import PakiranjaService from "../services/lista_pakiranja/PakiranjaService"
import { useObavijesti } from "../components/Obavijesti"
import GodisnjiPregled from "../components/GodisnjiPregled"
import PutovanjePanel from "../components/kalendar/PutovanjePanel"
import PutovanjeModali from "../components/kalendar/PutovanjeModali"
import AktivnostModali from "../components/kalendar/AktivnostiModali"
import { dohvatiNapredakPakiranja, napraviDogadajeItinerara, napraviDogadajePutovanja, dohvatiStilDatuma } from "../utils/kalendarPomocne"
import KalendarKontrole from "../components/kalendar/KalendarKontrole"

const localizer = dayjsLocalizer(dayjs)

export default function Kalendar() {

    const obavijesti = useObavijesti()

    const [putovanja, setPutovanja] = useState([])
    const [stavkeItinerara, setStavkeItinerara] = useState([])
    const [pakiranja, setPakiranja] = useState([])
    const [ucitavanje, setUcitavanje] = useState(true)
    const [greska, setGreska] = useState("")
    const [datumPolaska, setDatumPolaska] = useState("")
    const [pocetniDatumi, setPocetniDatumi] = useState(null)
    const [putovanjeZaAktivnost, setPutovanjeZaAktivnost] = useState(null)
    const [odabranoPutovanje, setOdabranoPutovanje] = useState(null)
    const [putovanjeZaUredivanje, setPutovanjeZaUredivanje] = useState(null)
    const [brisanje, setBrisanje] = useState(false)
    const [odabranaAktivnost, setOdabranaAktivnost] = useState(null)
    const [godisnjiPrikaz, setGodisnjiPrikaz] = useState(false)
    const [datumKalendara, setDatumKalendara] = useState(new Date())
    const [pogledKalendara, setPogledKalendara] = useState("month")

    useEffect(() => {
        ucitajPodatke()
    }, [])

    async function ucitajPodatke() {
        try {
            await Promise.all([
                ucitajPutovanja(),
                ucitajItinerar(),
                ucitajPakiranja()
            ])
        } catch (error) {
            console.error(error)
            setGreska("Učitavanje podataka kalendara nije uspjelo.")
            obavijesti(
                "Učitavanje podataka kalendara nije uspjelo.",
                "danger"
            )
        } finally {
            setUcitavanje(false)
        }
    }

    async function ucitajPutovanja() {
        const odgovor = await PutovanjaService.get()
        setPutovanja(odgovor.data)
    }

    async function ucitajItinerar() {
        const odgovor = await ItinerarService.get()
        setStavkeItinerara(odgovor.data)
    }

    async function ucitajPakiranja() {
        const odgovor = await PakiranjaService.get()
        setPakiranja(odgovor.data)
    }

    function prekiniOdabir() {
        setDatumPolaska("")
        setPocetniDatumi(null)
    }

    function odaberiDatum({ start, action }) {
        if (pocetniDatumi || action === "doubleClick") return

        const datum = dayjs(start).format("YYYY-MM-DD")
        const danas = dayjs().format("YYYY-MM-DD")

        if (datum < danas) {
            obavijesti("Odaberite današnji ili budući datum.", "danger")
            return
        }

        if (!datumPolaska) {
            setDatumPolaska(datum)
            return
        }

        if (datum < datumPolaska) {
            obavijesti(
                "Datum povratka ne može biti prije datuma polaska.",
                "danger"
            )
            return
        }

        setPocetniDatumi({
            datumPolaska,
            datumPovratka: datum
        })

        setDatumPolaska("")
    }

    function odaberiDogadaj(dogadaj) {
        prekiniOdabir()

        if (dogadaj.vrsta === "putovanje") {
            setOdabranoPutovanje(dogadaj.putovanje)
        } else if (dogadaj.vrsta === "itinerar") {
            setOdabranaAktivnost(dogadaj)
        }
    }

    function dodajAktivnostOdabranomPutovanju() {
        setPutovanjeZaAktivnost(odabranoPutovanje)
        setOdabranoPutovanje(null)
    }

    function urediOdabranoPutovanje() {
        setPutovanjeZaUredivanje(odabranoPutovanje)
        setOdabranoPutovanje(null)
    }

    async function obrisiOdabranoPutovanje() {
        if (!odabranoPutovanje || brisanje) return

        if (!window.confirm(
            `Želite li obrisati putovanje "${odabranoPutovanje.naziv}"?`
        )) {
            return
        }

        setBrisanje(true)

        try {
            await PutovanjaService.obrisi(odabranoPutovanje.sifra)
        } catch (error) {
            console.error(error)
            obavijesti("Brisanje putovanja nije uspjelo.", "danger")
            setBrisanje(false)
            return
        }

        setOdabranoPutovanje(null)
        obavijesti("Putovanje je obrisano.")

        try {
            await ucitajPutovanja()
        } catch (error) {
            console.error(error)

            obavijesti(
                "Putovanje je obrisano, ali osvježavanje kalendara nije uspjelo.",
                "danger"
            )
        } finally {
            setBrisanje(false)
        }
    }

    function promijeniGodinu(pomak) {
        setDatumKalendara((stariDatum) =>
            dayjs(stariDatum)
                .startOf("year")
                .add(pomak, "year")
                .toDate()
        )
    }

    function otvoriMjesec(datum) {
        prekiniOdabir()
        setDatumKalendara(datum)
        setPogledKalendara("month")
        setGodisnjiPrikaz(false)
    }

    function oznaciDatum(datum) {
        return dohvatiStilDatuma(
            datum,
            pocetniDatumi?.datumPolaska || datumPolaska,
            pocetniDatumi?.datumPovratka
        )
    }

    const dogadajiPutovanja = napraviDogadajePutovanja(
        putovanja,
        pakiranja
    )

    const dogadajiItinerara = napraviDogadajeItinerara(
        stavkeItinerara,
        putovanja
    )

    const napredakOdabranogPutovanja = odabranoPutovanje
        ? dohvatiNapredakPakiranja(
            pakiranja,
            odabranoPutovanje.sifra
        )
        : { ukupno: 0, spakirano: 0, postotak: 0 }

    const dogadaji = [
        ...dogadajiPutovanja,
        ...dogadajiItinerara
    ]

    return (
        <section className="kalendar-stranica">

            <h2>Kalendar putovanja</h2>

            <KalendarKontrole
                godisnjiPrikaz={godisnjiPrikaz}
                datumKalendara={datumKalendara}
                datumPolaska={datumPolaska}
                onPrikaziKalendar={() => setGodisnjiPrikaz(false)}
                onPrikaziGodinu={() => {
                    prekiniOdabir()
                    setGodisnjiPrikaz(true)
                }}
                onPromijeniGodinu={promijeniGodinu}
                onTrenutnaGodina={() => setDatumKalendara(new Date())}
                onPrekiniOdabir={prekiniOdabir}
            />

            {ucitavanje ? (
                <p>Učitavanje kalendara...</p>
            ) : greska ? (
                <div className="alert alert-danger" role="alert">
                    {greska}
                </div>
            ) : godisnjiPrikaz ? (
                <GodisnjiPregled
                    godina={dayjs(datumKalendara).year()}
                    dogadaji={dogadaji}
                    onOdaberiMjesec={otvoriMjesec}
                />
            ) : (
                <div className="kalendar-okvir">
                    <Calendar
                        localizer={localizer}
                        culture="hr"
                        events={dogadaji}
                        startAccessor="start"
                        endAccessor="end"
                        date={datumKalendara}
                        view={pogledKalendara}
                        onNavigate={(datum) => {
                            prekiniOdabir()
                            setDatumKalendara(datum)
                        }}
                        onView={(pogled) => {
                            prekiniOdabir()
                            setPogledKalendara(pogled)
                        }}
                        views={["month", "week", "day", "agenda"]}
                        style={{ height: 700 }}
                        popup
                        selectable
                        onSelectSlot={odaberiDatum}
                        onDrillDown={(datum) => {
                            odaberiDatum({
                                start: datum,
                                action: "click"
                            })
                        }}
                        onSelectEvent={odaberiDogadaj}
                        dayPropGetter={oznaciDatum}
                        longPressThreshold={250}
                        eventPropGetter={(dogadaj) => ({
                            style: {
                                backgroundColor:
                                    dogadaj.vrsta === "putovanje"
                                        ? "var(--pacific-blue)"
                                        : "var(--mango-orange)",
                                color: "var(--charcoal)"
                            }
                        })}
                        messages={{
                            today: "Danas",
                            previous: "Prethodno",
                            next: "Sljedeće",
                            month: "Mjesec",
                            week: "Tjedan",
                            day: "Dan",
                            agenda: "Popis",
                            date: "Datum",
                            time: "Vrijeme",
                            event: "Događaj",
                            allDay: "Cijeli dan",
                            noEventsInRange:
                                "Nema događaja u odabranom razdoblju.",
                            showMore: (broj) => `Još ${broj}`
                        }}
                    />
                </div>
            )}

            <PutovanjeModali
                pocetniDatumi={pocetniDatumi}
                putovanjeZaUredivanje={putovanjeZaUredivanje}
                onZatvoriDodavanje={prekiniOdabir}
                onZatvoriUredivanje={() => setPutovanjeZaUredivanje(null)}
                onPromjena={ucitajPutovanja}
            />

            <AktivnostModali
                putovanjeZaAktivnost={putovanjeZaAktivnost}
                odabranaAktivnost={odabranaAktivnost}
                onZatvoriDodavanje={() => setPutovanjeZaAktivnost(null)}
                onZatvoriDetalje={() => setOdabranaAktivnost(null)}
                onPromjena={ucitajItinerar}
            />

            <PutovanjePanel
                odabranoPutovanje={odabranoPutovanje}
                stavkeItinerara={stavkeItinerara}
                napredakOdabranogPutovanja={napredakOdabranogPutovanja}
                brisanje={brisanje}
                onZatvori={() => setOdabranoPutovanje(null)}
                dodajAktivnostOdabranomPutovanju={
                    dodajAktivnostOdabranomPutovanju
                }
                urediOdabranoPutovanje={urediOdabranoPutovanje}
                obrisiOdabranoPutovanje={obrisiOdabranoPutovanje}
            />

        </section>
    )
}