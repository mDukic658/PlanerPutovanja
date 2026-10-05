import { putovanja } from "./PutovanjaPodaci";

async function get() {
    return { data: [...putovanja] }
}

async function getBySifra(sifra) {
    const putovanje = putovanja.find(
        (putovanje) => putovanje.sifra === parseInt(sifra)
    )

    return {
        data: putovanje
    }
}

async function dodaj(putovanje) {
    if (putovanja.length === 0) {
        putovanje.sifra = 1
    } else {
        putovanje.sifra = putovanja[putovanja.length - 1].sifra + 1
    }

    putovanja.push(putovanje)
}

async function promijeni(sifra, putovanje){
    const index = nadiIndex(sifra)
    putovanja[index] = {...putovanja[index], ...putovanje}
}

function nadiIndex(sifra){
    return putovanja.findIndex(p => p.sifra === parseInt(sifra))
}

export default {
    get,
    getBySifra,
    dodaj,
    promijeni
}