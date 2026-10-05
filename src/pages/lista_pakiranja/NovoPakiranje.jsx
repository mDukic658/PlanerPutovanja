import { useEffect, useState } from "react"
import { Button, Form } from "react-bootstrap"
import PredmetiService from "../../services/predmeti/PredmetiService"
import PakiranjaService from "../../services/lista_pakiranja/PakiranjaService"

export default function NovoPakiranje({ putovanjeSifra, ucitajPakiranja }) {

    const [predmeti, setPredmeti] = useState([])

    useEffect(() => {
        ucitajPredmete()
    }, [])

    async function ucitajPredmete() {
        await PredmetiService.get().then((odgovor) => {
            setPredmeti(odgovor.data)
        })
    }

    async function obradiSubmit(e) {
        e.preventDefault()

        const podaci = new FormData(e.target)

        const predmetSifra = parseInt(
            podaci.get('predmetSifra')
        )

        await PakiranjaService.dodaj({
            predmetSifra: predmetSifra,
            putovanjeSifra: putovanjeSifra,
            spakirano: false
        })

        e.target.reset()

        ucitajPakiranja()
    }

    return (
        <Form onSubmit={obradiSubmit}>

            <Form.Group controlId="predmetSifra">
                <Form.Label>Novi predmet</Form.Label>

                <Form.Select
                    name="predmetSifra"
                    required
                >
                    <option value="">
                        Odaberi predmet
                    </option>

                    {predmeti.map((predmet) => (
                        <option
                            value={predmet.sifra}
                            key={predmet.sifra}
                        >
                            {predmet.naziv}
                        </option>
                    ))}
                </Form.Select>
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