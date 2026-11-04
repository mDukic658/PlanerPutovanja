import { Document, Page, Text, View, StyleSheet, Font, Svg, Path, pdf } from "@react-pdf/renderer";


export default function ListaPakiranjaPDFGenerator({ putovanje, pakiranja, predmeti }) {

    const styles = StyleSheet.create({
        stranica: {
            padding: 40,
            paddingBottom: 65,
            fontFamily: "OpenSans",
            fontSize: 11,
            color: "#1f2937"
        },
        zaglavlje: {
            borderBottomWidth: 2,
            borderBottomColor: "#1ca9c9",
            paddingBottom: 16,
            marginBottom: 20
        },
        aplikacija: {
            fontSize: 22,
            color: "#1ca9c9",
            marginBottom: 6
        },
        naslov: {
            fontSize: 16,
            marginBottom: 10
        },
        putovanje: {
            fontSize: 14,
            marginBottom: 6
        },
        detalj: {
            fontSize: 10,
            marginBottom: 4,
            lineHeight: 1.5
        },
        sazetak: {
            backgroundColor: "#faf5e8",
            padding: 12,
            marginBottom: 16
        },
        podatak: {
            marginBottom: 4
        },
        red: {
            flexDirection: "row",
            alignItems: "flex-start",
            borderBottomWidth: 1,
            borderBottomColor: "#e5e7eb",
            paddingVertical: 12
        },
        kucica: {
            width: 12,
            height: 12,
            borderWidth: 1,
            borderColor: "#1f2937",
            marginRight: 12,
            marginTop: 2,
            flexShrink: 0,
            alignItems: "center",
            justifyContent: "center"
        },
        kucicaSpakirano: {
            backgroundColor: "#556b2f",
            borderColor: "#556b2f"
        },
        sadrzajPredmeta: {
            flex: 1,
            minWidth: 0
        },
        nazivPredmeta: {
            fontSize: 11,
            lineHeight: 1.5
        },
        napomena: {
            fontSize: 9,
            color: "#6b7280",
            marginTop: 4,
            lineHeight: 1.5
        },
        prazno: {
            color: "#6b7280"
        },
        podnozje: {
            position: "absolute",
            bottom: 25,
            left: 40,
            right: 40,
            fontSize: 9,
            color: "#6b7280",
            textAlign: "center"
        }
    })

    function rastaviDatum(vrijednost) {
        if (!vrijednost) return null

        const dijelovi = String(vrijednost)
            .slice(0, 10)
            .split("-")

        if (dijelovi.length !== 3) return null

        const [godina, mjesec, dan] = dijelovi.map(Number)

        if (!godina || !mjesec || !dan) return null

        return { godina, mjesec, dan }
    }

    function puniDatum(datum) {
        return `${datum.dan}.${datum.mjesec}. ${datum.godina}.`
    }

    function formatirajDatume(polazak, povratak) {
        const pocetak = rastaviDatum(polazak)
        const kraj = rastaviDatum(povratak)

        if (!pocetak && !kraj) return "Nije navedeno"
        if (!pocetak) return `Povratak: ${puniDatum(kraj)}`
        if (!kraj) return `Polazak: ${puniDatum(pocetak)}`

        const istiMjesecIGodina =
            pocetak.mjesec === kraj.mjesec &&
            pocetak.godina === kraj.godina

        if (istiMjesecIGodina) {
            return (
                `${pocetak.dan}.${pocetak.mjesec}` +
                `–${kraj.dan}.${kraj.mjesec}. ${kraj.godina}.`
            )
        }

        return `${puniDatum(pocetak)} – ${puniDatum(kraj)}`
    }

    function formatirajBudzet(vrijednost) {
        if (
            vrijednost === null ||
            vrijednost === undefined ||
            vrijednost === ""
        ) {
            return "Nije naveden"
        }

        const iznos = Number(vrijednost)

        if (!Number.isFinite(iznos)) return "Nije naveden"

        return new Intl.NumberFormat("hr-HR", {
            style: "currency",
            currency: "EUR"
        }).format(iznos)
    }

    const generirajPDF = async () => {

        const stavke = pakiranja.filter(
            (pakiranje) =>
                pakiranje.putovanjeSifra === putovanje.sifra
        )

        const spakirano = stavke.filter(
            (stavka) => stavka.spakirano
        ).length

        const lokacija = [
            putovanje.destinacija,
            putovanje.drzava
        ].filter(Boolean).join(", ")

        const dokument = (
            <Document
                title={`Lista pakiranja - ${putovanje.naziv}`}
                author="Planer Putovanja"
            >
                <Page size="A4" style={styles.stranica}>

                    <View style={styles.zaglavlje} wrap={false}>
                        <Text style={styles.aplikacija}>
                            Planer Putovanja
                        </Text>

                        <Text style={styles.naslov}>
                            Lista pakiranja
                        </Text>

                        <Text style={styles.putovanje}>
                            {putovanje.naziv}
                        </Text>

                        {lokacija && (
                            <Text style={styles.detalj}>
                                Destinacija: {lokacija}
                            </Text>
                        )}

                        <Text style={styles.detalj}>
                            Termin: {formatirajDatume(
                                putovanje.datumPolaska,
                                putovanje.datumPovratka
                            )}
                        </Text>

                        <Text style={styles.detalj}>
                            Budžet: {formatirajBudzet(putovanje.budzet)}
                        </Text>
                    </View>

                    <View style={styles.sazetak} wrap={false}>
                        <Text style={styles.podatak}>
                            Ukupan broj predmeta: {stavke.length}
                        </Text>

                        <Text>
                            Već spakirano: {spakirano}
                        </Text>
                    </View>

                    {stavke.length === 0 ? (
                        <Text style={styles.prazno}>
                            Nema predmeta na listi pakiranja.
                        </Text>
                    ) : (
                        stavke.map((stavka) => {

                            const predmet = predmeti.find(
                                (predmet) =>
                                    predmet.sifra === stavka.predmetSifra
                            )

                            const napomena = String(
                                stavka.napomena ?? ""
                            ).trim()

                            return (
                                <View
                                    key={stavka.predmetSifra}
                                    style={styles.red}
                                >
                                    <View
                                        style={[
                                            styles.kucica,
                                            stavka.spakirano
                                                ? styles.kucicaSpakirano
                                                : {}
                                        ]}
                                    >
                                        {stavka.spakirano && (
                                            <Svg
                                                width={9}
                                                height={9}
                                                viewBox="0 0 12 12"
                                            >
                                                <Path
                                                    d="M2 6 L5 9 L10 3"
                                                    stroke="#ffffff"
                                                    strokeWidth={1.8}
                                                    fill="none"
                                                />
                                            </Svg>
                                        )}
                                    </View>

                                    <View style={styles.sadrzajPredmeta}>
                                        <Text style={styles.nazivPredmeta}>
                                            {predmet?.naziv ??
                                                `Predmet #${stavka.predmetSifra}`}
                                        </Text>

                                        {napomena && (
                                            <Text style={styles.napomena}>
                                                Napomena: {napomena}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            )
                        })
                    )}

                    <Text
                        style={styles.podnozje}
                        fixed
                        render={({ pageNumber, totalPages }) =>
                            `Stranica ${pageNumber} od ${totalPages}`
                        }
                    />
                </Page>
            </Document>
        )

        const blob = await pdf(dokument).toBlob()
        const url = URL.createObjectURL(blob)

        window.open(url, "_blank")

        setTimeout(() => URL.revokeObjectURL(url), 60000)
    }

    return generirajPDF
}

Font.register({
    family: "OpenSans",
    src: `${import.meta.env.BASE_URL}fonts/OpenSans-VariableFont_wdth,wght.ttf`
})