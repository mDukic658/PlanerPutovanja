import { troskovi } from "./BudzetPodaci";

async function get() {
    return { data: troskovi.map(trosak => ({ ...trosak })) }
}

async function getByPutovanje(sifraPutovanja) {
    const stavke = troskovi
        .filter(t => t.putovanjeSifra === Number(sifraPutovanja))
        .map(t => ({ ...t }))

    return {
        data: stavke
    }
}

async function getBySifra(sifra) {
    const trosak = troskovi.find(t => t.sifra === Number(sifra))

    return {
        data: trosak ? { ...trosak } : undefined
    }
}

async function dodaj(trosak) {
    const novaSifra = troskovi.length === 0
        ? 1
        : Math.max(...troskovi.map(t => t.sifra)) + 1

    troskovi.push({
        ...trosak,
        sifra: novaSifra,
        putovanjeSifra: Number(trosak.putovanjeSifra),
        iznos: Number(trosak.iznos),
    })
}

async function promijeni(sifra, trosak) {
    const index = nadiIndex(sifra)
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
}

function nadiIndex(sifra) {
    return troskovi.findIndex(t => t.sifra === Number(sifra))
}

async function obrisi(sifra) {
    const index = nadiIndex(sifra)
    if (index === -1) {
        throw new Error("Trošak nije pronađen.")
    }

    troskovi.splice(index, 1)
}

async function dohvatiStranicu(stranica = 1,
    velicinaStranice = 6,
    sifraPutovanja = null) {

    const stavke = sifraPutovanja === null
        ? troskovi
        : troskovi.filter(
            t => t.putovanjeSifra === Number(sifraPutovanja)
        )

    const pocetniIndeks = (stranica - 1) * velicinaStranice
    const zavrsniIndeks = pocetniIndeks + velicinaStranice

    const podaciStranice = stavke
        .slice(pocetniIndeks, zavrsniIndeks)
        .map(t => ({ ...t }))

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