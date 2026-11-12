import { z } from 'zod'

export const ShemaPosjet = z.object({
    drzava: z.string()
        .trim()
        .min(2, "Naziv države mora imati između 2 i 100 znakova.")
        .max(100, "Naziv države mora imati između 2 i 100 znakova."),

    iso2: z.string()
        .trim()
        .toUpperCase()
        .regex(
            /^[A-Z]{2}$/,
            "Odaberi državu koja ima valjanu dvoslovnu oznaku."
        ),

    grad: z.string()
        .trim()
        .min(2, "Naziv mjesta mora imati između 2 i 100 znakova.")
        .max(100, "Naziv mjesta mora imati između 2 i 100 znakova."),

    datumPosjeta: z.string()
        .refine((vrijednost) => {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(vrijednost)) {
                return false
            }

            const datum = new Date(`${vrijednost}T00:00:00Z`)

            return (
                Number.isFinite(datum.getTime()) &&
                datum.toISOString().substring(0, 10) === vrijednost
            )
        }, "Unesi valjan datum posjeta."),

    napomena: z.string()
        .trim()
        .max(1000, "Napomena smije imati najviše 1000 znakova."),

    lat: z.number({
        error: "Odaberi lokaciju na karti."
    })
        .min(-90, "Odaberi lokaciju na karti.")
        .max(90, "Odaberi lokaciju na karti."),

    lng: z.number({
        error: "Odaberi lokaciju na karti."
    })
        .min(-180, "Odaberi lokaciju na karti.")
        .max(180, "Odaberi lokaciju na karti.")
})