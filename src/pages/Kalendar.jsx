import { useEffect, useState } from "react"
import { Calendar, dayjsLocalizer } from "react-big-calendar"
import dayjs from "dayjs"
import "dayjs/locale/hr"
import "react-big-calendar/lib/css/react-big-calendar.css"
import PutovanjaService from "../services/putovanja/PutovanjaService"
import ItinerarService from "../services/itinerar/ItinerarService"
import PakiranjaService from "../services/lista_pakiranja/PakiranjaService"
import { useObavijesti } from "../components/Obavijesti"
import { Button, Modal } from "react-bootstrap"
import NovoPutovanje from "./putovanja/NovoPutovanje"
import ItinerarNovo from "./Itinerar/ItinerarNovo"
import PutovanjePromjena from "./putovanja/PutovanjePromjena"
import ItinerarPromjena from "./Itinerar/ItinerarPromjena"
import GodisnjiPregled from "../components/GodisnjiPregled"

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
    const [aktivnostZaUredivanje, setAktivnostZaUredivanje] = useState(null)
    const [brisanjeAktivnosti, setBrisanjeAktivnosti] = useState(false)
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

    async function putovanjeSpremljeno() {
        prekiniOdabir()

        try {
            await ucitajPutovanja()
        } catch (error) {
            console.error(error)

            obavijesti(
                "Putovanje je spremljeno, ali osvježavanje kalendara nije uspjelo.",
                "danger"
            )
        }
    }

    function odaberiDogadaj(dogadaj) {
        prekiniOdabir()

        if (dogadaj.vrsta === "putovanje") {
            setOdabranoPutovanje(dogadaj.putovanje)
        } else if (dogadaj.vrsta === "itinerar") {
            setOdabranaAktivnost(dogadaj)
        }
    }

    function urediOdabranuAktivnost() {
        setAktivnostZaUredivanje(odabranaAktivnost.stavka)
        setOdabranaAktivnost(null)
    }

    function zatvoriUredivanjeAktivnosti() {
        setAktivnostZaUredivanje(null)
    }

    async function promjeneAktivnostiSpremljene() {
        zatvoriUredivanjeAktivnosti()

        try {
            await ucitajItinerar()
        } catch (error) {
            console.error(error)

            obavijesti(
                "Promjene su spremljene, ali osvježavanje kalendara nije uspjelo.",
                "danger"
            )
        }
    }

    async function obrisiOdabranuAktivnost() {
        if (!odabranaAktivnost || brisanjeAktivnosti) return

        const stavka = odabranaAktivnost.stavka

        if (!window.confirm(
            `Želite li obrisati aktivnost "${stavka.naziv}"?`
        )) {
            return
        }

        setBrisanjeAktivnosti(true)

        try {
            await ItinerarService.obrisi(stavka.sifra)
        } catch (error) {
            console.error(error)
            obavijesti("Brisanje aktivnosti nije uspjelo.", "danger")
            setBrisanjeAktivnosti(false)
            return
        }

        setOdabranaAktivnost(null)
        obavijesti("Aktivnost je obrisana.")

        try {
            await ucitajItinerar()
        } catch (error) {
            console.error(error)

            obavijesti(
                "Aktivnost je obrisana, ali osvježavanje kalendara nije uspjelo.",
                "danger"
            )
        } finally {
            setBrisanjeAktivnosti(false)
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

    function zatvoriUredivanje() {
        setPutovanjeZaUredivanje(null)
    }

    async function promjenePutovanjaSpremljene() {
        zatvoriUredivanje()

        try {
            await ucitajPutovanja()
        } catch (error) {
            console.error(error)

            obavijesti(
                "Promjene su spremljene, ali osvježavanje kalendara nije uspjelo.",
                "danger"
            )
        }
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

    function zatvoriAktivnost() {
        setPutovanjeZaAktivnost(null)
    }

    async function aktivnostSpremljena() {
        zatvoriAktivnost()

        try {
            await ucitajItinerar()
        } catch (error) {
            console.error(error)

            obavijesti(
                "Aktivnost je spremljena, ali osvježavanje kalendara nije uspjelo.",
                "danger"
            )
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

    function pretvoriDatum(vrijednost) {
        const [godina, mjesec, dan] = vrijednost
            .slice(0, 10)
            .split("-")
            .map(Number)

        return new Date(godina, mjesec - 1, dan)
    }

    function oznaciDatum(datum) {
        const dan = dayjs(datum).format("YYYY-MM-DD")

        const polazak = pocetniDatumi?.datumPolaska || datumPolaska
        const povratak = pocetniDatumi?.datumPovratka

        if (!polazak) return {}

        const klase = []

        if (dan === polazak) {
            klase.push("kalendar-odabrani-polazak")
        }

        if (povratak && dan >= polazak && dan <= povratak) {
            klase.push("kalendar-odabrano-razdoblje")

            if (dan === povratak) {
                klase.push("kalendar-odabrani-povratak")
            }
        }

        return {
            className: klase.join(" ")
        }
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

            <div className="kalendar-prikazi d-flex flex-wrap align-items-center gap-2 mb-3">
                <Button
                    type="button"
                    variant={godisnjiPrikaz ? "outline-primary" : "primary"}
                    onClick={() => setGodisnjiPrikaz(false)}
                >
                    Kalendar
                </Button>

                <Button
                    type="button"
                    variant={godisnjiPrikaz ? "primary" : "outline-primary"}
                    onClick={() => {
                        prekiniOdabir()
                        setGodisnjiPrikaz(true)
                    }}
                >
                    Godina
                </Button>
            </div>

            {godisnjiPrikaz && (
                <div className="kalendar-godina-kontrole d-flex flex-wrap align-items-center gap-3 mb-3">
                    <Button
                        type="button"
                        variant="outline-secondary"
                        onClick={() => promijeniGodinu(-1)}
                    >
                        Prethodna godina
                    </Button>

                    <strong>{dayjs(datumKalendara).year()}</strong>

                    <Button
                        type="button"
                        variant="outline-secondary"
                        onClick={() => promijeniGodinu(1)}
                    >
                        Sljedeća godina
                    </Button>

                    <Button
                        type="button"
                        variant="outline-primary"
                        onClick={() => setDatumKalendara(new Date())}
                    >
                        Ova godina
                    </Button>
                </div>
            )}

            {datumPolaska ? (
                <div className="kalendar-uputa kalendar-uputa-odabir d-flex align-items-center gap-3 mb-3">
                    <span>
                        Polazak: {dayjs(datumPolaska).format("DD.MM.YYYY.")}
                        {" — "}Sada odaberite datum povratka.
                    </span>

                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={prekiniOdabir}
                    >
                        Odustani
                    </Button>
                </div>
            ) : (
                <p className="kalendar-uputa" >
                    {godisnjiPrikaz
                        ? "Kliknite mjesec za otvaranje njegova kalendara. Plavo su označena putovanja, a narančastom točkom aktivnosti."
                        : "Kliknite datum polaska, zatim datum povratka za dodavanje putovanja."}
                </p>
            )}

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
                        onNavigate={setDatumKalendara}
                        onView={setPogledKalendara}
                        views={["month", "week", "day", "agenda"]}
                        style={{ height: 700 }}
                        popup
                        selectable
                        onSelectSlot={odaberiDatum}
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

            <Modal
                className="kalendar-modal"
                show={pocetniDatumi !== null}
                onHide={prekiniOdabir}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Dodaj putovanje</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {pocetniDatumi && (
                        <NovoPutovanje
                            pocetniDatumi={pocetniDatumi}
                            onSpremi={putovanjeSpremljeno}
                            onOdustani={prekiniOdabir}
                        />
                    )}
                </Modal.Body>
            </Modal>

            <Modal
                className="kalendar-modal"
                show={putovanjeZaAktivnost !== null}
                onHide={zatvoriAktivnost}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Dodaj aktivnost — {putovanjeZaAktivnost?.naziv}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {putovanjeZaAktivnost && (
                        <ItinerarNovo
                            pocetnoPutovanjeSifra={putovanjeZaAktivnost.sifra}
                            onSpremi={aktivnostSpremljena}
                            onOdustani={zatvoriAktivnost}
                        />
                    )}
                </Modal.Body>
            </Modal>

            <Modal
                className="kalendar-modal"
                show={odabranoPutovanje !== null}
                onHide={() => {
                    if (!brisanje) {
                        setOdabranoPutovanje(null)
                    }
                }}
                centered
            >
                <Modal.Header closeButton={!brisanje}>
                    <Modal.Title>
                        {odabranoPutovanje?.naziv}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {odabranoPutovanje && (
                        <>
                            <p>
                                <strong>Destinacija: </strong>
                                {odabranoPutovanje.destinacija}
                                {odabranoPutovanje.drzava
                                    ? `, ${odabranoPutovanje.drzava}`
                                    : ""}
                            </p>

                            <p>
                                <strong>Polazak: </strong>
                                {dayjs(odabranoPutovanje.datumPolaska)
                                    .format("DD.MM.YYYY.")}
                            </p>

                            <p>
                                <strong>Povratak: </strong>
                                {dayjs(odabranoPutovanje.datumPovratka)
                                    .format("DD.MM.YYYY.")}
                            </p>
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        type="button"
                        onClick={dodajAktivnostOdabranomPutovanju}
                        disabled={brisanje}
                    >
                        Dodaj aktivnost
                    </Button>

                    <Button
                        type="button"
                        variant="outline-primary"
                        onClick={urediOdabranoPutovanje}
                        disabled={brisanje}
                    >
                        Uredi
                    </Button>

                    <Button
                        type="button"
                        variant="danger"
                        onClick={obrisiOdabranoPutovanje}
                        disabled={brisanje}
                    >
                        {brisanje ? "Brisanje..." : "Obriši"}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                className="kalendar-modal"
                show={putovanjeZaUredivanje !== null}
                onHide={zatvoriUredivanje}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Uredi putovanje</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {putovanjeZaUredivanje && (
                        <PutovanjePromjena
                            key={putovanjeZaUredivanje.sifra}
                            pocetnaSifra={putovanjeZaUredivanje.sifra}
                            onSpremi={promjenePutovanjaSpremljene}
                            onOdustani={zatvoriUredivanje}
                        />
                    )}
                </Modal.Body>
            </Modal>

            <Modal
                className="kalendar-modal"
                show={odabranaAktivnost !== null}
                onHide={() => {
                    if (!brisanjeAktivnosti) {
                        setOdabranaAktivnost(null)
                    }
                }}
                centered
            >
                <Modal.Header closeButton={!brisanjeAktivnosti}>
                    <Modal.Title>
                        {odabranaAktivnost?.stavka.naziv}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {odabranaAktivnost && (
                        <>
                            <p>
                                <strong>Putovanje: </strong>
                                {odabranaAktivnost.putovanje.naziv}
                            </p>

                            <p>
                                <strong>Datum: </strong>
                                {dayjs(odabranaAktivnost.start)
                                    .format("DD.MM.YYYY.")}
                            </p>

                            <p>
                                <strong>Dan putovanja: </strong>
                                {odabranaAktivnost.stavka.dan}
                            </p>

                            <p>
                                <strong>Vrijeme: </strong>
                                {odabranaAktivnost.stavka.vrijeme}
                            </p>

                            {odabranaAktivnost.stavka.biljeska && (
                                <p style={{ whiteSpace: "pre-wrap" }}>
                                    <strong>Bilješka: </strong>
                                    {odabranaAktivnost.stavka.biljeska}
                                </p>
                            )}
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        type="button"
                        variant="outline-primary"
                        onClick={urediOdabranuAktivnost}
                        disabled={brisanjeAktivnosti}
                    >
                        Uredi
                    </Button>

                    <Button
                        type="button"
                        variant="danger"
                        onClick={obrisiOdabranuAktivnost}
                        disabled={brisanjeAktivnosti}
                    >
                        {brisanjeAktivnosti ? "Brisanje..." : "Obriši"}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                className="kalendar-modal"
                show={aktivnostZaUredivanje !== null}
                onHide={zatvoriUredivanjeAktivnosti}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Uredi aktivnost</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {aktivnostZaUredivanje && (
                        <ItinerarPromjena
                            key={aktivnostZaUredivanje.sifra}
                            pocetnaSifra={aktivnostZaUredivanje.sifra}
                            onSpremi={promjeneAktivnostiSpremljene}
                            onOdustani={zatvoriUredivanjeAktivnosti}
                        />
                    )}
                </Modal.Body>
            </Modal>

        </section>
    )
}