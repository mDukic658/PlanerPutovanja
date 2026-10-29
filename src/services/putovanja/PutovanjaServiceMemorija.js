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

async function obrisi(sifra){
    const index = nadiIndex(sifra)
    putovanja.splice(index, 1)
}

async function dohvatiStranicu(stranica = 1, velicinaStranice = 6) {

    const pocetniIndeks = (stranica - 1) * velicinaStranice
    const zavrsniIndeks = pocetniIndeks + velicinaStranice

    const podaciStranice = putovanja.slice(
        pocetniIndeks,
        zavrsniIndeks
    )

    const ukupnoStavki = putovanja.length
    const ukupnoStranica = Math.ceil(
        ukupnoStavki / velicinaStranice
    )

    return {
        data: podaciStranice,
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