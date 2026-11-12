import { z } from 'zod'
import { kategorije } from '../services/budzet/BudzetKategorije'

export const ShemaBudzet = z.object({
    naziv: z.string()
        .trim()
        .min(1, "Unesi naziv troška.")
        .max(100, "Naziv troška smije imati najviše 100 znakova."),

    iznos: z.string()
        .trim()
        .refine((vrijednost) => {
            const broj = Number(vrijednost.replace(",", "."))

            return (
                /^\d+(?:[.,]\d{1,2})?$/.test(vrijednost) &&
                Number.isFinite(broj) &&
                broj > 0 &&
                Number.isSafeInteger(Math.round(broj * 100))
            )
        }, "Unesi iznos veći od nule, s najviše dvije decimale.")
        .transform(vrijednost =>
            Math.round(Number(vrijednost.replace(",", ".")) * 100) / 100
        ),

    kategorija: z.string()
        .refine(
            vrijednost => kategorije.includes(vrijednost),
            "Odaberi kategoriju troška."
        ),

    datum: z.string()
        .refine((vrijednost) => {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(vrijednost)) {
                return false
            }

            const datum = new Date(`${vrijednost}T00:00:00Z`)

            return (
                Number.isFinite(datum.getTime()) &&
                datum.toISOString().substring(0, 10) === vrijednost
            )
        }, "Unesi valjan datum troška."),

    napomena: z.string()
        .trim()
        .max(1000, "Napomena smije imati najviše 1000 znakova.")
})