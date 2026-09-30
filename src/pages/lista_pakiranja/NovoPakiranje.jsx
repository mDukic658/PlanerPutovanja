import { Button, Form } from "react-bootstrap"
import PakiranjaService from "../../services/lista_pakiranja/PakiranjaService"

export default function NovoPakiranje({ putovanjeSifra, dodano }) {

    async function obradiSubmit(e) {
        e.preventDefault()

        const podaci = new FormData(e.target)

        await PakiranjaService.dodaj({
            putovanjeSifra: putovanjeSifra,
            naziv: podaci.get('naziv'),
            spakirano: false
        })

        e.target.reset()
        dodano()
    }

    return (
        <Form onSubmit={obradiSubmit} className="mt-3">

            <Form.Group controlId="naziv">
                <Form.Label>Nova stavka</Form.Label>
                <Form.Control
                    type="text"
                    name="naziv"
                    required
                />
            </Form.Group>

            <Button
                type="submit"
                variant="success"
                className="mt-2"
            >
                Dodaj
            </Button>

        </Form>
    )
}