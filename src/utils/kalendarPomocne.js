import dayjs from "dayjs"

export function pretvoriDatum(vrijednost) {
    const [godina, mjesec, dan] = vrijednost
        .slice(0, 10)
        .split("-")
        .map(Number)

    return new Date(godina, mjesec - 1, dan)
}

export function dohvatiNapredakPakiranja(pakiranja, putovanjeSifra) {
    const stavke = pakiranja.filter(
        pakiranje =>
            Number(pakiranje.putovanjeSifra) === Number(putovanjeSifra)
    )

    const ukupno = stavke.length
    const spakirano = stavke.filter(stavka => stavka.spakirano).length

    const postotak = ukupno === 0
        ? 0
        : Math.round((spakirano / ukupno) * 100)

    return {
        ukupno,
        spakirano,
        postotak
    }
}

export function napraviDogadajePutovanja(putovanja, pakiranja) {
    return putovanja.map(putovanje => {
        const polazak = pretvoriDatum(putovanje.datumPolaska)
        const kraj = pretvoriDatum(putovanje.datumPovratka)
        kraj.setDate(kraj.getDate() + 1)

        return {
            id: `putovanje-${putovanje.sifra}`,
            title: putovanje.naziv,
            start: polazak,
            end: kraj,
            allDay: true,
            vrsta: "putovanje",
            putovanje,
            napredak: dohvatiNapredakPakiranja(
                pakiranja,
                putovanje.sifra
            )
        }
    })
}

export function napraviDogadajeItinerara(stavkeItinerara, putovanja) {
    return stavkeItinerara.flatMap(stavka => {
        const putovanje = putovanja.find(
            putovanje =>
                Number(putovanje.sifra) === Number(stavka.putovanjeSifra)
        )

        if (!putovanje) return []

        const pocetak = pretvoriDatum(putovanje.datumPolaska)

        pocetak.setDate(
            pocetak.getDate() + Number(stavka.dan) - 1
        )

        const [sati, minute] = stavka.vrijeme
            .split(":")
            .map(Number)

        pocetak.setHours(sati, minute, 0, 0)
        const kraj = new Date(pocetak)
        kraj.setMinutes(kraj.getMinutes() + 30)

        return [{
            id: `itinerar-${stavka.sifra}`,
            title: `${stavka.naziv} — ${putovanje.naziv}`,
            start: pocetak,
            end: kraj,
            allDay: false,
            vrsta: "itinerar",
            putovanje,
            stavka
        }]
    })
}

export function dohvatiStilDatuma(datum, polazak, povratak) {
    if (!polazak) return {}

    const dan = dayjs(datum).format("YYYY-MM-DD")

    const jePolazak = dan === polazak
    const jePovratak = dan === povratak

    const jeURazdoblju =
        povratak &&
        dan >= polazak &&
        dan <= povratak

    if (!jePolazak && !jeURazdoblju) return {}

    const klase = []
    const style = {}

    if (jeURazdoblju) {
        klase.push("kalendar-odabrano-razdoblje")

        style.backgroundColor = "#e5f6fb"
        style.backgroundImage =
            "linear-gradient(to bottom, " +
            "transparent 38px, " +
            "var(--pacific-blue) 38px, " +
            "var(--pacific-blue) 46px, " +
            "transparent 46px)"
    }

    if (jePolazak) {
        klase.push("kalendar-odabrani-polazak")

        style.backgroundColor = "#bceaf4"
        style.boxShadow =
            "inset 0 0 0 2px var(--pacific-blue)"
    }

    if (jePovratak) {
        klase.push("kalendar-odabrani-povratak")

        style.backgroundColor = "#bceaf4"
    }

    return {
        className: klase.join(" "),
        style
    }
}