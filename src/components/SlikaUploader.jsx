import { useRef, useState } from "react";
import { Button, Modal, ButtonGroup, Form } from "react-bootstrap";
import Cropper from "react-easy-crop";
import { izreziSliku } from "../utils/cropSlika";

const OMJERI = [
    { naziv: "16:9", vrijednost: 16 / 9 },
    { naziv: "4:3", vrijednost: 4 / 3 },
    { naziv: "1:1", vrijednost: 1 },
    { naziv: "3:4", vrijednost: 3 / 4 }
]

export default function SlikaUploader({ value, onChange }) {
    const inputRef = useRef(null)

    const [slikaZaCrop, setSlikaZaCrop] = useState(null)
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [rotacija, setRotacija] = useState(0)
    const [omjer, setOmjer] = useState(16 / 9)
    const [odabraniDio, setOdabraniDio] = useState(null)
    const [obrada, setObrada] = useState(false)

    function otvoriUredivanje(slika) {
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setRotacija(0)
        setOdabraniDio(null)
        setSlikaZaCrop(slika)
    }

    function odaberiSliku(e) {
        const datoteka = e.target.files?.[0]
        e.target.value = ""

        if (!datoteka) {
            return
        }

        const dozvoljeniFormati = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ]

        if (!dozvoljeniFormati.includes(datoteka.type)) {
            alert("Dozvoljeni formati su JPG, PNG i WEBP.")
            return
        }

        if (datoteka.size > 15 * 1024 * 1024) {
            alert("Slika smije imati najviše 15 MB.")
            return
        }

        const reader = new FileReader()

        reader.onload = () => {
            otvoriUredivanje(reader.result)
        }

        reader.onerror = () => {
            alert("Učitavanje slike nije uspjelo.")
        }

        reader.readAsDataURL(datoteka)
    }

    async function primijeniSliku() {
        if (!slikaZaCrop || !odabraniDio || obrada) {
            return
        }

        try {
            setObrada(true)

            const slika = await izreziSliku(
                slikaZaCrop,
                odabraniDio,
                rotacija
            )

            onChange(slika)
            setSlikaZaCrop(null)
        } catch (error) {
            console.error(error)
            alert("Obrada slike nije uspjela. Pokušajte ponovno.")
        } finally {
            setObrada(false)
        }
    }

    function resetiraj() {
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setRotacija(0)
    }

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={odaberiSliku}
                hidden
            />

            <Button
                type="button"
                variant="outline-primary"
                className="d-block"
                onClick={() => inputRef.current?.click()}
            >
                {value ? "Odaberi drugu sliku" : "Odaberi sliku"}
            </Button>

            {value && (
                <div className="mt-3">
                    <img
                        src={value}
                        alt="Pretpregled naslovne slike putovanja"
                        className="rounded"
                        style={{
                            width: "100%",
                            maxHeight: 250,
                            objectFit: "contain"
                        }}
                    />

                    <div className="d-flex flex-wrap gap-2 mt-2">
                        {value.startsWith("data:image/") && (
                            <Button
                                type="button"
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => otvoriUredivanje(value)}
                            >
                                Uredi sliku
                            </Button>
                        )}

                        <Button
                            type="button"
                            variant="outline-danger"
                            size="sm"
                            onClick={() => onChange(null)}
                        >
                            Ukloni sliku
                        </Button>
                    </div>
                </div>
            )}

            <Modal
                show={Boolean(slikaZaCrop)}
                onHide={() => {
                    if (!obrada) {
                        setSlikaZaCrop(null)
                    }
                }}
                size="lg"
                centered
                backdrop="static"
            >
                <Modal.Header closeButton={!obrada}>
                    <Modal.Title>Uredi sliku</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div
                        style={{
                            position: "relative",
                            height: 400,
                            width: "100%",
                            background: "#222"
                        }}
                    >
                        {slikaZaCrop && (
                            <Cropper
                                image={slikaZaCrop}
                                crop={crop}
                                zoom={zoom}
                                rotation={rotacija}
                                aspect={omjer}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onRotationChange={setRotacija}
                                onCropComplete={(_, pikseli) =>
                                    setOdabraniDio(pikseli)
                                }
                            />
                        )}
                    </div>

                    <fieldset disabled={obrada} className="mt-3">
                        <Form.Group controlId="slika-zoom">
                            <Form.Label>
                                Povećanje: {zoom.toFixed(1)}×
                            </Form.Label>

                            <Form.Range
                                min={1}
                                max={3}
                                step={0.05}
                                value={zoom}
                                onChange={(e) =>
                                    setZoom(Number(e.target.value))
                                }
                            />
                        </Form.Group>

                        <Form.Group controlId="slika-rotacija">
                            <Form.Label>
                                Rotacija: {rotacija}°
                            </Form.Label>

                            <Form.Range
                                min={-180}
                                max={180}
                                step={1}
                                value={rotacija}
                                onChange={(e) =>
                                    setRotacija(Number(e.target.value))
                                }
                            />
                        </Form.Group>

                        <div className="d-flex flex-wrap align-items-center gap-3">
                            <ButtonGroup aria-label="Omjer stranica slike">
                                {OMJERI.map((opcija) => (
                                    <Button
                                        key={opcija.naziv}
                                        type="button"
                                        size="sm"
                                        variant={
                                            omjer === opcija.vrijednost
                                                ? "primary"
                                                : "outline-primary"
                                        }
                                        onClick={() => {
                                            setOdabraniDio(null)
                                            setOmjer(opcija.vrijednost)
                                        }}
                                    >
                                        {opcija.naziv}
                                    </Button>
                                ))}
                            </ButtonGroup>

                            <Button
                                type="button"
                                size="sm"
                                variant="outline-secondary"
                                onClick={resetiraj}
                            >
                                Resetiraj položaj
                            </Button>
                        </div>
                    </fieldset>
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        type="button"
                        variant="outline-secondary"
                        disabled={obrada}
                        onClick={() => setSlikaZaCrop(null)}
                    >
                        Odustani
                    </Button>

                    <Button
                        type="button"
                        variant="success"
                        disabled={obrada || !odabraniDio}
                        onClick={primijeniSliku}
                    >
                        {obrada ? "Obrađujem..." : "Primijeni"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}