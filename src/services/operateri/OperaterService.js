import OperaterServiceLocalStorage from "./OperaterServiceLocalStorage"
import OperaterServiceMemorija from "./OperaterServiceMemorija"
import { DATA_SOURCE } from "../../constants"

let Servis = null

// 1. Odabir servisa
switch (DATA_SOURCE) {
    case 'memorija':
        Servis = OperaterServiceMemorija
        break
    case 'localStorage':
        Servis = OperaterServiceLocalStorage
        break;
    default:
        Servis = null
}

// 2. Definiranje defaultnog (praznog) ponašanja ako Servis nije pronađen
const PrazanServis = {
    get: async () => ({ success: false, data: [] }),
    getBySifra: async () => ({ success: false, data: null }),
    dodaj: async () => {
        console.error("Servis nije učitan")
        return { success: false }
    },
    promjeni: async () => {
        console.error("Servis nije učitan")
        return { success: false }
    },
    promjeniLozinku: async () => {
        console.error("Servis nije učitan")
        return { success: false }
    },
    obrisi: async () => {
        console.error("Servis nije učitan")
        return { success: false }
    },
    prijava: async () => {
        console.error("Servis nije učitan")
        return { success: false, message: "Servis nije učitan" }
    }
}

// 3. Jedan jedini export na kraju
// Ako Servis postoji, koristi njega, inače koristi PrazanServis
const AktivniServis = Servis || PrazanServis

export default {
    get: () => AktivniServis.get(),
    getBySifra: (sifra) => AktivniServis.getBySifra(sifra),
    dodaj: (operater) => AktivniServis.dodaj(operater),
    promjeni: (sifra, operater) => AktivniServis.promjeni(sifra, operater),
    promjeniLozinku: (sifra, novaLozinka) => AktivniServis.promjeniLozinku(sifra, novaLozinka),
    obrisi: (sifra) => AktivniServis.obrisi(sifra),
    prijava: (email, lozinka) => AktivniServis.prijava(email, lozinka)
}
