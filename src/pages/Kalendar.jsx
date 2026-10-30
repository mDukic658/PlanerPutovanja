import { useEffect, useState } from "react"
import { Calendar, dayjsLocalizer } from "react-big-calendar"
import dayjs from "dayjs"
import "dayjs/locale/hr"
import "react-big-calendar/lib/css/react-big-calendar.css"
import PutovanjaService from "../services/putovanja/PutovanjaService"
import ItinerarService from "../services/itinerar/ItinerarService"
import PakiranjaService from "../services/lista_pakiranja/PakiranjaService"
import { useObavijesti } from "../components/Obavijesti"


const localizer = dayjsLocalizer(dayjs)

export default function Kalendar() {

    const obavijesti = useObavijesti()

    const [putovanja, setPutovanja] = useState([])
    const [stavkeItinerara, setStavkeItinerara] = useState([])
    const [pakiranja, setPakiranja] = useState([])
    const [ucitavanje, setUcitavanje] = useState(true)
    const [greska, setGreska] = useState("")

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

    function pretvoriDatum(vrijednost) {
        const [godina, mjesec, dan] = vrijednost
            .slice(0, 10)
            .split("-")
            .map(Number)

        return new Date(godina, mjesec - 1, dan)
    }

    function dohvatiNapredakPakiranja(putovanjeSifra) {
        const stavke = pakiranja.filter(
            (pakiranje) =>
                Number(pakiranje.putovanjeSifra) === Number(putovanjeSifra)
        )

        const ukupno = stavke.length

        const spakirano = stavke.filter(
            (pakiranje) => pakiranje.spakirano
        ).length

        const postotak = ukupno === 0
            ? 0
            : Math.round((spakirano / ukupno) * 100)

        return {
            ukupno,
            spakirano,
            postotak
        }
    }

    const dogadajiPutovanja = putovanja.map((putovanje) => {
        const polazak = pretvoriDatum(putovanje.datumPolaska)
        const kraj = pretvoriDatum(putovanje.datumPovratka)

        // Uključujemo i datum povratka u prikaz.
        kraj.setDate(kraj.getDate() + 1)

        return {
            id: `putovanje-${putovanje.sifra}`,
            title: putovanje.naziv,
            start: polazak,
            end: kraj,
            allDay: true,
            vrsta: "putovanje",
            putovanje,
            napredak: dohvatiNapredakPakiranja(putovanje.sifra)
        }
    })

    const dogadajiItinerara = stavkeItinerara.flatMap((stavka) => {
        const putovanje = putovanja.find(
            (putovanje) =>
                Number(putovanje.sifra) === Number(stavka.putovanjeSifra)
        )

        if (!putovanje) {
            return []
        }

        const pocetak = pretvoriDatum(putovanje.datumPolaska)

        pocetak.setDate(
            pocetak.getDate() + Number(stavka.dan) - 1
        )

        const [sati, minute] = stavka.vrijeme
            .split(":")
            .map(Number)

        pocetak.setHours(sati, minute, 0, 0)

        // Aktivnosti zasad prikazujemo u trajanju od 30 minuta.
        const kraj = new Date(pocetak)
        kraj.setMinutes(kraj.getMinutes() + 30)

        return [{
            id: `itinerar-${stavka.sifra}`,
            title: `${stavka.naziv} — ${putovanje.naziv}`,
            start: pocetak,
            end: kraj,
            allDay: false,
            vrsta: "itinerar",
            putovanje,
            stavka
        }]
    })

    const dogadaji = [
        ...dogadajiPutovanja,
        ...dogadajiItinerara
    ]

    return (
        <section className="kalendar-stranica">

            <h2>Kalendar putovanja</h2>

            {ucitavanje ? (
                <p>Učitavanje kalendara...</p>
            ) : greska ? (
                <div className="alert alert-danger" role="alert">
                    {greska}
                </div>
            ) : (
                <div className="kalendar-okvir">
                    <Calendar
                        localizer={localizer}
                        culture="hr"
                        events={dogadaji}
                        startAccessor="start"
                        endAccessor="end"
                        defaultView="month"
                        views={["month", "week", "day", "agenda"]}
                        style={{ height: 700 }}
                        popup
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

        </section>
    )
}