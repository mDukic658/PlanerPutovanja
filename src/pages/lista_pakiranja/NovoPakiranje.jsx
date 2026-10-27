import { useEffect, useState } from "react"
import { Button, Form } from "react-bootstrap"
import PredmetiService from "../../services/predmeti/PredmetiService"
import PakiranjaService from "../../services/lista_pakiranja/PakiranjaService"

export default function NovoPakiranje({ putovanjeSifra, ucitajPakiranja }) {

    const [predmeti, setPredmeti] = useState([])
    const [odabraniPredmet, setOdabraniPredmet] = useState(null)
    const [pretraga, setPretraga] = useState("")
    const [prikazi, setPrikazi] = useState(false)
    const [odabraniIndex, setOdabraniIndex] = useState(-1)

    useEffect(() => {
        ucitajPredmete()
    }, [])

    async function ucitajPredmete() {
        await PredmetiService.get().then((odgovor) => {
            setPredmeti(odgovor.data)
        })
    }

    const filtriraniPredmeti = predmeti.filter((predmet) =>
        predmet.naziv.toLowerCase().includes(pretraga.toLowerCase())
    )

    function odaberi(predmet) {
        setOdabraniPredmet(predmet)
        setPretraga("")
        setPrikazi(false)
        setOdabraniIndex(-1)
    }

    function obradiTipku(e) {
        if (e.key === "ArrowDown" && filtriraniPredmeti.length > 0) {
            e.preventDefault()
            setPrikazi(true)

            setOdabraniIndex(
                (odabraniIndex + 1) % filtriraniPredmeti.length
            )
        } else if (e.key === "ArrowUp" && filtriraniPredmeti.length > 0) {
            e.preventDefault()
            setPrikazi(true)

            setOdabraniIndex(
                odabraniIndex <= 0
                    ? filtriraniPredmeti.length - 1
                    : odabraniIndex - 1
            )
        } else if (
            e.key === "Enter" &&
            prikazi &&
            odabraniIndex >= 0
        ) {
            e.preventDefault()
            odaberi(filtriraniPredmeti[odabraniIndex])
        } else if (e.key === "Escape") {
            setPrikazi(false)
            setPretraga("")
            setOdabraniIndex(-1)
        }
    }


    async function obradiSubmit(e) {
        e.preventDefault()

        const podaci = new FormData(e.target)

        if (!podaci.get("predmetSifra")) {
            alert("Morate odabrati predmet!")
            return
        }

        const predmetSifra = parseInt(
            podaci.get('predmetSifra')
        )

        await PakiranjaService.dodaj({
            predmetSifra: predmetSifra,
            putovanjeSifra: putovanjeSifra,
            spakirano: false
        })

        e.target.reset()

        setOdabraniPredmet(null)

        ucitajPakiranja()
    }

    return (
        <Form onSubmit={obradiSubmit}>

            <Form.Group controlId="predmetSifra" className="position-relative">
                <Form.Label>Novi predmet</Form.Label>

                <Form.Control
                    type="text"
                    placeholder="Odaberi predmet..."
                    value={prikazi ? pretraga : odabraniPredmet?.naziv || ""}
                    onChange={(e) => {
                        setPretraga(e.target.value)
                        setOdabraniIndex(-1)
                        setPrikazi(true)
                    }}
                    onFocus={() => {
                        setPretraga("")
                        setPrikazi(true)
                    }}
                    onBlur={() => {
                        setPrikazi(false)
                        setPretraga("")
                        setOdabraniIndex(-1)
                    }}
                    onKeyDown={obradiTipku}
                    autoComplete="off"
                />

                <input
                    type="hidden"
                    name="predmetSifra"
                    value={odabraniPredmet?.sifra || ""}
                />

                {prikazi && (
                    <div
                        className="position-absolute w-100 bg-white border rounded shadow-sm"
                        style={{
                            zIndex: 1000,
                            maxHeight: "200px",
                            overflowY: "auto"
                        }}
                    >
                        {filtriraniPredmeti.map((predmet, index) => (
                            <div
                                key={predmet.sifra}
                                className="p-2"
                                style={{
                                    cursor: "pointer",
                                    backgroundColor:
                                        index === odabraniIndex ? "#007bff" : "white",
                                    color:
                                        index === odabraniIndex ? "white" : "black"
                                }}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => odaberi(predmet)}
                                onMouseEnter={() => setOdabraniIndex(index)}
                            >
                                {predmet.naziv}
                            </div>
                        ))}

                        {filtriraniPredmeti.length === 0 && (
                            <div className="p-2">
                                Nema pronađenih predmeta.
                            </div>
                        )}
                    </div>
                )}
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