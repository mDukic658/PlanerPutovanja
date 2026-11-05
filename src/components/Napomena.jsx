import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { FaPen, FaTimes } from "react-icons/fa";
import PakiranjaService from "../services/lista_pakiranja/PakiranjaService";
import { useObavijesti } from "./Obavijesti";

export default function Napomena({
    pakiranje, ucitajPakiranja
}) {

    const obavijesti = useObavijesti()

    const [uredivanje, setUredivanje] = useState(false)
    const [napomena, setNapomena] = useState("")
    const [spremanje, setSpremanje] = useState(false)

    function zapocniUredivanje() {
        setNapomena(pakiranje.napomena ?? "")
        setUredivanje(true)
    }

    function odustani() {
        setUredivanje(false)
    }

    async function spremi(e) {
        e.preventDefault()

        if (spremanje) return

        const novaNapomena = napomena.trim()
        const prethodnaNapomena = String(
            pakiranje.napomena ?? ""
        ).trim()

        if (novaNapomena === prethodnaNapomena) {
            setUredivanje(false)
            return
        }

        setSpremanje(true)

        try {
            await PakiranjaService.promijeni(
                pakiranje.predmetSifra,
                pakiranje.putovanjeSifra,
                { napomena: novaNapomena }
            )
        } catch (error) {
            console.error(error)
            obavijesti(
                "Spremanje napomene nije uspjelo.",
                "danger"
            )
            setSpremanje(false)
            return
        }

        try {
            await ucitajPakiranja()
            setUredivanje(false)

            obavijesti(
                novaNapomena
                    ? "Napomena je spremljena."
                    : "Napomena je uklonjena."
            )
        } catch (error) {
            console.error(error)
            obavijesti(
                "Napomena je spremljena, ali osvježavanje prikaza nije uspjelo.",
                "danger"
            )
        } finally {
            setSpremanje(false)
        }
    }

    if (uredivanje) {
        return (
            <Form
                onSubmit={spremi}
                className="napomena-prikaz"
            >
                <Form.Control
                    type="text"
                    autoFocus
                    value={napomena}
                    onChange={(e) => setNapomena(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.nativeEvent.isComposing) return

                        if (e.key === "Enter") {
                            e.preventDefault()

                            if (!spremanje) {
                                spremi(e)
                            }
                        }

                        if (e.key === "Escape" && !spremanje) {
                            e.preventDefault()
                            odustani()
                        }
                    }}
                    disabled={spremanje}
                    placeholder="Unesi napomenu"
                    style={{ flex: "1 1 180px", minWidth: 0 }}
                />

                <Button
                    type="button"
                    variant="outline-secondary"
                    size="sm"
                    onClick={odustani}
                    disabled={spremanje}
                    title="Odustani"
                >
                    <FaTimes />
                </Button>
            </Form>
        )
    }

    return (
        <div className="napomena-prikaz">
            <span
                onDoubleClick={zapocniUredivanje}
                className="small"
                style={{
                    minWidth: 0,
                    whiteSpace: "pre-wrap",
                    overflowWrap: "anywhere",
                    cursor: "text"
                }}
                title="Dvostruki klik za uređivanje napomene"
            >
                {pakiranje.napomena}
            </span>

            <Button
                type="button"
                variant="link"
                size="sm"
                className="napomena-gumb"
                onClick={zapocniUredivanje}
                title={
                    pakiranje.napomena
                        ? "Uredi napomenu"
                        : "Dodaj napomenu"
                }
            >
                {pakiranje.napomena
                    ? <FaPen />
                    : "+ Dodaj napomenu"}
            </Button>
        </div>
    )

}