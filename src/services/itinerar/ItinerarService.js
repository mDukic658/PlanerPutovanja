import { DATA_SOURCE } from '../../constants'
import ItinerarServiceLocaleStorage from './ItinerarServiceLocalStorage'
import ItinerarServiceMemorija from './ItinerarServiceMemorija'

let Servis = null

switch (DATA_SOURCE) {

    case 'memorija':
        Servis = ItinerarServiceMemorija
        break
    case 'localStorage':
        Servis = ItinerarServiceLocaleStorage
        break
    default:
        Servis = null

}

const PrazanServis = {
    get: async () => ({ data: [] }),
    getByPutovanje: async (sifraPutovanja) => ({ data: [] }),
    getBySifra: async (sifra) => ({ data: {} }),
    dodaj: async (stavka) => { console.error('Servis nije implementiran') },
    promijeni: async (sifra, stavka) => { console.error('Servis nije implementiran') },
    obrisi: async (sifra) => { console.error('Servis nije implementiran') }
}

const AktivniServis = Servis || PrazanServis

export default {
    get: () => AktivniServis.get(),
    getByPutovanje: (sifraPutovanja) => AktivniServis.getByPutovanje(sifraPutovanja),
    getBySifra: (sifra) => AktivniServis.getBySifra(sifra),
    dodaj: (stavka) => AktivniServis.dodaj(stavka),
    promijeni: (sifra, stavka) => AktivniServis.promijeni(sifra, stavka),
    obrisi: (sifra) => AktivniServis.obrisi(sifra)
}