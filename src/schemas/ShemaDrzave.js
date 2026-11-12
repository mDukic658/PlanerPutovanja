import { z } from 'zod'

export const ShemaDrzava = z.object({
    naziv: z.string()
        .trim()
        .min(1, 'Naziv države je obavezan.')
})