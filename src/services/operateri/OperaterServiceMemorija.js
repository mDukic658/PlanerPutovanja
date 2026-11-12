import { operateri } from "./OperaterPodaci"
import bcrypt from 'bcryptjs'

// 1/4 Read od CRUD
async function get(){
    // Ne vraćamo lozinke u listi
    const operateriBezcLozinki = operateri.map(op => ({
        sifra: op.sifra,
        email: op.email,
        uloga: op.uloga
    }))
    return {success: true, data: [...operateriBezcLozinki]}
}

async function getBySifra(sifra) {
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

// 2/4 Create od CRUD
async function dodaj(operater){
    if(operateri.length===0){
        operater.sifra='1'
    }else{
        operater.sifra = String(parseInt(operateri[operateri.length - 1].sifra) + 1)
    }
    
    // Hashiraj lozinku prije spremanja
    operater.lozinka = bcrypt.hashSync(operater.lozinka, 10)
    
    operateri.push(operater)
    return {success: true, data: {sifra: operater.sifra, email: operater.email}}
}

// 3/4 Update od CRUD
async function promjeni(sifra, operater) {
    const index = nadiIndex(sifra)
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
    
    return {success: true, data: {sifra: operateri[index].sifra, email: operateri[index].email, uloga: operateri[index].uloga}}
}

// Posebna funkcija za promjenu lozinke
async function promjeniLozinku(sifra, novaLozinka) {
    const index = nadiIndex(sifra)
    if (index === -1) {
        return {success: false, message: "Operater nije pronađen"}
    }
    
    // Hashiraj novu lozinku
    operateri[index].lozinka = bcrypt.hashSync(novaLozinka, 10)
    
    return {success: true, message: "Lozinka uspješno promijenjena"}
}

function nadiIndex(sifra){
    return operateri.findIndex(o=>o.sifra === sifra)
}

// 4/4 Delete od CRUD
async function obrisi(sifra) {
    const index = nadiIndex(sifra)
    if (index > -1) {
        operateri.splice(index, 1)
        return {success: true, message: "Operater obrisan"}
    }
    return {success: false, message: "Operater nije pronađen"}
}

// Funkcija za prijavu
async function prijava(email, lozinka) {
    const operater = operateri.find(o => o.email === email)
    if (!operater) {
        return {success: false, message: "Email i lozinka ne odgovaraju"} // iako bi ovdje mogli napisati i da email ne postoji ali to onda napadačima omogućuje da zna tko je a tko nije registriran
    }
    // Provjeri lozinku pomoću bcrypt
    const isMatch = bcrypt.compareSync(lozinka, operater.lozinka)
    if (!isMatch) {
        return {success: false, message: "Email i lozinka ne odgovaraju"}
    }
    
    // Vrati operatere bez lozinke
    return {
        success: true, 
        data: {
            sifra: operater.sifra,
            email: operater.email,
            uloga: operater.uloga
        }
    }
}

export default{
    get,
    dodaj,
    getBySifra,
    promjeni,
    promjeniLozinku,
    obrisi,
    prijava
}
