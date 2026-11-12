import { z } from 'zod'

export const ShemaPredmet = z.object({
    naziv: z.string()
        .trim()
        .min(1, "Unesi naziv predmeta.")
})