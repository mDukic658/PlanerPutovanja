import { predmeti } from "./PredmetiPodaci";


async function get() {
    return { data: [...predmeti] }
}

async function dodaj(predmet) {
    if (predmeti.length === 0) {
        predmet.sifra = 1
    } else {
        predmet.sifra = predmeti[predmeti.length - 1].sifra + 1
    }

    predmeti.push(predmet)
}

export default {
    get,
    dodaj
}