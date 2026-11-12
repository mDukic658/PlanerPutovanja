import { z } from 'zod'

export function kreirajShemuItinerara(maksimalniDan) {
    return z.object({
        putovanjeSifra: z.coerce.number()
            .int('Putovanje nije ispravno.')
            .positive('Morate odabrati putovanje.'),

        dan: z.coerce.number()
            .int('Dan mora biti cijeli broj.')
            .min(1, 'Dan mora biti najmanje 1.')
            .max(
                maksimalniDan,
                `Dan mora biti između 1 i ${maksimalniDan}.`
            ),

        vrijeme: z.string()
            .regex(
                /^([01]\d|2[0-3]):[0-5]\d$/,
                'Odaberi ispravno vrijeme aktivnosti.'
            ),

        naziv: z.string()
            .trim()
            .min(1, 'Unesi naziv aktivnosti.'),

        biljeska: z.string().optional().default('')
    })
}