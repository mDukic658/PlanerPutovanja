import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import getFirebaseDB from '../Firebase'
import { PrefixStorage } from '../../constants'

async function get() {
    try {
        const skupPosjeta = collection(
            getFirebaseDB(),
            PrefixStorage.POSJETI
        )

        const snapshot = await getDocs(skupPosjeta)

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
            PrefixStorage.POSJETI,
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
            message: 'Posjet nije pronađen.'
        }
    } catch (e) {
        return {
            success: false,
            message: e.message
        }
    }
}

async function getByDrzava(iso2) {
    try {
        const oznaka = iso2.trim().toUpperCase()

        const skupPosjeta = collection(
            getFirebaseDB(),
            PrefixStorage.POSJETI
        )

        const upit = query(
            skupPosjeta,
            where('iso2', '==', oznaka)
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

async function dodaj(posjet) {
    try {
        const noviPosjet = {
            ...posjet,
            iso2: posjet.iso2.trim().toUpperCase()
        }

        const skupPosjeta = collection(
            getFirebaseDB(),
            PrefixStorage.POSJETI
        )

        const docRef = await addDoc(skupPosjeta, noviPosjet)

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

async function promijeni(sifra, posjet) {
    try {
        const promjena = {
            ...posjet,
            iso2: posjet.iso2.trim().toUpperCase()
        }

        const docRef = doc(
            getFirebaseDB(),
            PrefixStorage.POSJETI,
            sifra
        )

        await updateDoc(docRef, promjena)

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
            PrefixStorage.POSJETI,
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
    getByDrzava,
    dodaj,
    promijeni,
    obrisi
}