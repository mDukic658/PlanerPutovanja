import { createContext, useContext, useState } from "react"
import { Toast, ToastContainer } from "react-bootstrap"

const ObavijestiContext = createContext(null)

export function ObavijestiProvider({ children }) {
    const [poruka, setPoruka] = useState(null)

    function obavijesti(tekst, tip = "success") {
        setPoruka({
            tekst,
            tip,
            id: Date.now()
        })
    }

    return (
        <ObavijestiContext.Provider value={obavijesti}>
            {children}

            <ToastContainer
                position="bottom-end"
                className="p-3"
                style={{ position: "fixed", zIndex: 1100 }}
            >
                {poruka && (
                    <Toast
                        key={poruka.id}
                        show
                        onClose={() => setPoruka(null)}
                        delay={3000}
                        autohide
                        bg={poruka.tip}
                        className="text-white"
                    >
                        <Toast.Header closeVariant="white">
                            <strong className="me-auto text-dark">
                                Planer putovanja
                            </strong>
                        </Toast.Header>

                        <Toast.Body>
                            {poruka.tekst}
                        </Toast.Body>
                    </Toast>
                )}
            </ToastContainer>
        </ObavijestiContext.Provider>
    )
}

export function useObavijesti() {
    return useContext(ObavijestiContext)
}