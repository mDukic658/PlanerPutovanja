import { z } from 'zod'

export const ShemaPakiranje = z.object({
    predmetSifra: z.coerce.number()
        .int('Predmet nije ispravan.')
        .positive('Morate odabrati predmet.'),

    putovanjeSifra: z.coerce.number()
        .int('Putovanje nije ispravno.')
        .positive('Morate odabrati putovanje.'),

    spakirano: z.boolean(),

    napomena: z.string()
        .trim()
        .optional()
        .default('')
})