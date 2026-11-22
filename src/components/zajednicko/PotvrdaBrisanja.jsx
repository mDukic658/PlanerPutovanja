import { useId } from "react"
import { Button, Modal } from "react-bootstrap"

export default function PotvrdaBrisanja({
    otvoreno,
    naslov,
    tekstPotvrde = "Obriši",
    children,
    brisanjeUTijeku,
    onOdustani,
    onPotvrdi
}) {
    const naslovId = useId()

    return (
        <Modal
            show={otvoreno}
            onHide={() => {
                if (!brisanjeUTijeku) onOdustani()
            }}
            backdrop={brisanjeUTijeku ? "static" : true}
            keyboard={!brisanjeUTijeku}
            aria-labelledby={naslovId}
            centered
        >
            <Modal.Header closeButton={!brisanjeUTijeku} closeLabel="Zatvori">
                <Modal.Title id={naslovId}>{naslov}</Modal.Title>
            </Modal.Header>

            <Modal.Body>{children}</Modal.Body>

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
                    {brisanjeUTijeku ? "Brisanje…" : tekstPotvrde}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}