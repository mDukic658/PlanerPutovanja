
import { DATA_SOURCE } from "../../constants";
import PakiranjaServiceMemorija from "./PakiranjaServiceMemorija";
import PakiranjaServiceLocalStorage from "./PakiranjaServiceLocalStorage"


let Servis = null


switch (DATA_SOURCE) {
    case 'memorija':
        Servis = PakiranjaServiceMemorija
        break
    case 'localStorage':
        Servis = PakiranjaServiceLocalStorage
        break
    default:
        Servis = null
}

const PrazanServis = {
    get: async () => ({ data: [] }),
    getBySifra: async (sifra) => ({ data: {} }),
    dodaj: async (pakiranje) => { console.error('Servis nije implementiran') },
    promijeni: async (sifra, pakiranje) => { console.error('Servis nije implementiran') },
    obrisi: async (predmetSifra, putovanjeSifra) => {
        console.error('Servis nije implementiran')
    }
}

const AktivniServis = Servis || PrazanServis

export default {
    get: () => AktivniServis.get(),
    getBySifra: (sifra) => AktivniServis.getBySifra(sifra),
    dodaj: (pakiranje) => AktivniServis.dodaj(pakiranje),
    promijeni: (predmetSifra, putovanjeSifra, pakiranje) =>
        AktivniServis.promijeni(predmetSifra, putovanjeSifra, pakiranje),
    obrisi: (predmetSifra, putovanjeSifra) =>
        AktivniServis.obrisi(predmetSifra, putovanjeSifra)
}