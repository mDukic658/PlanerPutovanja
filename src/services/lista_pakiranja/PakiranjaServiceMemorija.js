import { pakiranja } from "./PakiranjaPodaci";

async function get() {
    return { data: [...pakiranja] }
}

async function getByPutovanje(sifraPutovanja) {
    return {
        data: pakiranja.filter((pakiranje) => pakiranje.putovanjeSifra === sifraPutovanja)
    }
}

async function dodaj(pakiranje) {
    pakiranja.push(pakiranje)
}

async function promijeni(predmetSifra, putovanjeSifra, pakiranje) {
    const index = pakiranja.findIndex(
        (stavka) =>
            stavka.predmetSifra === predmetSifra &&
            stavka.putovanjeSifra === putovanjeSifra
    )

    if (index === -1) {
        throw new Error("Stavka pakiranja nije pronađena.")
    }

    pakiranja[index] = {
        ...pakiranja[index],
        ...pakiranje
    }
}

async function obrisi(predmetSifra, putovanjeSifra) {
    const index = pakiranja.findIndex(
        (stavka) =>
            stavka.predmetSifra === predmetSifra &&
            stavka.putovanjeSifra === putovanjeSifra
    )

    if (index === -1) {
        throw new Error("Stavka pakiranja nije pronađena.")
    }

    pakiranja.splice(index, 1)
}

export default {
    get,
    getByPutovanje,
    dodaj,
    promijeni,
    obrisi
}