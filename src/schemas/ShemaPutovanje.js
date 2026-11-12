import { z } from 'zod'

const datum = z.string().min(1, 'Morate odabrati datum.').refine((vrijednost) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(vrijednost)) return false

    const parsed = new Date(`${vrijednost}T00:00:00Z`)

    return !Number.isNaN(parsed.getTime())
        && parsed.toISOString().slice(0, 10) === vrijednost
}, 'Datum nije ispravan.')

export const ShemaPutovanje = z.object({
    naziv: z.string()
        .trim()
        .min(3, 'Naziv mora imati najmanje 3 znaka.')
        .max(50, 'Naziv može imati najviše 50 znakova.'),

    destinacija: z.string()
        .trim()
        .min(2, 'Destinacija mora imati najmanje 2 znaka.')
        .max(50, 'Destinacija može imati najviše 50 znakova.'),

    drzava: z.string()
        .trim()
        .min(1, 'Morate odabrati državu.'),

    datumPolaska: datum,

    datumPovratka: datum,

    budzet: z.string()
        .trim()
        .min(1, 'Budžet je obavezan.')
        .transform(Number)
        .pipe(
            z.number()
                .min(0, 'Budžet ne može biti negativan.')
                .max(100000, 'Budžet ne može biti veći od 100000 €.')
        )
}).refine(
    (podaci) => podaci.datumPovratka >= podaci.datumPolaska,
    {
        message: 'Datum povratka ne može biti prije datuma polaska.',
        path: ['datumPovratka']
    }
)

export const ShemaNovoPutovanje = ShemaPutovanje.refine(
    (podaci) => {
        const danas = new Date()
        const godina = danas.getFullYear()
        const mjesec = String(danas.getMonth() + 1).padStart(2, '0')
        const dan = String(danas.getDate()).padStart(2, '0')

        return podaci.datumPolaska >= `${godina}-${mjesec}-${dan}`
    },
    {
        message: 'Datum polaska ne može biti u prošlosti.',
        path: ['datumPolaska']
    }
)