import { drzave } from "./DrzavePodaci"

async function get() {
    return { data: [...drzave] }
}

async function getBySifra(sifra) {
    const drzava = drzave.find(
        (drzava) => drzava.sifra === parseInt(sifra)
    )

    return {
        data: drzava
    }
}

async function dodaj(drzava) {
    if (drzave.length === 0) {
        drzava.sifra = 1
    } else {
        drzava.sifra = drzave[drzave.length - 1].sifra + 1
    }

    drzave.push(drzava)
}

async function promijeni(sifra, drzava) {
    const index = nadiIndex(sifra)

    if (index !== -1) {
        drzave[index] = { ...drzave[index], ...drzava }
    }
}

function nadiIndex(sifra) {
    return drzave.findIndex(
        (d) => d.sifra === parseInt(sifra)
    )
}

async function obrisi(sifra) {
    const index = nadiIndex(sifra)

    if (index !== -1) {
        drzave.splice(index, 1)
    }
}

export default {
    get,
    getBySifra,
    dodaj,
    promijeni,
    obrisi
}