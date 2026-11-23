# Planer Putovanja

Planer Putovanja je web-aplikacija za organizaciju putovanja prije polaska te praćenje aktivnosti i troškova tijekom putovanja. Projekt je izrađen kao završni rad na Edunovinu programu Front-End developer.

## Funkcionalnosti

- **Putovanja i kalendar** — planiranje datuma, odredišta i aktivnosti te pregled rasporeda u kalendaru.
- **Itinerar** — raspored aktivnosti po danima, oblikovanje bilješki i izvoz u Word (`.docx`).
- **Lista pakiranja** — dodavanje predmeta i napomena, praćenje napretka i izvoz u PDF.
- **Budžet** — evidencija troškova po kategorijama, izračun potrošenog i preostalog iznosa te grafikon troškova.
- **Albumi** — učitavanje, izrezivanje i pregled fotografija po putovanju.
- **Karta posjeta** — prikaz odredišta i bilježenje posjećenih mjesta.
- **Korisnički računi** — prijava, odjava i pristup stranicama prema ulozi. Administrator upravlja računima operatera.

## Lokalno pokretanje

Potrebni su Git, Node.js 22.13+ iz grane 22.x ili Node.js 24+ te npm 10+.

```bash
git clone https://github.com/mDukic658/PlanerPutovanja.git
cd PlanerPutovanja
npm ci
```

Projekt prema zadanim postavkama koristi Firebase Cloud Firestore. U korijenu projekta, uz `package.json`, napravi datoteku `.env` i upiši konfiguracijske vrijednosti svojeg Firebase projekta:

```dotenv
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Datoteka `.env` izuzeta je iz Gita. Za prijavu je potreban postojeći račun u odabranom izvoru podataka.

```bash
npm run dev
```

Otvori adresu koju Vite ispiše u terminalu, obično `http://localhost:5173`.

## Naredbe

| Naredba | Namjena |
| --- | --- |
| `npm run dev` | Pokretanje razvojnog poslužitelja |
| `npm run lint` | Provjera koda pomoću Oxlinta |
| `npm run build` | Izrada produkcijske verzije u mapi `dist/` |
| `npm run preview` | Lokalni pregled produkcijske verzije nakon builda |

## Tehnologije

React, Vite, React Router, React Bootstrap i SCSS za sučelje, Zod za validaciju obrazaca, Cloud Firestore za podatke, Leaflet za karte, React Big Calendar za kalendar, Recharts za grafikone te Tiptap za oblikovanje bilješki.