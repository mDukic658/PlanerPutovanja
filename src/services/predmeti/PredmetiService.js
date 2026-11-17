import { DATA_SOURCE } from "../../constants"
import PredmetiServiceLocalStorage from "./PredmetiServiceLocalStorage"
import PredmetiServiceMemorija from "./PredmetiServiceMemorija"
import PakiranjaService from "../lista_pakiranja/PakiranjaService"
import PredmetiServiceFirebase from "./PredmetiServiceFirebase"

let Servis = null

switch (DATA_SOURCE) {
    case 'memorija':
        Servis = PredmetiServiceMemorija
        break
    case 'localStorage':
        Servis = PredmetiServiceLocalStorage
        break
    case 'firebase':
        Servis = PredmetiServiceFirebase
        break
    default:
        Servis = null
}

const PrazanServis = {
    get: async () => ({ data: [] }),
    getBySifra: async () => ({ data: {} }),
    dodaj: async () => {
        console.error('Servis nije implementiran')
    },
    promijeni: async () => {
        console.error('Servis nije implementiran')
    },
    obrisi: async () => {
        console.error('Servis nije implementiran')
    },
    dohvatiStranicu: async () => ({
        data: [],
        ukupnoStranica: 0,
        ukupnoStavki: 0
    })
}

const AktivniServis = Servis || PrazanServis

async function obrisi(sifra) {
    const sifraPredmeta = DATA_SOURCE === 'firebase'
        ? String(sifra)
        : Number(sifra)

    const odgovor = await PakiranjaService.get()

    if (odgovor.success === false) {
        throw new Error(
            odgovor.message || 'Dohvat pakiranja nije uspio.'
        )
    }

    const povezanaPakiranja = odgovor.data.filter(
        pakiranje =>
            String(pakiranje.predmetSifra) === String(sifraPredmeta)
    )

    for (const pakiranje of povezanaPakiranja) {
        const rezultat = await PakiranjaService.obrisi(
            pakiranje.predmetSifra,
            pakiranje.putovanjeSifra
        )

        if (rezultat?.success === false) {
            throw new Error(
                rezultat.message || 'Brisanje pakiranja nije uspjelo.'
            )
        }
    }

    const rezultat = await AktivniServis.obrisi(sifraPredmeta)

    if (rezultat?.success === false) {
        throw new Error(
            rezultat.message || 'Brisanje predmeta nije uspjelo.'
        )
    }

    return rezultat
}

export default {
    get: () => AktivniServis.get(),
    getBySifra: (sifra) => AktivniServis.getBySifra(sifra),
    dodaj: (predmet) => AktivniServis.dodaj(predmet),
    promijeni: (sifra, predmet) => AktivniServis.promijeni(sifra, predmet),
    obrisi,
    dohvatiStranicu: (stranica, velicinaStranice, uvjetPretrazivaja) =>
        AktivniServis.dohvatiStranicu(stranica, velicinaStranice, uvjetPretrazivaja)
}