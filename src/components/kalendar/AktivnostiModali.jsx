import { Button, Modal } from "react-bootstrap";
import dayjs from "dayjs";
import ItinerarNovo from "../../pages/Itinerar/ItinerarNovo";
import ItinerarPromjena from "../../pages/Itinerar/ItinerarPromjena";
import ItinerarService from "../../services/itinerar/ItinerarService";
import { useState } from "react";
import { useObavijesti } from "../zajednicko/Obavijesti";
import PotvrdaBrisanja from "../zajednicko/PotvrdaBrisanja";
import RichTextPrikaz from "../ui/RichTextEditor/RichTextPrikaz";

export default function AktivnostModali({
    putovanjeZaAktivnost,
    odabranaAktivnost,
    onZatvoriDodavanje,
    onZatvoriDetalje,
    onPromjena
}) {

    const obavijesti = useObavijesti()

    const [aktivnostZaUredivanje, setAktivnostZaUredivanje] = useState(null)
    const [brisanjeAktivnosti, setBrisanjeAktivnosti] = useState(false)
    const [potvrdaBrisanjaOtvorena, setPotvrdaBrisanjaOtvorena] = useState(false)


    function urediOdabranuAktivnost() {
        setAktivnostZaUredivanje(odabranaAktivnost.stavka)
        onZatvoriDetalje()
    }

    function zatvoriUredivanjeAktivnosti() {
        setAktivnostZaUredivanje(null)
    }


    async function promjeneAktivnostiSpremljene() {
        zatvoriUredivanjeAktivnosti()

        try {
            await onPromjena()
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

        const { sifra } = odabranaAktivnost.stavka
        setBrisanjeAktivnosti(true)

        try {
            const odgovor = await ItinerarService.obrisi(sifra)

            if (odgovor?.success === false) {
                throw new Error(odgovor.message)
            }
        } catch (error) {
            console.error(error)
            obavijesti("Brisanje aktivnosti nije uspjelo.", "danger")
            return
        } finally {
            setBrisanjeAktivnosti(false)
        }

        onZatvoriDetalje()
        setPotvrdaBrisanjaOtvorena(false)
        obavijesti("Aktivnost je obrisana.")

        try {
            await onPromjena()
        } catch (error) {
            console.error(error)
            obavijesti(
                "Aktivnost je obrisana, ali osvježavanje kalendara nije uspjelo.",
                "danger"
            )
        }
    }


    function zatvoriAktivnost() {
        onZatvoriDodavanje()
    }

    function zatvoriDetaljeAktivnosti() {
        if (!brisanjeAktivnosti) {
            onZatvoriDetalje()
        }
    }

    async function aktivnostSpremljena() {
        zatvoriAktivnost()

        try {
            await onPromjena()
        } catch (error) {
            console.error(error)

            obavijesti(
                "Aktivnost je spremljena, ali osvježavanje kalendara nije uspjelo.",
                "danger"
            )
        }
    }

    return (
        <>
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

            {/* Detalji aktivnosti */}

            <Modal
                className="kalendar-modal"
                show={odabranaAktivnost !== null && !potvrdaBrisanjaOtvorena}
                onHide={() => {
                    if (!brisanjeAktivnosti) {
                        zatvoriDetaljeAktivnosti()
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
                                <div>
                                    <strong>Bilješka:</strong>
                                    <RichTextPrikaz html={odabranaAktivnost.stavka.biljeska} />
                                </div>
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
                        onClick={() => setPotvrdaBrisanjaOtvorena(true)}
                        disabled={brisanjeAktivnosti}
                    >
                        {brisanjeAktivnosti ? "Brisanje..." : "Obriši"}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Uređivanje aktivnosti */}

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

            <PotvrdaBrisanja
                otvoreno={odabranaAktivnost !== null && potvrdaBrisanjaOtvorena}
                naslov="Brisanje aktivnosti"
                brisanjeUTijeku={brisanjeAktivnosti}
                onOdustani={() => setPotvrdaBrisanjaOtvorena(false)}
                onPotvrdi={obrisiOdabranuAktivnost}
            >
                Želiš li obrisati aktivnost „{odabranaAktivnost?.stavka.naziv}”?
            </PotvrdaBrisanja>

        </>
    )

}