

const STORAGE_KEY = 'drzave'

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
    const drzave = dohvatiSveIzStorage()
    return { data: [...drzave] }
}

async function getBySifra(sifra) {
    const drzave = dohvatiSveIzStorage()

    return {
        data: drzave.find(d => d.sifra === parseInt(sifra))
    }
}

async function dodaj(drzava) {
    const drzave = dohvatiSveIzStorage()

    if (drzave.length === 0) {
        drzava.sifra = 1
    } else {
        const maxSifra = Math.max(...drzave.map(d => d.sifra))
        drzava.sifra = maxSifra + 1
    }

    drzave.push(drzava)
    spremiUStorage(drzave)
}

async function promijeni(sifra, drzava) {
    const drzave = dohvatiSveIzStorage()
    const index = drzave.findIndex(d => d.sifra === parseInt(sifra))

    if (index !== -1) {
        drzave[index] = { ...drzave[index], ...drzava }
        spremiUStorage(drzave)
    }
}

async function obrisi(sifra) {
    let drzave = dohvatiSveIzStorage()

    drzave = drzave.filter(d => d.sifra !== parseInt(sifra))

    spremiUStorage(drzave)
}

export default {
    get,
    getBySifra,
    dodaj,
    promijeni,
    obrisi
}