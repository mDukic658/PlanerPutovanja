import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore'
import getFirebaseDB from '../Firebase'
import { PrefixStorage } from '../../constants'
import ItinerarServiceFirebase from '../itinerar/ItinerarServiceFirebase'
import { provjeriTrajanjePutovanja } from '../../utils/provjeriTrajanjePutovanja'

async function get() {
    try {
        const skupPutovanja = collection(
            getFirebaseDB(),
            PrefixStorage.PUTOVANJA
        )

        const snapshot = await getDocs(skupPutovanja)

        const data = snapshot.docs.map(dokument => {
            const putovanje = dokument.data()

            return {
                ...putovanje,
                sifra: dokument.id,
                datumPolaska: putovanje.datumPolaska
                    .toDate()
                    .toISOString()
                    .slice(0, 10),
                datumPovratka: putovanje.datumPovratka
                    .toDate()
                    .toISOString()
                    .slice(0, 10)
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
            PrefixStorage.PUTOVANJA,
            sifra
        )

        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const putovanje = docSnap.data()

            return {
                success: true,
                data: {
                    ...putovanje,
                    sifra: docSnap.id,
                    datumPolaska: putovanje.datumPolaska
                        .toDate()
                        .toISOString()
                        .slice(0, 10),
                    datumPovratka: putovanje.datumPovratka
                        .toDate()
                        .toISOString()
                        .slice(0, 10)
                }
            }
        }

        return {
            success: false,
            message: 'Putovanje nije pronađeno.'
        }
    } catch (e) {
        return {
            success: false,
            message: e.message
        }
    }
}

async function dodaj(putovanje) {
    try {
        const novoPutovanje = {
            ...putovanje,
            datumPolaska: Timestamp.fromDate(
                new Date(putovanje.datumPolaska)
            ),
            datumPovratka: Timestamp.fromDate(
                new Date(putovanje.datumPovratka)
            )
        }

        const skupPutovanja = collection(
            getFirebaseDB(),
            PrefixStorage.PUTOVANJA
        )

        const docRef = await addDoc(
            skupPutovanja,
            novoPutovanje
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

async function promijeni(sifra, putovanje) {
    try {
        const odgovor = await ItinerarServiceFirebase.getByPutovanje(
            sifra
        )

        if (!odgovor.success) {
            return odgovor
        }

        provjeriTrajanjePutovanja(
            {
                ...putovanje,
                sifra
            },
            odgovor.data
        )

        const promjena = {
            ...putovanje,
            datumPolaska: Timestamp.fromDate(
                new Date(putovanje.datumPolaska)
            ),
            datumPovratka: Timestamp.fromDate(
                new Date(putovanje.datumPovratka)
            )
        }

        const docRef = doc(
            getFirebaseDB(),
            PrefixStorage.PUTOVANJA,
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
            PrefixStorage.PUTOVANJA,
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
    uvjetPretrazivanja = ''
) {
    try {
        const odgovor = await get()

        if (!odgovor.success) {
            return odgovor
        }

        let putovanja = odgovor.data

        const uvjet = uvjetPretrazivanja.trim().toLowerCase()

        if (uvjet !== '') {
            putovanja = putovanja.filter(putovanje => {
                const naziv = (putovanje.naziv || '').toLowerCase()
                const destinacija = (putovanje.destinacija || '').toLowerCase()
                const drzava = (putovanje.drzava || '').toLowerCase()

                return naziv.includes(uvjet) ||
                    destinacija.includes(uvjet) ||
                    drzava.includes(uvjet)
            })
        }

        const ukupnoStavki = putovanja.length
        const ukupnoStranica = Math.ceil(
            ukupnoStavki / velicinaStranice
        )

        const pocetniIndeks = (stranica - 1) * velicinaStranice

        return {
            success: true,
            data: putovanja.slice(
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