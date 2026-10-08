import { putovanja } from "./PutovanjaPodaci"

const STORAGE_KEY = 'putovanja'

function dohvatiSveIzStorage() {
    const podaci = localStorage.getItem(STORAGE_KEY)

    if(podaci){
        return JSON.parse(podaci)
    }

    spremiUStorage(putovanja)

    return [...putovanja]
}

function spremiUStorage(podaci) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(podaci))
}

async function get() {
    const putovanja = dohvatiSveIzStorage()
    return { data: [...putovanja] }
}

async function getBySifra(sifra) {
    const putovanja = dohvatiSveIzStorage()
    return { data: putovanja.find(p => p.sifra === parseInt(sifra)) }
}

async function dodaj(putovanje) {
    const putovanja = dohvatiSveIzStorage()

    if (putovanja.length === 0) {
        putovanje.sifra = 1
    } else {
        const maxSifra = Math.max(...putovanja.map(p => p.sifra))
    }

    putovanja.push(putovanje)
    spremiUStorage(putovanja)
}

async function promijeni(sifra, putovanje) {
    const putovanja = dohvatiSveIzStorage()
    const index = putovanja.findIndex(p => p.sifra === parseInt(sifra))

    putovanja[index] = { ...putovanja[index], ...putovanje }

    spremiUStorage(putovanja)
}

async function obrisi(sifra) {
    let putovanja = dohvatiSveIzStorage()

    putovanja = putovanja.filter(p => p.sifra !== parseInt(sifra))

    spremiUStorage(putovanja)
}

export default{
    get, 
    getBySifra,
    dodaj,
    promijeni,
    obrisi
}