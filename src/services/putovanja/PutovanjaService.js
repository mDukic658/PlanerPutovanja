
import { DATA_SOURCE } from "../../constants";
import PutovanjaServiceLocalStorage from "./PutovanjaServiceLocalStorage";
import PutovanjaServiceMemorija from "./PutovanjaServiceMemorija";
import PakiranjaService from "../lista_pakiranja/PakiranjaService";
import ItinerarService from "../itinerar/ItinerarService";
import BudzetServis from "../budzet/BudzetServis"
import FotografijeService from "../fotografije/FotografijeService";


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

async function obrisi(sifra) {
    const sifraPutovanja = Number(sifra)

    const odgovorPakiranja = await PakiranjaService.get()
    const pakiranjaPutovanja = odgovorPakiranja.data.filter(
        pakiranje => Number(pakiranje.putovanjeSifra) === sifraPutovanja
    )

    for (const pakiranje of pakiranjaPutovanja) {
        await PakiranjaService.obrisi(
            pakiranje.predmetSifra,
            pakiranje.putovanjeSifra
        )
    }

    const odgovorItinerara = await ItinerarService.get()
    const aktivnostiPutovanja = odgovorItinerara.data.filter(
        aktivnost => Number(aktivnost.putovanjeSifra) === sifraPutovanja
    )

    for (const aktivnost of aktivnostiPutovanja) {
        await ItinerarService.obrisi(aktivnost.sifra)
    }

    const odgovorBudzeta = await BudzetServis.get()
    const troskoviPutovanja = odgovorBudzeta.data.filter(
        trosak => Number(trosak.putovanjeSifra) === sifraPutovanja
    )

    for (const trosak of troskoviPutovanja) {
        await BudzetServis.obrisi(trosak.sifra)
    }

    const odgovorFotografija = await FotografijeService.getByPutovanje(
        sifraPutovanja
    )

    for (const fotografija of odgovorFotografija.data) {
        await FotografijeService.obrisi(fotografija.sifra)
    }

    await AktivniServis.obrisi(sifraPutovanja)
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