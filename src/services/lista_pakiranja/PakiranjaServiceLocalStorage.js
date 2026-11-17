
import { PrefixStorage } from "../../constants"

function dohvatiSveIzStorage() {
    const podaci = localStorage.getItem(PrefixStorage.PAKIRANJA)

    if (podaci) {
        return JSON.parse(podaci)
    }

    return []
}

function spremiUStorage(podaci) {
    localStorage.setItem(PrefixStorage.PAKIRANJA, JSON.stringify(podaci))
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

    const postoji = pakiranja.some(stavka =>
        Number(stavka.predmetSifra) === Number(pakiranje.predmetSifra) &&
        Number(stavka.putovanjeSifra) === Number(pakiranje.putovanjeSifra)
    )

    if (postoji) {
        throw new Error(
            "Ovaj predmet već postoji na listi pakiranja ovog putovanja."
        )
    }

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