
import { DATA_SOURCE } from "../../constants";
import KartaServiceMemorija from "./KartaServiceMemorija";
import KartaServiceLocalStorage from "./KartaServiceLocalStorage";
import KartaServiceFirebase from "./KartaServiceFirebase";

let Servis = null

switch (DATA_SOURCE) {
    case "memorija":
        Servis = KartaServiceMemorija
        break
    case "localStorage":
        Servis = KartaServiceLocalStorage
        break
    case 'firebase':
        Servis = KartaServiceFirebase
        break
    default:
        Servis = null
}

const PrazanServis = {
    get: async () => ({ data: [] }),
    getBySifra: async () => ({ data: undefined }),
    getByDrzava: async () => ({ data: [] }),
    dodaj: async () => {
        throw new Error("Servis nije implementiran.")
    },
    promijeni: async () => {
        throw new Error("Servis nije implementiran.")
    },
    obrisi: async () => {
        throw new Error("Servis nije implementiran.")
    }
}

const AktivniServis = Servis || PrazanServis

export default {
    get: () => AktivniServis.get(),
    getBySifra: (sifra) =>
        AktivniServis.getBySifra(sifra),
    getByDrzava: (iso2) =>
        AktivniServis.getByDrzava(iso2),
    dodaj: (posjet) =>
        AktivniServis.dodaj(posjet),
    promijeni: (sifra, posjet) =>
        AktivniServis.promijeni(sifra, posjet),
    obrisi: (sifra) =>
        AktivniServis.obrisi(sifra)
}