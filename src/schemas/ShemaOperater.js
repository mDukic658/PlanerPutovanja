import { z } from 'zod';

// Regex za validaciju lozinke: min 8 znakova, velika i mala slova, brojevi i interpunkcijski znak
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;

export const ShemaOperater = z.object({
  email: z.email({
    error: (issue) =>
      !issue.input || (typeof issue.input === 'string' && issue.input.trim() === '')
        ? "Email je obavezan!"
        : "Unesite ispravan email format!"
  }).trim(),

  lozinka: z.string()
    .min(8, "Lozinka mora imati najmanje 8 znakova!")
    .regex(passwordRegex, "Lozinka mora sadržavati: veliko slovo, malo slovo, broj i interpunkcijski znak!"),

  uloga: z.enum(['admin', 'korisnik'], {
    error: "Uloga mora biti 'admin' ili 'korisnik'!"
  })
});

// Shema za login (samo email i lozinka)
export const ShemaLogin = z.object({
  email: z.email({
    error: (issue) =>
      !issue.input || (typeof issue.input === 'string' && issue.input.trim() === '')
        ? "Email je obavezan!"
        : "Unesite ispravan email format!"
  }).trim(),

  lozinka: z.string()
    .min(8, "Lozinka mora imati najmanje 8 znakova!")
    .regex(passwordRegex, "Lozinka mora sadržavati: veliko slovo, malo slovo, broj i interpunkcijski znak!")
});

// Shema za promjenu lozinke (zahtijeva potvrdu)
export const ShemaPromjenaLozinke = z.object({
  novaLozinka: z.string()
    .min(8, "Lozinka mora imati najmanje 8 znakova!")
    .regex(passwordRegex, "Lozinka mora sadržavati: veliko slovo, malo slovo, broj i interpunkcijski znak!"),

  potvrdaLozinke: z.string()
    .min(1, "Potvrda lozinke je obavezna!")
}).refine((data) => data.novaLozinka === data.potvrdaLozinke, {
  error: "Lozinke se ne podudaraju!",
  path: ["potvrdaLozinke"]
});