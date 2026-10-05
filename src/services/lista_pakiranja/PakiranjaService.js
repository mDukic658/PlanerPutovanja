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
    if (pakiranja.length === 0) {
        pakiranje.sifra = 1
    } else {
        pakiranje.sifra = pakiranja[pakiranja.length - 1].sifra + 1
    }

    pakiranja.push(pakiranje)
}

export default {
    get,
    getByPutovanje,
    dodaj
}