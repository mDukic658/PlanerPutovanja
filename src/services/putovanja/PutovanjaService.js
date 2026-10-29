
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
    getBySifra: async () => ({ data: {} }),
    dodaj: async () => {
        console.error("Servis nije implementiran")
    },
    promijeni: async () => {
        console.error("Servis nije implementiran")
    },
    obrisi: async () => {
        console.error("Servis nije implementiran")
    },
    dohvatiStranicu: async () => ({
        data: [],
        ukupnoStranica: 0,
        ukupnoStavki: 0
    })
}

const AktivniServis = Servis || PrazanServis

export default {
    get: () => AktivniServis.get(),
    getBySifra: (sifra) => AktivniServis.getBySifra(sifra),
    dodaj: (putovanje) => AktivniServis.dodaj(putovanje),
    promijeni: (sifra, putovanje) =>
        AktivniServis.promijeni(sifra, putovanje),
    obrisi: (sifra) => AktivniServis.obrisi(sifra),
    dohvatiStranicu: (stranica, velicinaStranice) =>
        AktivniServis.dohvatiStranicu(stranica, velicinaStranice)
}