import bcrypt from 'bcryptjs'
const STORAGE_KEY='operateri'


// Pomoćna funkcija za dohvaćanje podataka iz local storage-a
function dohvatiSveIzStorage() {
    const podaci = localStorage.getItem(STORAGE_KEY)
    return podaci ? JSON.parse(podaci) : []
}

// Pomoćna funkcija za spremanje podataka
function spremiUStorage(podaci) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(podaci))
}

// 1/4 Read - dohvati sve
async function get() {
    const operateri = dohvatiSveIzStorage()
    // Ne vraćamo lozinke u listi
    const operateriBezcLozinki = operateri.map(op => ({
        sifra: op.sifra,
        email: op.email,
        uloga: op.uloga
    }))
    return {success: true, data: [...operateriBezcLozinki]}
}

// Dohvati jedan po šifri
async function getBySifra(sifra) {
    const operateri = dohvatiSveIzStorage()
    const operater = operateri.find(o => o.sifra === sifra)
    if (!operater) {
        return {success: false, data: null}
    }
    // Ne vraćamo lozinku
    return {success: true, data: {
        sifra: operater.sifra,
        email: operater.email,
        uloga: operater.uloga
    }}
}

// 2/4 Create - dodaj novi
async function dodaj(operater) {
    const operateri = dohvatiSveIzStorage()
    
    if (operateri.length === 0) {
        operater.sifra = '1'
    } else {
        // Pronalaženje najveće šifre da izbjegnemo duplikate
        operater.sifra = String(parseInt(operateri[operateri.length - 1].sifra) + 1)
    }
    
    // Hashiraj lozinku prije spremanja
    operater.lozinka = bcrypt.hashSync(operater.lozinka, 10)
    
    operateri.push(operater)
    spremiUStorage(operateri)
    return {success: true, data: {sifra: operater.sifra, email: operater.email}}
}

// 3/4 Update - promjeni postojeći
async function promjeni(sifra, operater) {
    const operateri = dohvatiSveIzStorage()
    const index = operateri.findIndex(o => o.sifra === sifra)
    
    if (index === -1) {
        return {success: false, message: "Operater nije pronađen"}
    }
    
    // Ažuriraj email i ulogu, ne lozinku
    operateri[index] = {
        ...operateri[index],
        email: operater.email,
        uloga: operater.uloga,
        sifra: sifra
    }
    spremiUStorage(operateri)
    return {success: true, data: {sifra: operateri[index].sifra, email: operateri[index].email, uloga: operateri[index].uloga}}
}

// Posebna funkcija za promjenu lozinke
async function promjeniLozinku(sifra, novaLozinka) {
    const operateri = dohvatiSveIzStorage()
    const index = operateri.findIndex(o => o.sifra === sifra)
    
    if (index === -1) {
        return {success: false, message: "Operater nije pronađen"}
    }
    
    // Hashiraj novu lozinku
    operateri[index].lozinka = bcrypt.hashSync(novaLozinka, 10)
    spremiUStorage(operateri)
    
    return {success: true, message: "Lozinka uspješno promijenjena"}
}

// 4/4 Delete - obriši
async function obrisi(sifra) {
    let operateri = dohvatiSveIzStorage()
    const initialLength = operateri.length
    operateri = operateri.filter(o => o.sifra !== sifra)
    
    if (operateri.length === initialLength) {
        return {success: false, message: "Operater nije pronađen"}
    }
    
    spremiUStorage(operateri)
    return {success: true, message: 'Operater obrisan'}
}

// Funkcija za prijavu
async function prijava(email, lozinka) {
    const operateri = dohvatiSveIzStorage()
    const operater = operateri.find(o => o.email === email)
    if (!operater) {
        return {success: false, message: "Email i lozinka ne odgovaraju"} // iako bi ovdje mogli napisati i da email ne postoji ali to onda napadačima omogućuje da zna tko je a tko nije registriran
    }
    
    // Provjeri lozinku pomoću bcrypt
    const isMatch = bcrypt.compareSync(lozinka, operater.lozinka)
    if (!isMatch) {
        return {success: false, message: "Email i lozinka ne odgovaraju"}
    }
    
    // Vrati operatera bez lozinke
    return {
        success: true, 
        data: {
            sifra: operater.sifra,
            email: operater.email,
            uloga: operater.uloga
        }
    }
}

export default {
    get,
    dodaj,
    getBySifra,
    promjeni,
    promjeniLozinku,
    obrisi,
    prijava
}