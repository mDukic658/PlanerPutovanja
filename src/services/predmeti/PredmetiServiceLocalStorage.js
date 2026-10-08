
const STORAGE_KEY = 'predmeti'

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
    const predmeti = dohvatiSveIzStorage()
    return { data: [...predmeti] }
}

async function getBySifra(sifra) {
    const predmeti = dohvatiSveIzStorage()
    return { data: predmeti.find(p => p.sifra === parseInt(sifra)) }
}

async function dodaj(predmet) {
    const predmeti = dohvatiSveIzStorage()

    if (predmeti.length === 0) {
        predmet.sifra = 1
    } else {
        const maxSifra = Math.max(...predmeti.map(p => p.sifra))
        predmet.sifra = maxSifra + 1
    }

    predmeti.push(predmet)
    spremiUStorage(predmeti)
}

async function promijeni(sifra, predmet) {
    const predmeti = dohvatiSveIzStorage()
    const index = predmeti.findIndex(p => p.sifra === parseInt(sifra))

    predmeti[index] = { ...predmeti[index], ...predmet }

    spremiUStorage(predmeti)
}

async function obrisi(sifra) {
    let predmeti = dohvatiSveIzStorage()

    predmeti = predmeti.filter(p => p.sifra !== parseInt(sifra))

    spremiUStorage(predmeti)
}

export default {
    get,
    getBySifra,
    dodaj,
    promijeni,
    obrisi
}