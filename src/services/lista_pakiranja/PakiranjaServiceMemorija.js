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

async function promijeni(sifra, pakiranje){
    const index = nadiIndex(sifra)
    pakiranja[index] = {...pakiranja[index], ...pakiranje}
}

function nadiIndex(sifra){
    return pakiranja.findIndex(p => p.sifra === parseInt(sifra))
}

async function obrisi(sifra){
    const index = nadiIndex(sifra)
    pakiranja.splice(index, 1)
}

export default {
    get,
    getByPutovanje,
    dodaj,
    promijeni, 
    obrisi
}