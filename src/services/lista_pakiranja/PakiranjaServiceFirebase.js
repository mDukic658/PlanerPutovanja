import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import getFirebaseDB from '../Firebase'
import { PrefixStorage } from '../../constants'

async function get() {
    try {
        const skupPakiranja = collection(
            getFirebaseDB(),
            PrefixStorage.PAKIRANJA
        )

        const snapshot = await getDocs(skupPakiranja)

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

async function getByPutovanje(sifraPutovanja) {
    try {
        const skupPakiranja = collection(
            getFirebaseDB(),
            PrefixStorage.PAKIRANJA
        )

        const upit = query(
            skupPakiranja,
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

async function pronadiStavku(predmetSifra, putovanjeSifra) {
    const skupPakiranja = collection(
        getFirebaseDB(),
        PrefixStorage.PAKIRANJA
    )

    const upit = query(
        skupPakiranja,
        where('predmetSifra', '==', predmetSifra),
        where('putovanjeSifra', '==', putovanjeSifra)
    )

    return await getDocs(upit)
}

async function dodaj(pakiranje) {
    try {
        const snapshot = await pronadiStavku(
            pakiranje.predmetSifra,
            pakiranje.putovanjeSifra
        )

        if (!snapshot.empty) {
            return {
                success: false,
                message: 'Ovaj predmet već postoji na listi pakiranja ovog putovanja.'
            }
        }

        const skupPakiranja = collection(
            getFirebaseDB(),
            PrefixStorage.PAKIRANJA
        )

        const docRef = await addDoc(skupPakiranja, pakiranje)

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

async function promijeni(predmetSifra, putovanjeSifra, pakiranje) {
    try {
        const snapshot = await pronadiStavku(
            predmetSifra,
            putovanjeSifra
        )

        if (snapshot.empty) {
            return {
                success: false,
                message: 'Stavka pakiranja nije pronađena.'
            }
        }

        const docRef = doc(
            getFirebaseDB(),
            PrefixStorage.PAKIRANJA,
            snapshot.docs[0].id
        )

        await updateDoc(docRef, {
            ...pakiranje,
            predmetSifra,
            putovanjeSifra
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

async function obrisi(predmetSifra, putovanjeSifra) {
    try {
        const snapshot = await pronadiStavku(
            predmetSifra,
            putovanjeSifra
        )

        if (snapshot.empty) {
            return {
                success: false,
                message: 'Stavka pakiranja nije pronađena.'
            }
        }

        const docRef = doc(
            getFirebaseDB(),
            PrefixStorage.PAKIRANJA,
            snapshot.docs[0].id
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
    getByPutovanje,
    dodaj,
    promijeni,
    obrisi
}