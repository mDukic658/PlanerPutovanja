

const STORAGE_KEY = 'marta_budzet'

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
    const troskovi = dohvatiSveIzStorage()

    return { data: troskovi }
}

async function getByPutovanje(sifraPutovanja) {
    const troskovi = dohvatiSveIzStorage()

    return {
        data: troskovi.filter(
            t => t.putovanjeSifra === Number(sifraPutovanja)
        ),
    }
}

async function getBySifra(sifra) {
    const troskovi = dohvatiSveIzStorage()

    return {
        data: troskovi.find(t => t.sifra === Number(sifra)),
    }
}

async function dodaj(trosak) {
    const troskovi = dohvatiSveIzStorage()

    const novaSifra = troskovi.length === 0
        ? 1
        : Math.max(...troskovi.map(t => t.sifra)) + 1

    troskovi.push({
        ...trosak,
        sifra: novaSifra,
        putovanjeSifra: Number(trosak.putovanjeSifra),
        iznos: Number(trosak.iznos),
    })

    spremiUStorage(troskovi)
}

async function promijeni(sifra, trosak) {
    const troskovi = dohvatiSveIzStorage()
    const index = troskovi.findIndex(
        t => t.sifra === Number(sifra)
    )

    if (index === -1) {
        throw new Error("Trošak nije pronađen.")
    }

    troskovi[index] = {
        ...troskovi[index],
        ...trosak,
        sifra: troskovi[index].sifra,
        putovanjeSifra: Number(
            trosak.putovanjeSifra ?? troskovi[index].putovanjeSifra
        ),
        iznos: Number(trosak.iznos ?? troskovi[index].iznos),
    }

    spremiUStorage(troskovi)
}

async function obrisi(sifra) {
    const troskovi = dohvatiSveIzStorage()
    const index = troskovi.findIndex(
        t => t.sifra === Number(sifra)
    )

    if (index === -1) {
        throw new Error("Trošak nije pronađen.")
    }

    troskovi.splice(index, 1)

    spremiUStorage(troskovi)
}

async function dohvatiStranicu(
    stranica = 1,
    velicinaStranice = 6,
    sifraPutovanja = null
) {
    const troskovi = dohvatiSveIzStorage()

    const stavke = sifraPutovanja === null
        ? troskovi
        : troskovi.filter(
            t => t.putovanjeSifra === Number(sifraPutovanja)
        )

    const pocetniIndeks = (stranica - 1) * velicinaStranice
    const zavrsniIndeks = pocetniIndeks + velicinaStranice

    const podaciStranice = stavke.slice(
        pocetniIndeks,
        zavrsniIndeks
    )

    const ukupnoStavki = stavke.length
    const ukupnoStranica = Math.ceil(
        ukupnoStavki / velicinaStranice
    )

    return {
        data: podaciStranice,
        ukupnoStranica,
        ukupnoStavki,
    }
}

export default {
    get,
    getByPutovanje,
    getBySifra,
    dodaj,
    promijeni,
    obrisi,
    dohvatiStranicu
}