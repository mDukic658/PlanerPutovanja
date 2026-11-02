import { Document, Page, Text, View, StyleSheet, Font, pdf } from "@react-pdf/renderer";

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
            paddingBottom: 12,
            marginBottom: 20
        },
        aplikacija: {
            fontSize: 22,
            color: "#1ca9c9",
            marginBottom: 6
        },
        naslov: {
            fontSize: 16,
            marginBottom: 6
        },
        putovanje: {
            fontSize: 13
        },
        sazetak: {
            backgroundColor: "#faf5e8",
            padding: 12,
            marginBottom: 20
        },
        podatak: {
            marginBottom: 4
        },
        red: {
            flexDirection: "row",
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: "#e5e7eb",
            paddingVertical: 10
        },
        kucica: {
            width: 12,
            height: 12,
            borderWidth: 1,
            borderColor: "#1f2937",
            marginRight: 12
        },
        nazivPredmeta: {
            flex: 1
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

    const generirajPDF = async () => {

        const stavke = pakiranja.filter(
            (pakiranje) => pakiranje.putovanjeSifra === putovanje.sifra
        )

        const spakirano = stavke.filter(
            (stavka) => stavka.spakirano
        ).length

        const dokument = (
            <Document
                title={`Lista pakiranja - ${putovanje.naziv}`}
                author="Planer Putovanja"
            >

                <Page size="A4" style={styles.stranica}>

                    <View style={styles.zaglavlje}>
                        <Text style={styles.aplikacija}>
                            Planer Putovanja
                        </Text>

                        <Text style={styles.naslov}>
                            Lista pakiranja
                        </Text>

                        <Text style={styles.putovanje}>
                            {putovanje.naziv}
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

                            return (
                                <View
                                    key={stavka.predmetSifra}
                                    style={styles.red}
                                    wrap={false}
                                >
                                    <View style={styles.kucica} />

                                    <Text style={styles.nazivPredmeta}>
                                        {predmet?.naziv ??
                                            `Predmet #${stavka.predmetSifra}`}
                                    </Text>
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