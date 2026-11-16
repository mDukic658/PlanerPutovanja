import { createContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RouteNames } from '../constants'
import OperaterService from '../services/operateri/OperaterService'

export const AuthContext = createContext(null)

function dohvatiSpremljenogOperatera() {
    try {
        const podaci = localStorage.getItem('operater')
        if (!podaci) return null

        const operater = JSON.parse(podaci)

        if (
            !operater?.sifra ||
            !operater?.email ||
            !['admin', 'korisnik'].includes(operater.uloga)
        ) {
            return null
        }

        return {
            sifra: operater.sifra,
            email: operater.email,
            uloga: operater.uloga
        }
    } catch {
        return null
    }
}

export function AuthProvider({ children }) {
    const [authUser, setAuthUser] = useState(dohvatiSpremljenogOperatera)
    const navigate = useNavigate()

    const isLoggedIn = authUser !== null

    async function login(email, lozinka) {
        try {
            const odgovor = await OperaterService.prijava(
                email.trim(),
                lozinka
            )

            if (!odgovor.success) {
                return {
                    success: false,
                    message: odgovor.message || 'Prijava nije uspjela.'
                }
            }

            const operater = {
                sifra: odgovor.data.sifra,
                email: odgovor.data.email,
                uloga: odgovor.data.uloga
            }

            localStorage.setItem('operater', JSON.stringify(operater))
            setAuthUser(operater)

            return { success: true }
        } catch {
            return {
                success: false,
                message: 'Došlo je do greške prilikom prijave. Pokušajte ponovno.'
            }
        }
    }

    function logout() {
        localStorage.removeItem('operater')
        setAuthUser(null)
        navigate(RouteNames.HOME, { replace: true })
    }

    return (
        <AuthContext.Provider
            value={{ isLoggedIn, authUser, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    )
}