import {
    Document, Packer, Paragraph, TextRun,
    HeadingLevel, Table, TableRow, TableCell,
    WidthType, BorderStyle, ShadingType
} from "docx";
import { saveAs } from "file-saver";

export async function generirajItinerarWord(
    putovanje,
    aktivnosti = []
) {
    if (!putovanje?.sifra) {
        throw new Error("Nije odabrano putovanje za izvoz")
    }

    const stavke = aktivnosti
        .filter(
            aktivnost =>
                Number(aktivnost.putovanjeSifra) ===
                Number(putovanje.sifra)
        )
        .sort(
            (a, b) =>
                Number(a.dan) - Number(b.dan) ||
                String(a.vrijeme ?? "").localeCompare(
                    String(b.vrijeme ?? "")
                )
        )

    const lokacija = [
        putovanje.destinacija,
        putovanje.drzava
    ].filter(Boolean).join(",")

    const sadrzaj = [
        new Paragraph({
            children: [
                new TextRun({
                    text: "Planer Putovanja",
                    bold: true,
                    size: 36,
                    color: "1CA9C9"
                })
            ],
            spacing: {
                after: 200
            }
        }),

        new Paragraph({
            text: "Itinerar",
            heading: HeadingLevel.HEADING_1,
            spacing: {
                after: 200
            }
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: putovanje.naziv,
                    bold: true,
                    size: 28,
                    color: "1F2937"
                })
            ],
            spacing: {
                after: 180
            }
        }),

        new Paragraph({
            text: `Destinacija: ${lokacija}`,
            spacing: {
                after: 100
            }
        }),

        new Paragraph({
            text:
                `Termin: ${formatirajDatum(putovanje.datumPolaska)}` +
                `- ${formatirajDatum(putovanje.datumPovratka)}`,
            spacing: {
                after: 100
            }
        }),

        new Paragraph({
            text: `Budžet: ${formatirajBudzet(putovanje.budzet)}`,
            spacing: {
                after: 200
            }
        }),

        new Paragraph({
            children: [
                new TextRun({
                    text: `Ukupno aktivnosti: ${stavke.length}`,
                    bold: true,
                    size: 22
                })
            ],
            spacing: {
                before: 100,
                after: 250
            }
        })
    ]

    if (stavke.length === 0) {
        sadrzaj.push(
            new Paragraph({
                text: "Još nema aktivnosti za ovo putovanje."
            })
        )
    } else {
        const dani = [
            ...new Set(
                stavke.map(stavka => Number(stavka.dan))
            )
        ]

        dani.forEach(dan => {
            const aktivnostiDana = stavke.filter(
                stavka => Number(stavka.dan) === dan
            )

            sadrzaj.push(
                new Paragraph({
                    text: `Dan ${dan}`,
                    heading: HeadingLevel.HEADING_2,
                    keepNext: true,
                    spacing: {
                        before: 300,
                        after: 180
                    }
                }),

                new Table({
                    width: {
                        size: 100,
                        type: WidthType.PERCENTAGE
                    },
                    rows: [
                        stvoriZaglavljeTablice(),

                        ...aktivnostiDana.map(aktivnost =>
                            stvoriRedakTablice(
                                aktivnost.vrijeme || "—",
                                aktivnost.naziv || "—",
                                aktivnost.biljeska || "—"
                            )
                        )
                    ]
                })
            )
        })

    }

    const dokument = new Document({
        creator: "Planer Putovanja",
        title: `Itinerar - ${putovanje.naziv || "Putovanje"}`,

        styles: {
            default: {
                document: {
                    run: {
                        font: "Calibri",
                        size: 22,
                        color: "1F2937"
                    }
                }
            }
        },

        sections: [
            {
                properties: {},
                children: sadrzaj
            }
        ]
    })

    const nazivDatoteke = String(
        putovanje.naziv || "Putovanje"
    )
        .replace(/[<>:"/\\|?*]/g, "_")
        .slice(0, 100)

    const blob = await Packer.toBlob(dokument)

    saveAs(blob, `Itinerar_${nazivDatoteke}.docx`)
}

function formatirajDatum(vrijednost) {
    if (!vrijednost) {
        return "Nije navedeno"
    }

    const [godina, mjesec, dan] = String(vrijednost)
        .slice(0, 10)
        .split("-")

    if (!godina || !mjesec || !dan) {
        return "Nije navedeno"
    }

    return `${Number(dan)}.${Number(mjesec)}. ${godina}.`
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

    if (!Number.isFinite(iznos)) {
        return "Nije naveden"
    }

    return new Intl.NumberFormat("hr-HR", {
        style: "currency",
        currency: "EUR"
    }).format(iznos)
}

function stvoriZaglavljeTablice() {
    return new TableRow({
        tableHeader: true,
        children: [
            stvoriCeliju("Vrijeme", 15, true),
            stvoriCeliju("Aktivnost", 35, true),
            stvoriCeliju("Bilješka", 50, true)
        ]
    })
}

function stvoriRedakTablice(vrijeme, naziv, biljeska) {
    return new TableRow({
        children: [
            stvoriCeliju(vrijeme, 15),
            stvoriCeliju(naziv, 35),
            stvoriCeliju(biljeska, 50)
        ]
    })
}

function stvoriCeliju(vrijednost, sirina, zaglavlje = false) {
    const obrub = {
        style: BorderStyle.SINGLE,
        size: 1,
        color: "CBD5E1"
    }

    const redovi = String(vrijednost ?? "").split(/\r?\n/)

    return new TableCell({
        width: {
            size: sirina,
            type: WidthType.PERCENTAGE
        },

        ...(zaglavlje && {
            shading: {
                fill: "1F2937",
                type: ShadingType.CLEAR,
                color: "auto"
            }
        }),

        margins: {
            top: 140,
            bottom: 140,
            left: 180,
            right: 180
        },

        borders: {
            top: obrub,
            bottom: obrub,
            left: obrub,
            right: obrub
        },

        children: [
            new Paragraph({
                children: redovi.map((red, index) =>
                    new TextRun({
                        text: red,

                        ...(index > 0 && {
                            break: 1
                        }),

                        bold: zaglavlje,
                        size: 22,
                        color: zaglavlje ? "FFFFFF" : "1F2937"
                    })
                ),

                spacing: {
                    before: 80,
                    after: 80
                }
            })
        ]
    })
}