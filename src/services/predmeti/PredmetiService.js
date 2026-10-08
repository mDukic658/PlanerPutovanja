import { DATA_SOURCE } from "../../constants"
import PredmetiServiceLocalStorage from "./PredmetiServiceLocalStorage"
import PredmetiServiceMemorija from "./PredmetiServiceMemorija"

let Servis = null

switch (DATA_SOURCE) {
    case 'memorija':
        Servis = PredmetiServiceMemorija
        break
    case 'localStorage':
        Servis = PredmetiServiceLocalStorage
        break
    default:
        Servis = null
}

const PrazanServis = {
    get: async () => ({ data: [] }),
    getBySifra: async (sifra) => ({ data: {} }),
    dodaj: async (predmet) => { console.error('Servis nije implementiran') },
    promijeni: async (sifra, predmet) => { console.error('Servis nije implementiran') },
    obrisi: async (sifra) => { console.error('Servis nije implementiran') }
}

const AktivniServis = Servis || PrazanServis

export default {
    get: () => AktivniServis.get(),
    getBySifra: (sifra) => AktivniServis.getBySifra(sifra),
    dodaj: (predmet) => AktivniServis.dodaj(predmet),
    promijeni: (sifra, predmet) => AktivniServis.promijeni(sifra, predmet),
    obrisi: (sifra) => AktivniServis.obrisi(sifra)
}