import { PieChart, Pie, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card } from "react-bootstrap";

const boje = [
    "#1ca9c9",
    "#ff8243",
    "#556b2f",
    "#c8553d",
    "#8064a2",
    "#b8860b",
    "#607d8b"
]

function formatirajIznos(iznos) {
    return new Intl.NumberFormat("hr-HR", {
        style: "currency",
        currency: "EUR"
    }).format(iznos)
}

export default function BudzetGrafikon({ troskovi }) {
    const iznosiPoKategorijama = troskovi.reduce(
        (kategorije, trosak) => {
            const kategorija = trosak.kategorija || "Ostalo"
            const iznosCenti = Math.round(Number(trosak.iznos) * 100)

            if (!Number.isFinite(iznosCenti) || iznosCenti <= 0) {
                return kategorije
            }

            kategorije.set(
                kategorija,
                (kategorije.get(kategorija) || 0) + iznosCenti
            )

            return kategorije
        },
        new Map()
    )

    const podaci = Array.from(
        iznosiPoKategorijama,
        ([naziv, centi], index) => ({
            naziv,
            iznos: centi / 100,
            fill: boje[index % boje.length]
        })
    )

    const ukupnoCenti = Array.from(
        iznosiPoKategorijama.values()
    ).reduce((ukupno, centi) => ukupno + centi, 0)

    return (
        <Card className="mb-4">
            <Card.Body>
                <h3 className="h4 mb-3">
                    Potrošnja po kategorijama
                </h3>

                {podaci.length === 0 ? (
                    <p className="text-muted mb-0">
                        Dodaj troškove za prikaz grafikona.
                    </p>
                ) : (
                    <>
                        <div
                            role="img"
                            aria-label="Prstenasti grafikon potrošnje po kategorijama. Iznosi i postoci navedeni su ispod."
                        >
                            <ResponsiveContainer
                                width="100%"
                                height={340}
                            >
                                <PieChart>
                                    <Pie
                                        data={podaci}
                                        dataKey="iznos"
                                        nameKey="naziv"
                                        innerRadius="50%"
                                        outerRadius="75%"
                                        paddingAngle={2}
                                    />

                                    <Tooltip
                                        formatter={(vrijednost, naziv) => [
                                            formatirajIznos(
                                                Number(vrijednost)
                                            ),
                                            naziv
                                        ]}
                                    />

                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <ul className="list-unstyled mb-0 mt-3">
                            {podaci.map(stavka => {
                                const postotak =
                                    (stavka.iznos * 100 / ukupnoCenti) * 100

                                return (
                                    <li
                                        key={stavka.naziv}
                                        className="d-flex flex-wrap justify-content-between gap-2 border-top py-2"
                                    >
                                        <span>{stavka.naziv}</span>

                                        <strong>
                                            {formatirajIznos(stavka.iznos)}
                                            {" "}
                                            ({postotak.toLocaleString(
                                                "hr-HR",
                                                {
                                                    maximumFractionDigits: 1
                                                }
                                            )}%)
                                        </strong>
                                    </li>
                                )
                            })}
                        </ul>
                    </>
                )}
            </Card.Body>
        </Card>
    )
}