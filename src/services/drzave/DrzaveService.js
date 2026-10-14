
import { DATA_SOURCE } from "../../constants";
import DrzaveServiceLocalStorage from "./DrzaveServiceLocalStorage";
import DrzaveServiceMemorija from "./DrzaveServiceMemorija";


let Servis = null;

switch (DATA_SOURCE) {
    case 'memorija':
        Servis = DrzaveServiceMemorija;
        break;
    case 'localStorage':
        Servis = DrzaveServiceLocalStorage;
        break;
    default:
        Servis = null;
}

const PrazanServis = {
    get: async () => ({ data: [] }),
    getBySifra: async (sifra) => ({ data: {} }),
    dodaj: async (drzava) => {
        console.error('Servis nije implementiran');
    },
    promijeni: async (sifra, drzava) => {
        console.error('Servis nije implementiran');
    },
    obrisi: async (sifra) => {
        console.error('Servis nije implementiran');
    }
};

const AktivniServis = Servis || PrazanServis;

export default {
    get: () => AktivniServis.get(),
    getBySifra: (sifra) => AktivniServis.getBySifra(sifra),
    dodaj: (drzava) => AktivniServis.dodaj(drzava),
    promijeni: (sifra, drzava) => AktivniServis.promijeni(sifra, drzava),
    obrisi: (sifra) => AktivniServis.obrisi(sifra)
};