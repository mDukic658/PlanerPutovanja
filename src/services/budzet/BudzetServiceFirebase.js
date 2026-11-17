import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import getFirebaseDB from '../Firebase'
import { PrefixStorage } from '../../constants'

async function get() {
    try {
        const skupTroskova = collection(
            getFirebaseDB(),
            PrefixStorage.BUDZET
        )

        const snapshot = await getDocs(skupTroskova)

        const data = snapshot.docs.map(dokument => ({
            ...dokument.data(),
            sifra: dokument.id
        }))

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
            PrefixStorage.BUDZET,
            sifra
        )

        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            return {
                success: true,
                data: {
                    ...docSnap.data(),
                    sifra: docSnap.id
                }
            }
        }

        return {
            success: false,
            message: 'Trošak nije pronađen.'
        }
    } catch (e) {
        return {
            success: false,
            message: e.message
        }
    }
}

async function getByPutovanje(sifraPutovanja) {
    try {
        const skupTroskova = collection(
            getFirebaseDB(),
            PrefixStorage.BUDZET
        )

        const upit = query(
            skupTroskova,
            where('putovanjeSifra', '==', sifraPutovanja)
        )

        const snapshot = await getDocs(upit)

        const data = snapshot.docs.map(dokument => ({
            ...dokument.data(),
            sifra: dokument.id
        }))

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

async function dodaj(trosak) {
    try {
        const skupTroskova = collection(
            getFirebaseDB(),
            PrefixStorage.BUDZET
        )

        const docRef = await addDoc(skupTroskova, trosak)

        return {
            success: true,
            id: docRef.id
        }
    } catch (e) {
        return {
            success: false,
            message: e.message
        }
    }
}

async function promijeni(sifra, trosak) {
    try {
        const docRef = doc(
            getFirebaseDB(),
            PrefixStorage.BUDZET,
            sifra
        )

        await updateDoc(docRef, trosak)

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

async function obrisi(sifra) {
    try {
        const docRef = doc(
            getFirebaseDB(),
            PrefixStorage.BUDZET,
            sifra
        )

        await deleteDoc(docRef)

        return {
            success: true,
            message: 'Uspješno obrisano.'
        }
    } catch (e) {
        return {
            success: false,
            message: e.message
        }
    }
}

async function dohvatiStranicu(
    stranica = 1,
    velicinaStranice = 6,
    sifraPutovanja = null
) {
    try {
        const odgovor = sifraPutovanja === null
            ? await get()
            : await getByPutovanje(sifraPutovanja)

        if (!odgovor.success) {
            return odgovor
        }

        const troskovi = odgovor.data

        const ukupnoStavki = troskovi.length
        const ukupnoStranica = Math.ceil(
            ukupnoStavki / velicinaStranice
        )

        const pocetniIndeks = (stranica - 1) * velicinaStranice

        return {
            success: true,
            data: troskovi.slice(
                pocetniIndeks,
                pocetniIndeks + velicinaStranice
            ),
            ukupnoStavki,
            ukupnoStranica
        }
    } catch (e) {
        return {
            success: false,
            message: e.message
        }
    }
}

export default {
    get,
    getBySifra,
    getByPutovanje,
    dodaj,
    promijeni,
    obrisi,
    dohvatiStranicu
}