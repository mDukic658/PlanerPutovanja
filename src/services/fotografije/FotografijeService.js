import { DATA_SOURCE } from "../../constants"
import FotografijeServiceMemorija from "./FotografijeServiceMemorija"
import FotografijeServiceLocalStorage from "./FotografijeServiceLocalStorage"

let Servis = null

switch (DATA_SOURCE) {
    case "memorija":
        Servis = FotografijeServiceMemorija
        break

    case "localStorage":
        Servis = FotografijeServiceLocalStorage
        break

    default:
        Servis = null
}

function dohvatiServis() {
    if (!Servis) {
        throw new Error("Servis fotografija nije implementiran.")
    }

    return Servis
}

export default {
    get: () => dohvatiServis().get(),
    getBySifra: (sifra) =>
        dohvatiServis().getBySifra(sifra),
    getByPutovanje: (putovanjeSifra) =>
        dohvatiServis().getByPutovanje(putovanjeSifra),
    dodaj: (fotografija) =>
        dohvatiServis().dodaj(fotografija),
    promijeni: (sifra, fotografija) =>
        dohvatiServis().promijeni(sifra, fotografija),
    obrisi: (sifra) =>
        dohvatiServis().obrisi(sifra)
}