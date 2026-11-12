import { useState } from "react"
import { Form } from "react-bootstrap"

export default function PretragaDrzava({
    drzave,
    odabranaDrzava,
    onOdaberi
}) {
    const [pretraga, setPretraga] = useState("")
    const [prikazi, setPrikazi] = useState(false)
    const [odabraniIndex, setOdabraniIndex] = useState(-1)

    const filtriraneDrzave = drzave.filter((drzava) =>
        drzava.naziv.toLowerCase().includes(pretraga.toLowerCase())
    )

    function odaberi(drzava) {
        onOdaberi(drzava.naziv)
        setPretraga("")
        setPrikazi(false)
        setOdabraniIndex(-1)
    }

    function obradiTipku(e) {
        if (e.key === "ArrowDown" && filtriraneDrzave.length > 0) {
            e.preventDefault()
            setPrikazi(true)

            setOdabraniIndex(
                (odabraniIndex + 1) % filtriraneDrzave.length
            )
        } else if (e.key === "ArrowUp" && filtriraneDrzave.length > 0) {
            e.preventDefault()
            setPrikazi(true)

            setOdabraniIndex(
                odabraniIndex <= 0
                    ? filtriraneDrzave.length - 1
                    : odabraniIndex - 1
            )
        } else if (
            e.key === "Enter" &&
            prikazi &&
            odabraniIndex >= 0
        ) {
            e.preventDefault()
            odaberi(filtriraneDrzave[odabraniIndex])
        } else if (e.key === "Escape") {
            setPrikazi(false)
            setPretraga("")
            setOdabraniIndex(-1)
        }
    }

    return (
        <Form.Group controlId="drzava" className="position-relative">
            <Form.Label>Država</Form.Label>

            <Form.Control
                type="text"
                placeholder="Odaberi državu..."
                value={prikazi ? pretraga : odabranaDrzava || ""}
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
                name="drzava"
                value={odabranaDrzava || ""}
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
                    {filtriraneDrzave.map((drzava, index) => (
                        <div
                            key={drzava.sifra}
                            className="p-2"
                            style={{
                                cursor: "pointer",
                                backgroundColor:
                                    index === odabraniIndex
                                        ? "#007bff"
                                        : "white",
                                color:
                                    index === odabraniIndex
                                        ? "white"
                                        : "black"
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => odaberi(drzava)}
                            onMouseEnter={() => setOdabraniIndex(index)}
                        >
                            {drzava.naziv}
                        </div>
                    ))}

                    {filtriraneDrzave.length === 0 && (
                        <div className="p-2">
                            Nema pronađenih država.
                        </div>
                    )}
                </div>
            )}
        </Form.Group>
    )
}