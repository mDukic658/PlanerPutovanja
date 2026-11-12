import bcrypt from 'bcryptjs'

// Inicijalni operateri s hashiranim lozinkama
// Lozinka za sve: "PlanerPutovanja123!"
const hashiranaLozinka = bcrypt.hashSync('PlanerPutovanja123!', 10)

export const operateri = [
    {
        sifra: '1',
        email: 'admin@planerputovanja.hr',
        lozinka: hashiranaLozinka,
        uloga: 'admin'
    },
    {
        sifra: '2',
        email: 'korisnik@planerputovanja.hr',
        lozinka: hashiranaLozinka,
        uloga: 'korisnik'
    }
]

export default{
    operateri
}