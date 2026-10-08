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

async function getBySifra(sifra) {
    const predmet = predmeti.find((stavka) => stavka.sifra === sifra)

    return {
        data: predmet
    }
}

async function promijeni(sifra, predmet) {

    const indeks = predmeti.findIndex(
        (stavka) => stavka.sifra === sifra
    )

    predmeti[indeks].naziv = predmet.naziv
}

function nadiIndex(sifra){
    return predmet.findIndex(p => p.sifra === parseInt(sifra))
}

async function obrisi(sifra){
    const index = nadiIndex(sifra)
    predmeti.splice(index, 1)
}

export default {
    get,
    dodaj,
    getBySifra,
    promijeni,
    obrisi
}