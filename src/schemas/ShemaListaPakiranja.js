import { z } from 'zod'
import { DATA_SOURCE } from '../constants'

export const ShemaPakiranje = z.object({
    predmetSifra: DATA_SOURCE === 'firebase'
        ? z.string().trim().min(1, 'Morate odabrati predmet.')
        : z.coerce.number()
            .int('Predmet nije ispravan.')
            .positive('Morate odabrati predmet.'),

    putovanjeSifra: DATA_SOURCE === 'firebase'
        ? z.string().trim().min(1, 'Morate odabrati putovanje.')
        : z.coerce.number()
            .int('Putovanje nije ispravno.')
            .positive('Morate odabrati putovanje.'),

    spakirano: z.boolean(),

    napomena: z.string()
        .trim()
        .optional()
        .default('')
})