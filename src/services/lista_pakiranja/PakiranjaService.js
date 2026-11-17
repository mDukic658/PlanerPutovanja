
import { DATA_SOURCE } from "../../constants";
import PakiranjaServiceMemorija from "./PakiranjaServiceMemorija";
import PakiranjaServiceLocalStorage from "./PakiranjaServiceLocalStorage"
import PakiranjaServiceFirebase from "./PakiranjaServiceFirebase";


let Servis = null


switch (DATA_SOURCE) {
    case 'memorija':
        Servis = PakiranjaServiceMemorija
        break
    case 'localStorage':
        Servis = PakiranjaServiceLocalStorage
        break
    case 'firebase':
        Servis = PakiranjaServiceFirebase
        break
    default:
        Servis = null
}

const PrazanServis = {
    get: async () => ({ data: [] }),
    getByPutovanje: async () => ({ data: [] }),
    dodaj: async () => {
        console.error('Servis nije implementiran')
    },
    promijeni: async () => {
        console.error('Servis nije implementiran')
    },
    obrisi: async () => {
        console.error('Servis nije implementiran')
    }
}

const AktivniServis = Servis || PrazanServis

export default {
    get: () => AktivniServis.get(),
    getByPutovanje: (sifraPutovanja) =>
        AktivniServis.getByPutovanje(sifraPutovanja),
    dodaj: (pakiranje) => AktivniServis.dodaj(pakiranje),
    promijeni: (predmetSifra, putovanjeSifra, pakiranje) =>
        AktivniServis.promijeni(predmetSifra, putovanjeSifra, pakiranje),
    obrisi: (predmetSifra, putovanjeSifra) =>
        AktivniServis.obrisi(predmetSifra, putovanjeSifra)
}