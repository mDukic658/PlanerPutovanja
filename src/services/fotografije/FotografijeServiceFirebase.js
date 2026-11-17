import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import getFirebaseDB from '../Firebase'
import { PrefixStorage } from '../../constants'

async function get() {
    try {
        const skupFotografija = collection(
            getFirebaseDB(),
            PrefixStorage.FOTOGRAFIJE
        )

        const snapshot = await getDocs(skupFotografija)

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
            PrefixStorage.FOTOGRAFIJE,
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
            message: 'Fotografija nije pronađena.'
        }
    } catch (e) {
        return {
            success: false,
            message: e.message
        }
    }
}

async function getByPutovanje(putovanjeSifra) {
    try {
        const skupFotografija = collection(
            getFirebaseDB(),
            PrefixStorage.FOTOGRAFIJE
        )

        const upit = query(
            skupFotografija,
            where('putovanjeSifra', '==', putovanjeSifra)
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

async function dodaj(fotografija) {
    try {
        const skupFotografija = collection(
            getFirebaseDB(),
            PrefixStorage.FOTOGRAFIJE
        )

        const docRef = await addDoc(
            skupFotografija,
            fotografija
        )

        return {
            success: true,
            data: {
                ...fotografija,
                sifra: docRef.id
            }
        }
    } catch (e) {
        return {
            success: false,
            message: e.message
        }
    }
}

async function dodajVise(stavke) {
    const dodaneFotografije = []

    for (const fotografija of stavke) {
        const odgovor = await dodaj(fotografija)

        if (!odgovor.success) {
            return {
                success: false,
                data: dodaneFotografije,
                message: `Dodavanje je prekinuto. Spremljeno je ${dodaneFotografije.length} fotografija. ${odgovor.message}`
            }
        }

        dodaneFotografije.push(odgovor.data)
    }

    return {
        success: true,
        data: dodaneFotografije
    }
}

async function promijeni(sifra, fotografija) {
    try {
        const docRef = doc(
            getFirebaseDB(),
            PrefixStorage.FOTOGRAFIJE,
            sifra
        )

        await updateDoc(docRef, fotografija)

        return {
            success: true,
            data: {
                ...fotografija,
                sifra
            }
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
            PrefixStorage.FOTOGRAFIJE,
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
    dodajVise,
    promijeni,
    obrisi
}