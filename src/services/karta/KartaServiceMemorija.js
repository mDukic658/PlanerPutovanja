import { posjeti } from "./KartaPodaci";

async function get() {
    return {
        data: posjeti.map(posjet => ({ ...posjet }))
    }
}

async function getBySifra(sifra) {
    const posjet = posjeti.find(
        p => p.sifra === Number(sifra)
    )

    return {
        data: posjet ? { ...posjet } : undefined
    }
}

async function getByDrzava(iso2) {
    const oznaka = iso2.trim().toUpperCase()

    return {
        data: posjeti
            .filter(p => p.iso2 === oznaka)
            .map(posjet => ({ ...posjet }))
    }
}

async function dodaj(posjet) {
    const novaSifra = posjeti.length === 0
        ? 1
        : Math.max(...posjeti.map(p => p.sifra)) + 1

    posjeti.push({
        ...posjet,
        sifra: novaSifra,
        iso2: posjet.iso2.trim().toUpperCase()
    })
}

async function promijeni(sifra, posjet) {
    const index = nadiIndex(sifra)

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
}

function nadiIndex(sifra) {
    return posjeti.findIndex(
        p => p.sifra === Number(sifra)
    )
}

async function obrisi(sifra) {
    const index = nadiIndex(sifra)

    if (index === -1) {
        throw new Error("Posjet nije pronađen.")
    }

    posjeti.splice(index, 1)
}

export default {
    get,
    getBySifra,
    getByDrzava,
    dodaj,
    promijeni,
    obrisi
}