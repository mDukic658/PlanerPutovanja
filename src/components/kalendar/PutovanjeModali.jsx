import { Modal } from "react-bootstrap";
import NovoPutovanje from "../../pages/putovanja/NovoPutovanje";
import PutovanjePromjena from "../../pages/putovanja/PutovanjePromjena";
import { useObavijesti } from "../zajednicko/Obavijesti";

export default function PutovanjeModali({
    pocetniDatumi,
    putovanjeZaUredivanje,
    onZatvoriDodavanje,
    onZatvoriUredivanje,
    onPromjena
}) {
    const obavijesti = useObavijesti()

    async function putovanjeSpremljeno() {
        onZatvoriDodavanje()

        try {
            await onPromjena()
        } catch (error) {
            console.error(error)

            obavijesti(
                "Putovanje je spremljeno, ali osvježavanje kalendara nije uspjelo.",
                "danger"
            )
        }
    }

    async function promjenePutovanjaSpremljene() {
        onZatvoriUredivanje()

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

    return (
        <>

            <Modal
                className="kalendar-modal"
                show={pocetniDatumi !== null}
                onHide={onZatvoriDodavanje}
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
                            onOdustani={onZatvoriDodavanje}
                        />
                    )}
                </Modal.Body>
            </Modal>

            <Modal
                className="kalendar-modal"
                show={putovanjeZaUredivanje !== null}
                onHide={onZatvoriUredivanje}
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
                            onOdustani={onZatvoriUredivanje}
                        />
                    )}
                </Modal.Body>
            </Modal>
        </>
    )
}