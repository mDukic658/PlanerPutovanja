import { fotografije } from "./FotografijePodaci";

async function get() {
    return { data: [...fotografije] }
}

async function getBySifra(sifra) {
    return {
        data: fotografije.find(
            fotografija => fotografija.sifra === Number(sifra)
        )
    }
}

async function getByPutovanje(putovanjeSifra) {
    return {
        data: fotografije.filter(
            fotografija =>
                fotografija.putovanjeSifra === Number(putovanjeSifra)
        )
    }
}

async function dodaj(fotografija) {
    const sifra = fotografije.length === 0
        ? 1
        : Math.max(...fotografije.map(stavka => stavka.sifra)) + 1

    const novaFotografija = {
        ...fotografija,
        sifra,
        putovanjeSifra: Number(fotografija.putovanjeSifra)
    }

    fotografije.push(novaFotografija)

    return { data: novaFotografija }
}

async function promijeni(sifra, fotografija) {
    const index = fotografije.findIndex(
        stavka => stavka.sifra === Number(sifra)
    )

    if (index === -1) {
        throw new Error("Fotografija nije pronađena.")
    }

    fotografije[index] = {
        ...fotografije[index],
        ...fotografija,
        sifra: fotografije[index].sifra,
        putovanjeSifra: Number(
            fotografija.putovanjeSifra ??
            fotografije[index].putovanjeSifra
        )
    }

    return { data: fotografije[index] }
}

async function obrisi(sifra) {
    const index = fotografije.findIndex(
        fotografija => fotografija.sifra === Number(sifra)
    )

    if (index === -1) {
        throw new Error("Fotografija nije pronađena.")
    }

    fotografije.splice(index, 1)
}

export default {
    get,
    getBySifra,
    getByPutovanje,
    dodaj,
    promijeni,
    obrisi
}