import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import getFirebaseDB from '../Firebase'
import { PrefixStorage } from '../../constants'

async function get() {
    try {
        const skupAktivnosti = collection(
            getFirebaseDB(),
            PrefixStorage.ITINERAR
        )

        const snapshot = await getDocs(skupAktivnosti)

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
            PrefixStorage.ITINERAR,
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
            message: 'Aktivnost nije pronađena.'
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
        const skupAktivnosti = collection(
            getFirebaseDB(),
            PrefixStorage.ITINERAR
        )

        const upit = query(
            skupAktivnosti,
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

async function dodaj(aktivnost) {
    try {
        const skupAktivnosti = collection(
            getFirebaseDB(),
            PrefixStorage.ITINERAR
        )

        const docRef = await addDoc(
            skupAktivnosti,
            aktivnost
        )

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

async function promijeni(sifra, aktivnost) {
    try {
        const docRef = doc(
            getFirebaseDB(),
            PrefixStorage.ITINERAR,
            sifra
        )

        await updateDoc(docRef, aktivnost)

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
            PrefixStorage.ITINERAR,
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

export default {
    get,
    getBySifra,
    getByPutovanje,
    dodaj,
    promijeni,
    obrisi
}