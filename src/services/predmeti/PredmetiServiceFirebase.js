import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import getFirebaseDB from '../Firebase'
import { PrefixStorage } from '../../constants'

async function get() {
    try {
        const skupPredmeta = collection(
            getFirebaseDB(),
            PrefixStorage.PREDMETI
        )

        const snapshot = await getDocs(skupPredmeta)

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
            PrefixStorage.PREDMETI,
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
            message: 'Predmet nije pronađen.'
        }
    } catch (e) {
        return {
            success: false,
            message: e.message
        }
    }
}

async function dodaj(predmet) {
    try {
        const skupPredmeta = collection(
            getFirebaseDB(),
            PrefixStorage.PREDMETI
        )

        const docRef = await addDoc(skupPredmeta, predmet)

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

async function promijeni(sifra, predmet) {
    try {
        const docRef = doc(
            getFirebaseDB(),
            PrefixStorage.PREDMETI,
            sifra
        )

        await updateDoc(docRef, predmet)

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
            PrefixStorage.PREDMETI,
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
    velicinaStranice = 8,
    uvjetPretrazivanja = ''
) {
    try {
        const odgovor = await get()

        if (!odgovor.success) {
            return odgovor
        }

        let predmeti = odgovor.data

        const uvjet = uvjetPretrazivanja.trim().toLowerCase()

        if (uvjet !== '') {
            predmeti = predmeti.filter(predmet =>
                (predmet.naziv || '').toLowerCase().includes(uvjet)
            )
        }

        const ukupnoStavki = predmeti.length
        const ukupnoStranica = Math.ceil(
            ukupnoStavki / velicinaStranice
        )

        const pocetniIndeks = (stranica - 1) * velicinaStranice

        return {
            success: true,
            data: predmeti.slice(
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
    dodaj,
    promijeni,
    obrisi,
    dohvatiStranicu
}