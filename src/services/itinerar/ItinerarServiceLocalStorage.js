const STORAGE_KEY = 'itinerar'

function dohvatiSveIzStorage() {
    const podaci = localStorage.getItem(STORAGE_KEY)

    if (podaci) {
        return JSON.parse(podaci)
    }

    return []
}

function spremiUStorage(podaci) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(podaci))
}

async function get() {
    const stavke = dohvatiSveIzStorage()
    return { data: [...stavke] }
}

async function getByPutovanje(sifraPutovanja) {
    const stavke = dohvatiSveIzStorage()
    return {
        data: stavke.filter(s => s.putovanjeSifra === parseInt(sifraPutovanja))
    }
}

async function getBySifra(sifra) {
    const stavke = dohvatiSveIzStorage()
    return { data: stavke.find(s => s.sifra === parseInt(sifra)) }
}

async function dodaj(stavka) {
    const stavke = dohvatiSveIzStorage()

    if (stavke.length === 0) {
        stavka.sifra = 1
    } else {
        const maxSifra = Math.max(...stavke.map(s => s.sifra))
        stavka.sifra = maxSifra + 1
    }

    stavke.push(stavka)
    spremiUStorage(stavke)
}

async function promijeni(sifra, stavka) {
    const stavke = dohvatiSveIzStorage()
    const index = stavke.findIndex(s => s.sifra === parseInt(sifra))

    stavke[index] = { ...stavke[index], ...stavka }

    spremiUStorage(stavke)
}

async function obrisi(sifra) {
    let stavke = dohvatiSveIzStorage()

    stavke = stavke.filter(s => s.sifra !== parseInt(sifra))

    spremiUStorage(stavke)
}

export default {
    get,
    getByPutovanje,
    getBySifra,
    dodaj,
    promijeni,
    obrisi
}