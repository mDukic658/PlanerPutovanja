

export function provjeriTrajanjePutovanja(putovanje, aktivnosti) {
    const polazak = Date.parse(
        String(putovanje.datumPolaska).slice(0, 10)
    )

    const povratak = Date.parse(
        String(putovanje.datumPovratka).slice(0, 10)
    )

    if (
        !Number.isFinite(polazak) ||
        !Number.isFinite(povratak) ||
        povratak < polazak
    ) {
        throw new Error("Datumi putovanja nisu ispravni.")
    }

    const brojDana = Math.round(
        (povratak - polazak) / 86400000
    ) + 1

    const izvanTrajanja = aktivnosti.some(aktivnost =>
        Number(aktivnost.putovanjeSifra) === Number(putovanje.sifra) &&
        Number(aktivnost.dan) > brojDana
    )

    if (izvanTrajanja) {
        throw new Error(
            `Putovanje traje ${brojDana} dana, a postoje aktivnosti nakon posljednjeg dana. Prvo ih premjestite ili obrišite.`
        )
    }
}