import { stavkeItinerara } from "./ItinerarPodaci"

async function get() {
    return { data: [...stavkeItinerara] }
}

async function getByPutovanje(sifraPutovanja) {
    const stavke = stavkeItinerara.filter(
        s => s.putovanjeSifra === parseInt(sifraPutovanja)
    )
    return { data: stavke }
}

async function getBySifra(sifra) {
    const stavka = stavkeItinerara.find(
        s => s.sifra === parseInt(sifra)
    )
    return { data: stavka }
}

async function dodaj(stavka) {
    if (stavkeItinerara.length === 0) {
        stavka.sifra = 1
    } else {
        stavka.sifra = stavkeItinerara[stavkeItinerara.length - 1].sifra + 1
    }

    stavkeItinerara.push(stavka)
}

async function promijeni(sifra, stavka) {
    const index = nadiIndex(sifra)
    stavkeItinerara[index] = { ...stavkeItinerara[index], ...stavka }
}

function nadiIndex(sifra) {
    return stavkeItinerara.findIndex(s => s.sifra === parseInt(sifra))
}

async function obrisi(sifra) {
    const index = nadiIndex(sifra)
    stavkeItinerara.splice(index, 1)
}

export default {
    get,
    getByPutovanje,
    getBySifra,
    dodaj,
    promijeni,
    obrisi
}