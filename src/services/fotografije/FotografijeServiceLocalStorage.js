const STORAGE_KEY = "marta_fotografije"

function dohvatiSveIzStorage() {
    const podaci = localStorage.getItem(STORAGE_KEY)

    return podaci ? JSON.parse(podaci) : []
}

function spremiUStorage(podaci) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(podaci))
}

async function get() {
    return { data: dohvatiSveIzStorage() }
}

async function getBySifra(sifra) {
    const fotografije = dohvatiSveIzStorage()

    return {
        data: fotografije.find(
            fotografija => fotografija.sifra === Number(sifra)
        )
    }
}

async function getByPutovanje(putovanjeSifra) {
    const fotografije = dohvatiSveIzStorage()

    return {
        data: fotografije.filter(
            fotografija =>
                fotografija.putovanjeSifra === Number(putovanjeSifra)
        )
    }
}

async function dodaj(fotografija) {
    const fotografije = dohvatiSveIzStorage()

    const sifra = fotografije.length === 0
        ? 1
        : Math.max(...fotografije.map(stavka => stavka.sifra)) + 1

    const novaFotografija = {
        ...fotografija,
        sifra,
        putovanjeSifra: Number(fotografija.putovanjeSifra)
    }

    fotografije.push(novaFotografija)
    spremiUStorage(fotografije)

    return { data: novaFotografija }
}

async function promijeni(sifra, fotografija) {
    const fotografije = dohvatiSveIzStorage()

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

    spremiUStorage(fotografije)

    return { data: fotografije[index] }
}

async function obrisi(sifra) {
    const fotografije = dohvatiSveIzStorage()

    const index = fotografije.findIndex(
        fotografija => fotografija.sifra === Number(sifra)
    )

    if (index === -1) {
        throw new Error("Fotografija nije pronađena.")
    }

    fotografije.splice(index, 1)
    spremiUStorage(fotografije)
}

async function dodajVise(stavke) {
    const fotografije = dohvatiSveIzStorage()

    const pocetnaSifra = fotografije.reduce(
        (najveca, fotografija) =>
            Math.max(najveca, fotografija.sifra),
        0
    ) + 1

    const noveFotografije = stavke.map((fotografija, index) => ({
        ...fotografija,
        sifra: pocetnaSifra + index,
        putovanjeSifra: Number(fotografija.putovanjeSifra)
    }))

    spremiUStorage([
        ...fotografije,
        ...noveFotografije
    ])

    return { data: noveFotografije }
}

export default {
    get,
    getBySifra,
    getByPutovanje,
    dodaj,
    dodajVise,
    promijeni,
    obrisi
}