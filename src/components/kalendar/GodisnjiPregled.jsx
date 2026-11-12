import dayjs from "dayjs";

export default function GodisnjiPregled({
    godina,
    dogadaji,
    onOdaberiMjesec
}) {

    const pocetakGodine = dayjs().year(godina).startOf("year")

    return (
        <div className="godisnji-pregled">
            {Array.from({ length: 12 }, (_, mjesec) => {
                const pocetakMjeseca = pocetakGodine.month(mjesec)
                const sljedeciMjesec = pocetakMjeseca.add(1, "month")

                const dogadajiMjeseca = dogadaji.filter((dogadaj) =>
                    dogadaj.start < sljedeciMjesec.toDate() &&
                    dogadaj.end > pocetakMjeseca.toDate()
                )

                const brojPutovanja = dogadajiMjeseca.filter(
                    (dogadaj) => dogadaj.vrsta === "putovanje"
                ).length

                const brojAktivnosti = dogadajiMjeseca.filter(
                    (dogadaj) => dogadaj.vrsta === "itinerar"
                ).length

                // Ponedjeljak je prvi dan u tjednu.
                const praznaPolja = (pocetakMjeseca.day() + 6) % 7

                return (
                    <button
                        key={mjesec}
                        type="button"
                        className="godisnji-mjesec"
                        onClick={() =>
                            onOdaberiMjesec(pocetakMjeseca.toDate())
                        }
                        aria-label={
                            `Otvori ${pocetakMjeseca
                                .locale("hr")
                                .format("MMMM YYYY.")}`
                        }
                    >
                        <span className="godisnji-mjesec-naslov">
                            {pocetakMjeseca.locale("hr").format("MMMM")}
                        </span>

                        <span className="godisnji-dani">
                            {["P", "U", "S", "Č", "P", "S", "N"].map(
                                (naziv, index) => (
                                    <span
                                        key={`naziv-${index}`}
                                        className="godisnji-dan-naziv"
                                    >
                                        {naziv}
                                    </span>
                                )
                            )}

                            {Array.from(
                                { length: praznaPolja },
                                (_, index) => (
                                    <span key={`prazno-${index}`} />
                                )
                            )}

                            {Array.from(
                                { length: pocetakMjeseca.daysInMonth() },
                                (_, index) => {
                                    const datum = pocetakMjeseca.date(index + 1)
                                    const pocetakDana = datum.toDate()
                                    const sljedeciDan = datum.add(1, "day").toDate()

                                    const dogadajiDana = dogadajiMjeseca.filter(
                                        (dogadaj) =>
                                            dogadaj.start < sljedeciDan &&
                                            dogadaj.end > pocetakDana
                                    )

                                    const imaPutovanje = dogadajiDana.some(
                                        (dogadaj) =>
                                            dogadaj.vrsta === "putovanje"
                                    )

                                    const imaAktivnost = dogadajiDana.some(
                                        (dogadaj) =>
                                            dogadaj.vrsta === "itinerar"
                                    )

                                    const danas = datum.isSame(dayjs(), "day")

                                    return (
                                        <span
                                            key={index}
                                            className={[
                                                "godisnji-dan",
                                                imaPutovanje
                                                    ? "ima-putovanje"
                                                    : "",
                                                danas ? "je-danas" : ""
                                            ].filter(Boolean).join(" ")}
                                        >
                                            {index + 1}

                                            {imaAktivnost && (
                                                <span className="godisnji-aktivnost" />
                                            )}
                                        </span>
                                    )
                                }
                            )}
                        </span>

                        <span className="godisnji-mjesec-sazetak">
                            Putovanja: {brojPutovanja}
                            {" · "}
                            Aktivnosti: {brojAktivnosti}
                        </span>
                    </button>
                )
            })}
        </div>
    )
}