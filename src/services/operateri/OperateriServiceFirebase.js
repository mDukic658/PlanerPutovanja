import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, limit } from 'firebase/firestore'
import getFirebaseDB from '../Firebase'
import { PrefixStorage } from '../../constants'
import bcrypt from 'bcryptjs'

async function get() {
    try {
        const skupOperatera = collection(
            getFirebaseDB(),
            PrefixStorage.OPERATERI
        )

        const snapshot = await getDocs(skupOperatera)

        const data = snapshot.docs.map(dokument => {
            const operater = dokument.data()

            return {
                sifra: dokument.id,
                email: operater.email,
                uloga: operater.uloga
            }
        })

        return {
            success: true,
            data
        }
    } catch (e) {
        return {
            success: false,
            message: e.message
        }
    }
}

async function getBySifra(sifra) {
    try {
        const docRef = doc(
            getFirebaseDB(),
            PrefixStorage.OPERATERI,
            sifra
        )

        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const operater = docSnap.data()

            return {
                success: true,
                data: {
                    sifra: docSnap.id,
                    email: operater.email,
                    uloga: operater.uloga
                }
            }
        }

        return {
            success: false,
            message: 'Operater nije pronađen.'
        }
    } catch (e) {
        return {
            success: false,
            message: e.message
        }
    }
}

async function dodaj(operater) {
    try {
        const noviOperater = {
            email: operater.email,
            uloga: operater.uloga,
            lozinka: bcrypt.hashSync(operater.lozinka, 10)
        }

        const skupOperatera = collection(
            getFirebaseDB(),
            PrefixStorage.OPERATERI
        )

        const docRef = await addDoc(
            skupOperatera,
            noviOperater
        )

        return {
            success: true,
            data: {
                sifra: docRef.id,
                email: operater.email,
                uloga: operater.uloga
            }
        }
    } catch (e) {
        return {
            success: false,
            message: e.message
        }
    }
}

async function dodajBezHash(operater) {
    try {
        const noviOperater = {
            email: operater.email,
            uloga: operater.uloga,
            lozinka: operater.lozinka
        }

        const skupOperatera = collection(
            getFirebaseDB(),
            PrefixStorage.OPERATERI
        )

        const docRef = await addDoc(
            skupOperatera,
            noviOperater
        )

        return {
            success: true,
            data: {
                sifra: docRef.id,
                email: operater.email,
                uloga: operater.uloga
            }
        }
    } catch (e) {
        return {
            success: false,
            message: e.message
        }
    }
}

async function promjeni(sifra, operater) {
    try {
        const docRef = doc(
            getFirebaseDB(),
            PrefixStorage.OPERATERI,
            sifra
        )

        await updateDoc(docRef, {
            email: operater.email,
            uloga: operater.uloga
        })

        return {
            success: true
        }
    } catch (e) {
        return {
            success: false,
            message: e.message
        }
    }
}

async function promjeniLozinku(sifra, novaLozinka) {
    try {
        const hashiranaLozinka = bcrypt.hashSync(
            novaLozinka,
            10
        )

        const docRef = doc(
            getFirebaseDB(),
            PrefixStorage.OPERATERI,
            sifra
        )

        await updateDoc(docRef, {
            lozinka: hashiranaLozinka
        })

        return {
            success: true,
            message: 'Lozinka uspješno promijenjena.'
        }
    } catch (e) {
        return {
            success: false,
            message: e.message
        }
    }
}

async function obrisi(sifra) {
    try {
        const docRef = doc(
            getFirebaseDB(),
            PrefixStorage.OPERATERI,
            sifra
        )

        await deleteDoc(docRef)

        return {
            success: true,
            message: 'Operater obrisan.'
        }
    } catch (e) {
        return {
            success: false,
            message: e.message
        }
    }
}

async function prijava(email, lozinka) {
    try {
        const skupOperatera = collection(
            getFirebaseDB(),
            PrefixStorage.OPERATERI
        )

        const upit = query(
            skupOperatera,
            where('email', '==', email.trim()),
            limit(1)
        )

        const snapshot = await getDocs(upit)

        if (snapshot.empty) {
            return {
                success: false,
                message: 'Email i lozinka ne odgovaraju.'
            }
        }

        const dokument = snapshot.docs[0]
        const operater = dokument.data()

        const odgovara = bcrypt.compareSync(
            lozinka,
            operater.lozinka
        )

        if (!odgovara) {
            return {
                success: false,
                message: 'Email i lozinka ne odgovaraju.'
            }
        }

        return {
            success: true,
            data: {
                sifra: dokument.id,
                email: operater.email,
                uloga: operater.uloga
            }
        }
    } catch (e) {
        return {
            success: false,
            message: 'Greška kod prijave: ' + e.message
        }
    }
}

export default {
    get,
    getBySifra,
    dodaj,
    dodajBezHash,
    promjeni,
    promjeniLozinku,
    obrisi,
    prijava
}