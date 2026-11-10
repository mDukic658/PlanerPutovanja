
const STORAGE_KEY = 'marta_predmeti'

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

async function dohvatiStranicu(
    stranica = 1,
    velicinaStranice = 10,
    uvjetPretrazivanja = ''
) {
    let filtriraniPredmeti = dohvatiSveIzStorage()

    if (uvjetPretrazivanja.trim() !== '') {
        const uvjet = uvjetPretrazivanja.toLowerCase().trim()

        filtriraniPredmeti = filtriraniPredmeti.filter(predmet =>
            (predmet.naziv || '').toLowerCase().includes(uvjet)
        )
    }

    const pocetniIndeks = (stranica - 1) * velicinaStranice
    const zavrsniIndeks = pocetniIndeks + velicinaStranice

    const ukupnoStavki = filtriraniPredmeti.length
    const ukupnoStranica = Math.ceil(
        ukupnoStavki / velicinaStranice
    )

    return {
        data: filtriraniPredmeti.slice(pocetniIndeks, zavrsniIndeks),
        ukupnoStranica,
        ukupnoStavki
    }
}

export default {
    get,
    getBySifra,
    dodaj,
    promijeni,
    obrisi,
    dohvatiStranicu
}