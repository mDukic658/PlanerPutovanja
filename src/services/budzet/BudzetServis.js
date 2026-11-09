import { DATA_SOURCE } from "../../constants";
import BudzetServiceMemorija from "./BudzetServiceMemorija";
import BudzetServisLocalStorage from "./BudzetServisLocalStorage";

let Servis = null

switch (DATA_SOURCE) {
    case 'memorija':
        Servis = BudzetServiceMemorija
        break
    case 'localStorage':
        Servis = BudzetServisLocalStorage
        break
    default:
        Servis = null
}

const PrazanServis = {
    get: async () => ({ data: [] }),
    getByPutovanje: async () => ({ data: [] }),
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
    getByPutovanje: (sifraPutovanja) =>
        AktivniServis.getByPutovanje(sifraPutovanja),
    getBySifra: (sifra) => AktivniServis.getBySifra(sifra),
    dodaj: (trosak) => AktivniServis.dodaj(trosak),
    promijeni: (sifra, trosak) =>
        AktivniServis.promijeni(sifra, trosak),
    obrisi: (sifra) => AktivniServis.obrisi(sifra),
    dohvatiStranicu: (stranica, velicinaStranice, sifraPutovanja) =>
        AktivniServis.dohvatiStranicu(stranica, velicinaStranice, sifraPutovanja)
}