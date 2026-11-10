import { DATA_SOURCE } from "../../constants"
import PredmetiServiceLocalStorage from "./PredmetiServiceLocalStorage"
import PredmetiServiceMemorija from "./PredmetiServiceMemorija"
import PakiranjaService from "../lista_pakiranja/PakiranjaService"

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
    const sifraPredmeta = Number(sifra)

    const odgovor = await PakiranjaService.get()
    const povezanaPakiranja = odgovor.data.filter(
        pakiranje => Number(pakiranje.predmetSifra) === sifraPredmeta
    )

    for (const pakiranje of povezanaPakiranja) {
        await PakiranjaService.obrisi(
            pakiranje.predmetSifra,
            pakiranje.putovanjeSifra
        )
    }

    await AktivniServis.obrisi(sifraPredmeta)
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