
import { DATA_SOURCE } from "../../constants";
import PutovanjaServiceLocalStorage from "./PutovanjaServiceLocalStorage";
import PutovanjaServiceMemorija from "./PutovanjaServiceMemorija";


let Servis = null


switch (DATA_SOURCE) {
    case 'memorija':
        Servis = PutovanjaServiceMemorija
        break
    case 'localStorage':
        Servis = PutovanjaServiceLocalStorage
        break
    default:
        Servis = null
}

const PrazanServis = {
    get: async () => ({ data: [] }),
    getBySifra: async (sifra) => ({ data: {} }),
    dodaj: async (putovanje) => { console.error('Servis nije implementiran') },
    promijeni: async (sifra, putovanje) => { console.error('Servis nije implementiran') },
    obrisi: async (sifra) => { console.error('Servis nije implementiran') }
}

const AktivniServis = Servis || PrazanServis

export default {
    get: () => AktivniServis.get(),
    getBySifra: (sifra) => AktivniServis.getBySifra(sifra),
    dodaj: (putovanje) => AktivniServis.dodaj(putovanje),
    promijeni: (sifra, putovanje) => AktivniServis.promijeni(sifra, putovanje),
    obrisi: (sifra) => AktivniServis.obrisi(sifra)
}