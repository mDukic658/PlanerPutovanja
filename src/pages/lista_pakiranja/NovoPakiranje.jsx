import { useEffect, useState } from "react"
import { Button, Form } from "react-bootstrap"
import PredmetiService from "../../services/predmeti/PredmetiService"
import PakiranjaService from "../../services/lista_pakiranja/PakiranjaService"
import { useObavijesti } from "../../components/zajednicko/Obavijesti"
import { ShemaPakiranje } from "../../schemas/ShemaListaPakiranja"

export default function NovoPakiranje({ putovanjeSifra, ucitajPakiranja }) {

    const obavijesti = useObavijesti()

    const [predmeti, setPredmeti] = useState([])
    const [odabraniPredmet, setOdabraniPredmet] = useState(null)
    const [pretraga, setPretraga] = useState("")
    const [prikazi, setPrikazi] = useState(false)
    const [odabraniIndex, setOdabraniIndex] = useState(-1)
    const [greske, setGreske] = useState({})

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

    function ocistiGresku(polje) {
        setGreske(prethodne => {
            const nove = { ...prethodne }
            delete nove[polje]
            return nove
        })
    }

    function odaberi(predmet) {
        setOdabraniPredmet(predmet)
        setPretraga("")
        setPrikazi(false)
        setOdabraniIndex(-1)
        ocistiGresku('predmetSifra')
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
        setGreske({})

        const obrazac = e.currentTarget
        const podaci = new FormData(obrazac)

        const rezultat = ShemaPakiranje.safeParse({
            predmetSifra: podaci.get("predmetSifra"),
            putovanjeSifra,
            spakirano: false,
            napomena: String(podaci.get("napomena") ?? "")
        })

        if (!rezultat.success) {
            const noveGreske = {}

            rezultat.error.issues.forEach((issue) => {
                const polje = issue.path[0]

                if (!noveGreske[polje]) {
                    noveGreske[polje] = issue.message
                }
            })

            setGreske(noveGreske)
            return
        }

        const predmetPostoji = predmeti.some(
            predmet => Number(predmet.sifra) === rezultat.data.predmetSifra
        )

        if (!predmetPostoji) {
            setGreske({
                predmetSifra: "Odabrani predmet nije pronađen."
            })
            return
        }

        try {
            await PakiranjaService.dodaj(rezultat.data)

            obrazac.reset()
            setOdabraniPredmet(null)
            setPretraga("")
            setPrikazi(false)
            setOdabraniIndex(-1)
            setGreske({})

            await ucitajPakiranja()
        } catch (error) {
            obavijesti(
                error.message || "Dodavanje predmeta nije uspjelo.",
                "danger"
            )
        }
    }

    return (
        <Form noValidate onSubmit={obradiSubmit}>

            {greske.putovanjeSifra && (
                <div className="alert alert-danger" role="alert">
                    {greske.putovanjeSifra}
                </div>
            )}

            <Form.Group controlId="predmetSifra" className="position-relative">
                <Form.Label>Novi predmet</Form.Label>

                <Form.Control
                    type="text"
                    placeholder="Odaberi predmet..."
                    isInvalid={!!greske.predmetSifra}
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
                <Form.Control.Feedback type="invalid">
                    {greske.predmetSifra}
                </Form.Control.Feedback>

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

            <Form.Group>
                <Form.Label>Napomena</Form.Label>

                <Form.Control
                    as="textarea"
                    rows={3}
                    name="napomena"
                    placeholder="Npr. Ponijeti dva komada"
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