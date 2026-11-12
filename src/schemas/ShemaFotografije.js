import { z } from 'zod'

export const ShemaFotografija = z.object({
    naziv: z.string()
        .trim()
        .min(1, "Unesi naziv fotografije.")
        .max(100, "Naziv fotografije smije imati najviše 100 znakova."),

    opis: z.string()
        .trim()
        .max(1000, "Opis smije imati najviše 1000 znakova."),

    slika: z.unknown()
        .refine(
            vrijednost => Boolean(vrijednost),
            "Odaberite sliku i kliknite Primijeni."
        )
})

export const ShemaNovaFotografija = ShemaFotografija.extend({
    putovanjeSifra: z.coerce.number()
        .int("Odaberite putovanje.")
        .positive("Odaberite putovanje.")
})