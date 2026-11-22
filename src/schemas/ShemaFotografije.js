import { z } from 'zod'
import { DATA_SOURCE } from '../constants'

export const ShemaFotografija = z.object({
    naziv: z.string()
        .trim()
        .max(100, "Naziv fotografije smije imati najviše 100 znakova."),

    opis: z.string()
        .trim()
        .max(1000, "Opis smije imati najviše 1000 znakova."),

    slika: z.unknown()
        .refine(
            vrijednost => Boolean(vrijednost),
            "Odaberite sliku."
        )
})

export const ShemaNovaFotografija = ShemaFotografija.extend({
    putovanjeSifra: DATA_SOURCE === 'firebase'
        ? z.string().trim().min(1, "Odaberite putovanje.")
        : z.coerce.number()
            .int("Odaberite putovanje.")
            .positive("Odaberite putovanje.")
})