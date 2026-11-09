const STORAGE_KEY = "marta_posjecena_mjesta"

function dohvatiSveIzStorage() {
    const podaci = localStorage.getItem(STORAGE_KEY)

    return podaci ? JSON.parse(podaci) : []
}

function spremiUStorage(podaci) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(podaci)
    )
}

async function get() {
    return {
        data: dohvatiSveIzStorage()
    }
}

async function getBySifra(sifra) {
    const posjeti = dohvatiSveIzStorage()

    return {
        data: posjeti.find(
            p => p.sifra === Number(sifra)
        )
    }
}

async function getByDrzava(iso2) {
    const posjeti = dohvatiSveIzStorage()
    const oznaka = iso2.trim().toUpperCase()

    return {
        data: posjeti.filter(p => p.iso2 === oznaka)
    }
}

async function dodaj(posjet) {
    const posjeti = dohvatiSveIzStorage()

    const novaSifra = posjeti.length === 0
        ? 1
        : Math.max(...posjeti.map(p => p.sifra)) + 1

    posjeti.push({
        ...posjet,
        sifra: novaSifra,
        iso2: posjet.iso2.trim().toUpperCase()
    })

    spremiUStorage(posjeti)
}

async function promijeni(sifra, posjet) {
    const posjeti = dohvatiSveIzStorage()

    const index = posjeti.findIndex(
        p => p.sifra === Number(sifra)
    )

    if (index === -1) {
        throw new Error("Posjet nije pronađen.")
    }

    posjeti[index] = {
        ...posjeti[index],
        ...posjet,
        sifra: posjeti[index].sifra,
        iso2: (posjet.iso2 ?? posjeti[index].iso2)
            .trim()
            .toUpperCase()
    }

    spremiUStorage(posjeti)
}

async function obrisi(sifra) {
    const posjeti = dohvatiSveIzStorage()

    const index = posjeti.findIndex(
        p => p.sifra === Number(sifra)
    )

    if (index === -1) {
        throw new Error("Posjet nije pronađen.")
    }

    posjeti.splice(index, 1)

    spremiUStorage(posjeti)
}

export default {
    get,
    getBySifra,
    getByDrzava,
    dodaj,
    promijeni,
    obrisi
}