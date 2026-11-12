import { Button, Modal } from "react-bootstrap";
import dayjs from "dayjs";
import ItinerarNovo from "../../pages/Itinerar/ItinerarNovo";
import ItinerarPromjena from "../../pages/Itinerar/ItinerarPromjena";
import ItinerarService from "../../services/itinerar/ItinerarService";
import { useState } from "react";
import { useObavijesti } from "../zajednicko/Obavijesti";


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

        onZatvoriDetalje()
        obavijesti("Aktivnost je obrisana.")

        try {
            await onPromjena()
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
                show={odabranaAktivnost !== null}
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
        </>
    )

}