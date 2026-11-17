
import { DATA_SOURCE } from "../../constants";
import PutovanjaServiceLocalStorage from "./PutovanjaServiceLocalStorage";
import PutovanjaServiceMemorija from "./PutovanjaServiceMemorija";
import PakiranjaService from "../lista_pakiranja/PakiranjaService";
import ItinerarService from "../itinerar/ItinerarService";
import BudzetServis from "../budzet/BudzetServis"
import FotografijeService from "../fotografije/FotografijeService";
import PutovanjaServiceFirebase from "./PutovanjaServiceFirebase";


let Servis = null


switch (DATA_SOURCE) {
    case 'memorija':
        Servis = PutovanjaServiceMemorija
        break
    case 'localStorage':
        Servis = PutovanjaServiceLocalStorage
        break
    case 'firebase':
        Servis = PutovanjaServiceFirebase
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

async function obrisi(sifra) {
    const sifraPutovanja = DATA_SOURCE === 'firebase'
        ? String(sifra)
        : Number(sifra)

    const odgovorPakiranja = await PakiranjaService.get()

    if (odgovorPakiranja.success === false) {
        throw new Error(
            odgovorPakiranja.message || 'Dohvat pakiranja nije uspio.'
        )
    }

    const pakiranjaPutovanja = odgovorPakiranja.data.filter(
        pakiranje =>
            String(pakiranje.putovanjeSifra) === String(sifraPutovanja)
    )

    for (const pakiranje of pakiranjaPutovanja) {
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

    const povezaniServisi = [
        { servis: ItinerarService, naziv: 'aktivnosti' },
        { servis: BudzetServis, naziv: 'troškova' },
        { servis: FotografijeService, naziv: 'fotografija' }
    ]

    for (const { servis, naziv } of povezaniServisi) {
        const odgovor = await servis.getByPutovanje(sifraPutovanja)

        if (odgovor.success === false) {
            throw new Error(
                odgovor.message || `Dohvat ${naziv} nije uspio.`
            )
        }

        for (const stavka of odgovor.data) {
            const rezultat = await servis.obrisi(stavka.sifra)

            if (rezultat?.success === false) {
                throw new Error(
                    rezultat.message || `Brisanje ${naziv} nije uspjelo.`
                )
            }
        }
    }

    const rezultat = await AktivniServis.obrisi(sifraPutovanja)

    if (rezultat?.success === false) {
        throw new Error(
            rezultat.message || 'Brisanje putovanja nije uspjelo.'
        )
    }

    return rezultat
}

export default {
    get: () => AktivniServis.get(),
    getBySifra: (sifra) => AktivniServis.getBySifra(sifra),
    dodaj: (putovanje) => AktivniServis.dodaj(putovanje),
    promijeni: (sifra, putovanje) =>
        AktivniServis.promijeni(sifra, putovanje),
    obrisi,
    dohvatiStranicu: (stranica, velicinaStranice, uvjetPretrazivanja) =>
        AktivniServis.dohvatiStranicu(stranica, velicinaStranice, uvjetPretrazivanja)
}