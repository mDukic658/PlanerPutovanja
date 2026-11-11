import { useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { Cropper } from "react-cropper";
import "cropperjs/dist/cropper.css"

export default function SlikaUploader({ value, onChange }) {

    const [slikaZaCrop, setSlikaZaCrop] = useState(null)
    const cropperRef = useRef(null)
    const inputRef = useRef(null)

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
            setSlikaZaCrop(reader.result)
        }

        reader.onerror = () => {
            alert("Učitavanje slike nije uspjelo.")
        }

        reader.readAsDataURL(datoteka)
    }

    function primijeniSliku() {
        const cropper = cropperRef.current?.cropper

        if (!cropper) {
            return
        }

        try {
            const canvas = cropper.getCroppedCanvas({
                maxWidth: 1200,
                maxHeight: 1200,
                fillColor: "#fff",
                imageSmoothingEnabled: true,
                imageSmoothingQuality: "high"
            })

            if (!canvas || !canvas.width || !canvas.height) {
                throw new Error("Slika nije spremna za obradu.")
            }

            const slika = canvas.toDataURL("image/jpeg", 0.85)

            onChange(slika)
            setSlikaZaCrop(null)
        } catch (error) {
            console.error(error)
            alert("Obrada slike nije uspjela. Pokušajte ponovno.")
        }
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
                            objectFit: "cover"
                        }}
                    />

                    <Button
                        type="button"
                        variant="outline-danger"
                        size="sm"
                        className="mt-2"
                        onClick={() => onChange(null)}
                    >
                        Ukloni sliku
                    </Button>
                </div>
            )}

            <Modal
                show={Boolean(slikaZaCrop)}
                onHide={() => setSlikaZaCrop(null)}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Uredi sliku</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {slikaZaCrop && (
                        <Cropper
                            src={slikaZaCrop}
                            ref={cropperRef}
                            style={{ height: 400, width: "100%" }}
                            aspectRatio={16 / 9}
                            viewMode={1}
                            autoCropArea={1}
                            background={false}
                            responsive
                        />
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="outline-secondary"
                        onClick={() => setSlikaZaCrop(null)}
                    >
                        Odustani
                    </Button>

                    <Button
                        type="button"
                        variant="success"
                        onClick={primijeniSliku}
                    >
                        Primijeni
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )

}