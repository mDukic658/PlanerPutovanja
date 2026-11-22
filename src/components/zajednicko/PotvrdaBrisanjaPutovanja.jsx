import { Button, Modal } from "react-bootstrap"

export default function PotvrdaBrisanjaPutovanja({
    putovanje,
    brisanjeUTijeku,
    onOdustani,
    onPotvrdi
}) {
    return (
        <Modal
            show={putovanje !== null}
            onHide={() => {
                if (!brisanjeUTijeku) onOdustani()
            }}
            backdrop={brisanjeUTijeku ? "static" : true}
            keyboard={!brisanjeUTijeku}
            aria-labelledby="brisanje-putovanja-naslov"
            centered
        >
            <Modal.Header closeButton={!brisanjeUTijeku} closeLabel="Zatvori">
                <Modal.Title id="brisanje-putovanja-naslov">
                    Brisanje putovanja
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                Želiš li obrisati putovanje „{putovanje?.naziv}”?
                Obrisat će se i njegova pakiranja, stavke itinerara,
                troškovi i fotografije.
            </Modal.Body>

            <Modal.Footer>
                <Button
                    variant="secondary"
                    disabled={brisanjeUTijeku}
                    onClick={onOdustani}
                >
                    Odustani
                </Button>

                <Button
                    variant="danger"
                    disabled={brisanjeUTijeku}
                    onClick={onPotvrdi}
                >
                    {brisanjeUTijeku ? "Brisanje…" : "Obriši putovanje"}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}