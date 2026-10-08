
const STORAGE_KEY = 'pakiranja'

function dohvatiSveIzStorage(){
    const podaci = localStorage.getItem(STORAGE_KEY)

    if(podaci){
        return JSON.parse(podaci)
    }

    return []
}

function spremiUStorage(podaci) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(podaci))
}

async function get() {
    const pakiranja = dohvatiSveIzStorage()
    return { data: [...pakiranja] }
}

async function getByPutovanje(sifraPutovanja) {
    const pakiranja = dohvatiSveIzStorage()

    return {
        data: pakiranja.filter(
            (pakiranje) => pakiranje.putovanjeSifra === sifraPutovanja
        )
    }
}

async function dodaj(pakiranje) {
    const pakiranja = dohvatiSveIzStorage()

    pakiranja.push(pakiranje)

    spremiUStorage(pakiranja)
}

async function promijeni(predmetSifra, putovanjeSifra, pakiranje) {
    const pakiranja = dohvatiSveIzStorage()

    const index = pakiranja.findIndex(
        p =>
            p.predmetSifra === predmetSifra &&
            p.putovanjeSifra === putovanjeSifra
    )

    pakiranja[index] = { ...pakiranja[index], ...pakiranje }

    spremiUStorage(pakiranja)
}

async function obrisi(predmetSifra, putovanjeSifra) {
    let pakiranja = dohvatiSveIzStorage()

    pakiranja = pakiranja.filter(
        p =>
            p.predmetSifra !== predmetSifra ||
            p.putovanjeSifra !== putovanjeSifra
    )

    spremiUStorage(pakiranja)
}

export default {
    get,
    getByPutovanje,
    dodaj,
    promijeni,
    obrisi
}