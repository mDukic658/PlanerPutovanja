const cache = new Map()

let zadnjiZahtjev = 0
let zahtjevUTijeku = false

async function pretraziMjesto(grad, iso2) {
    const naziv = grad.trim()
    const oznaka = iso2.trim().toLowerCase()

    if (naziv.length < 2 || !/^[a-z]{2}$/.test(oznaka)) {
        throw new Error("Odaberi državu i unesi naziv mjesta.")
    }

    // Adresu možemo promijeniti kroz konfiguraciju prije učitavanja aplikacije.
    const endpoint =
        window.APP_CONFIG?.geokodiranjeUrl ||
        "https://nominatim.openstreetmap.org/search"

    const kljuc = JSON.stringify([
        endpoint,
        oznaka,
        naziv.toLowerCase()
    ])

    if (cache.has(kljuc)) {
        return cache.get(kljuc)
    }

    if (zahtjevUTijeku || Date.now() - zadnjiZahtjev < 1100) {
        throw new Error("Pričekaj trenutak prije nove pretrage.")
    }

    const url = new URL(endpoint, window.location.origin)

    url.search = new URLSearchParams({
        q: naziv,
        countrycodes: oznaka,
        format: "jsonv2",
        limit: "5",
        "accept-language": "hr"
    }).toString()

    zahtjevUTijeku = true
    zadnjiZahtjev = Date.now()

    try {
        const odgovor = await fetch(url, {
            referrerPolicy: "strict-origin-when-cross-origin",
            signal: AbortSignal.timeout(15000)
        })

        if (!odgovor.ok) {
            throw new Error(
                "Pretraga lokacije nije uspjela. Pokušaj ponovno kasnije."
            )
        }

        const podaci = await odgovor.json()

        if (!Array.isArray(podaci)) {
            throw new Error("Servis je vratio neispravan odgovor.")
        }

        const rezultati = podaci.map(stavka => ({
            id: stavka.place_id,
            naziv: stavka.display_name,
            lat: Number(stavka.lat),
            lng: Number(stavka.lon)
        })).filter(stavka =>
            Number.isFinite(stavka.lat) &&
            Number.isFinite(stavka.lng) &&
            Math.abs(stavka.lat) <= 90 &&
            Math.abs(stavka.lng) <= 180
        )

        cache.set(kljuc, rezultati)

        return rezultati
    } finally {
        zahtjevUTijeku = false
    }
}

export default { pretraziMjesto }