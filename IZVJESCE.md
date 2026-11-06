# Izvješće: PlanerPutovanja – Prednosti i Nedostaci

> Verzija: 0.0.0 · Pregled izvornog koda: 11.06.2026.

---

## 1. Opći pregled

**PlanerPutovanja** je SPA (single-page application) za planiranje putovanja. Korisnik može:

- Kreirati / mijenjati / obrisati putovanja (naziv, destinacija, država, datumi, budžet)
- Vodi listu pakiranja po putovanju (predmeti s kategorijama)
- Vodi bazu država (naziv, regija, valuta, jezik)
- Kreirati itinerar (dnevni plan aktivnosti s vremenskim okvirima)
- Pregledati kalendar putovanja
- Generirati fake podatke (Faker.js)
- Izvoziti putovanje / listu pakiranja u PDF (`@react-pdf/renderer`)

---

## 2. Tehnički stack

| Sloj | Teknologija |
|---|---|
| UI framework | React 19.2.8 |
| Build tool | Vite 8.3.5 |
| Router | react-router-dom 7.18.4 |
| CSS / UI | Bootstrap 5.3.8 + react-bootstrap 2.10.10 |
| Ikone | react-icons (fa, bs, gi, tb) |
| PDF | @react-pdf/renderer 4.9.0 |
| Fake podaci | @faker-js/faker 10.6.0 |
| Datinaci | dayjs 1.11.23 |
| Kalendar | react-big-calendar 1.20.0 |
| Lint | oxlint 1.89.0 (dev) |
| Tipovi | TypeScript types (`@types/react`, `@types/react-dom`) – ali kod je čisti **JSX/JS** |
| Persistencija | In-memory (podrazumijevano) / `localStorage` (izborički) |

---

## 3. Arhitektura i struktura

```
src/
├── main.jsx                  – ulazna točka, BrowserRouter + ObavijestiProvider
├── App.jsx                   – layout + <Routes> (16 ruta, bez 404 catch-all)
├── constants.js              – RouteNames, IME_APLIKACIJE, DATA_SOURCE
├── App.css
├── components/
│   ├── Izbornik.jsx          – Navbar s NavDropdown
│   ├── Obavijesti.jsx        – Context + Toast (react-bootstrap)
│   ├── PretragaDrzava.jsx    – dropdown za odabir države
│   ├── FormatDatuma.jsx      – dayjs formatter
│   ├── Napomena.jsx          – mala napomena (tooltip-like)
│   ├── CoverPhoto.jsx
│   ├── PutovanjaPDFGenerator.jsx
│   └── ListaPakiranjaPDFGenerator.jsx
├── pages/
│   ├── Home.jsx
│   ├── Kalendar.jsx
│   ├── GeneriranjePodataka.jsx
│   ├── putovanja/
│   │   ├── PutovanjaPregled.jsx   – paginated list
│   │   ├── NovoPutovanje.jsx      – create form
│   │   └── PutovanjePromjena.jsx  – edit form
│   ├── lista_pakiranja/
│   │   ├── ListaPakiranja.jsx
│   │   ├── NovoPakiranje.jsx
│   │   ├── Pakiranje.jsx
│   │   └── UrediListuPakiranja.jsx
│   ├── predmeti/
│   │   ├── Predmeti.jsx
│   │   └── PredmetPromjena.jsx
│   ├── drzave/
│   │   ├── DrzavePregled.jsx
│   │   ├── NovaDrzava.jsx
│   │   └── DrzavaPromjena.jsx
│   └── Itinerar/
│       ├── ItinerarPregled.jsx
│       ├── ItinerarNovo.jsx
│       └── ItinerarPromjena.jsx
└── services/                 – 5 domeni, svaka s istim patternom
    ├── putovanja/
    │   ├── PutovanjaService.js            – factory / selector
    │   ├── PutovanjaServiceMemorija.js    – in-memory backend
    │   ├── PutovanjaServiceLocalStorage.js– localStorage backend
    │   └── PutovanjaPodaci.js             – seed data (6 putovanja)
    ├── lista_pakiranja/
    ├── predmeti/
    ├── drzave/
    └── itinerar/
```

### Design patterni

1. **Strategy / Adapter** – Svaka domena ima `XService.js` (factory) koji na temelju `DATA_SOURCE` (`constants.js`, lin. 31) odabire implementaciju: `Memorija` ili `LocalStorage`. Ako nijedna ne odgovara, koristi se `PrazanServis` (Null Object pattern) – definiran **inline** u svakom `XService.js`, ne u zasebnom fileu.

2. **Context API** – `ObavijestiContext` (components/Obavijesti.jsx) za toast obavijesti.

3. **Komponentski pristup** – Svaka ruta je zasebna funkcionalna komponenta (hooks: `useState`, `useEffect`).

---

## 4. Prednosti

### 4.1 Jasan i konzistentan arhitektonski pattern
- **Sve 5 domeni** (putovanja, lista_pakiranja, predmeti, drzave, itinerar) koriste **identičan** Strategy/Adapter pattern:
  - `XService.js` – factory + `PrazanServis` fallback
  - `XServiceMemorija.js` – in-memory implementacija
  - `XServiceLocalStorage.js` – localStorage implementacija
  - `XPodaci.js` – seed/fake podaci
- Ovo omogućava lako zamjenjivanje persistence sloja (npr. Firebase, REST API) bez mijenjanja UI komponenti.
- `PrazanServis` (Null Object pattern) spriječi `TypeError: Cannot read properties of null` kod nedostupnog servisa.

### 4.2 Centralizirane rute i konstante
- `constants.js` definira sve rute u objektu `RouteNames` – nema magičnih stringova u komponentama.
- `IME_APLIKACIJE` je centraliziran (koristi se u `App.jsx` footer i `Izbornik.jsx` brand).

### 4.3 Pažljivo razdvajanje odgovornosti (separation of concerns)
- UI komponente **ne znaju** za persistence – pozivaju samo `XService.xxx()`.
- Service sloj **ne zna** za React – čisti JS moduli s async funkcijama.
- PDF generatori su odvojeni od CRUD logike.

### 4.4 Paginacija u listi putovanja
- `PutovanjaPregled.jsx` koristi `dohvatiStranicu()` – ne učitava sve putovanja odjednom.
- `velicinaStranice = 6` (lin. 20), inteligentan pagination UI s elipsama (lin. 215–257).
- Nakon brisanja, automatski korigira broj stranice ako je trenutna izvan raspona (lin. 62–81).

### 4.5 Obavijestni sustav (Context + Toast)
- `Obavijesti.jsx` nudi jednostavan `useObavijesti()` hook.
- Toast se automatski skriva (`autohide`, `delay={3000}`), korisnik može ručno zatvoriti.
- Konzistentno korišten u `PutovanjaPregled.jsx`, `NovoPutovanje.jsx` itd.

### 4.6 Error handling na UI razini
- `PutovanjaPregled.jsx`: `.catch()` na `ucitajPutovanja()` + try/catch na `obrisi()`.
- `NovoPutovanje.jsx`: try/catch oko `PutovanjaService.dodaj()`.
- Korisnik dobiva jasnu poruku umjesto tihog neuspjeha.

### 4.7 Flexibilan `NovoPutovanje` – reusable komponenta
- Prima opcionalne props `pocetniDatumi`, `onSpremi`, `onOdustani` (lin. 12–14).
- Ista komponenta radi i kao standalone stranica i kao embedded u drugom kontekstu.

### 4.8 Animirani brojevi na Home stranicu
- `Home.jsx` koristi `requestAnimationFrame` za smooth counter animaciju statistike (lin. 52–81).
- Cleanup: `cancelAnimationFrame` u returnu useEffecta (lin. 79).

### 4.9 PDF izvoz
- `PutovanjaPDFGenerator.jsx` i `ListaPakiranjaPDFGenerator.jsx` koriste `@react-pdf/renderer`.
- Omogućava print/save putovanja ili liste pakiranja bez vanjskih servisa.

### 4.10 Generiranje fake podataka
- `GeneriranjePodataka.jsx` koristi `@faker-js/faker` – korisno za development/testing bez ručnog unosivanja.

### 4.11 Modularan build (Vite)
- Brz dev server, HMR, ES modules.
- `package.json` je čist – nema nepotrebnih build alata.

### 4.12 TypeScript types u dev
- `@types/react` i `@types/react-dom` omogućavaju IntelliSense i tip-checking u IDE-u.

### 4.13 Kalendar integracija
- `react-big-calendar` za vizualni pregled putovanja po datumima.
- `dayjs` za lagano formatiranje datuma.

### 4.14 `confirm()` prije brisanja
- `PutovanjaPregled.jsx` lin. 48: `if (!confirm("Sigurno obrisati?"))` – sprečava nesvjesno brisanje.

### 4.15 `localStorage` izolacija
- `STORAGE_KEY = 'marta_putovanja'` – jedinstven ključ, nema sudara s drugim aplikacijama.
- `JSON.parse` / `JSON.stringify` uz fallback na `[]` – ne ruši se na praznom storage.

---
## 5. Nedostaci i problemi

### 5.1 Nedostatak 404 rute
**Datoteka:** `App.jsx` (lin. 31–48)

Nema catch-all `*` rute. Ako korisnik upiše `localhost:5173/nespostojece`, dobije **bijelu stranicu** bez ikakve poruke.

**Preporuka:** Dodati `<Route path="*" element={<NotFound />} />` u `App.jsx`.

### 5.2 Nedostatak ErrorBoundary
**Datoteka:** `App.jsx`, `main.jsx`

Nijedna komponenta nema React ErrorBoundary. Ako bilo koja stranica baci runtime error (npr. `putovanje.sifra` je `undefined`), **cijela aplikacija se ruši** – bijela stranica.

**Preporuka:** Klasa `ErrorBoundary` + `<ErrorBoundary>` oko `<Routes>`.

### 5.3 Inkonzistentna generacija sifre (ID)
| Backend | Logika |
|---|---|
| `PutovanjaServiceMemorija.js` lin. 21 | `putovanja[putovanja.length - 1].sifra + 1` |
| `PutovanjaServiceLocalStorage.js` lin. 35 | `Math.max(...putovanja.map(p => p.sifra)) + 1` |

**Problem:** Memorija pretpostavlja da je zadnji element najveći ID. Ako se podaci reorganiziraju (npr. insert na početak), dobit će se **duplikat sifre**. LocalStorage koristi `Math.max` – točan pristup.

**Preporuka:** Ujednačiti na `Math.max` pattern.

### 5.4 `DATA_SOURCE` hardcodiran, bez env podrske
**Datoteka:** `constants.js` lin. 31

```js
export const DATA_SOURCE = 'memorija'
```

- Nema `.env` / `.env.example` datoteka u repo-u.
- Promjena zahtijeva **ručno editiranje koda i rebuild**.
- Komentar u kodu spominje `firebase` kao buduće opciju, ali nema infrastrukture za to.

**Preporuka:** `export const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE || 'memorija'`

### 5.5 `npm run lint` ne radi
**Datoteka:** `package.json` lin. 9 vs lin. 31

```json
"lint": "eslint ."          // ← poziva eslint
"oxlint": "^1.89.0"        // ← instaliran je oxlint, NI eslint
```

`npm run lint` → `Error: Cannot find module 'eslint'`. Lint skripta i instalirani alat ne odgovaraju.

**Preporuka:** `"lint": "oxlint"` ili instalirati `eslint` + `.eslintrc`.

### 5.6 Duplikat `id` atribut u nav-drobdownu
**Datoteka:** `Izbornik.jsx` lin. 25 i 36

Oba `NavDropdown` komponente koriste `id="basic-nav-dropdown"`. U HTML-u `id` mora biti **jedinstven** – ovo je invalid markup i može uzrokovati probleme s a11y i CSS targetiranjem.

### 5.7 `alert()` za validaciju umjesto toast sustava
**Datoteka:** `NovoPutovanje.jsx`

```js
alert("Ime putovanja je obavezno!")
```

Aplikacija već ima `useObavijesti()` toast sustav – `alert()` blokira UI, izgleda neugodno i narušava konzistentnost.

### 5.8 Nedostatak validacije datuma (od/do)
**Datoteka:** `NovoPutovanje.jsx`

Nema provjera da `datum_od <= datum_do`. Korisnik može unijeti povrat prije polaska – podatak se spremi bez upozorenja.

### 5.9 `Home.jsx` učitava SVE putovanja
**Datoteka:** `Home.jsx`

```js
const res = await PutovanjaService.get()  // → svi zapisi
```

Nema paginacije – statistika (broj putovanja, ukupan budžet) se računa nad **cijelom** kolekcijom. Za malu bazu to je OK, ali s rastom podataka ovo postaje problem.

### 5.10 `PrazanServis` dupliran u svakoj domeni
**Datoteka:** `PutovanjaService.js`, `PakiranjaService.js`, `PredmetiService.js`, `DrzaveService.js`, `ItinerarService.js`

Svaki `XService.js` file sadrži **istovjetnu** definiciju `PrazanServis` objekta (~15 linija × 5 domeni = ~75 linija duplikata). Ako se mijenja signature (npr. novi metod), moraju se mijenjati **sva 5 mjesta**.

**Preporuka:** Ekstraktirati u `services/PrazanServis.js` i reuse.

### 5.11 Nedostatak loading spinnera
**Datoteka:** `Home.jsx`, `PutovanjaPregled.jsx`, `NovoPutovanje.jsx`

Podaci se učitavaju async, ali nema vizualnog indikатора učitavanja. Korisnik vidi praznu stranicu dok se API izvrši – nije jasno da se nešto događa.

### 5.12 Nedostatak unit testova
**Datoteka:** `package.json`

Nema test frameworka (jest, vitest, @testing-library/react). `package.json` nema `"test"` script. Service logika (paginacija, ID generacija, CRUD) je idealna za unit testove – trenutno ih nema.
### 5.13 Nema TypeScript definicija
Kod je čisti JSX/JS bez `.d.ts` ili TS migracije. S `@types/react` u dev, IDE daje hintove, ali runtime tipovi nisu enforced. `sifra`, `datum_od`, `datum_do` – sve su implicitni.

### 5.14 Nema `.gitignore` za `.env`
Budući da se planira `DATA_SOURCE` preko env varijabli (5.4), treba `.gitignore` staviti `.env` i `.env.local`.

---

## 6. Preporuke – Sprint 1 (hitno)

| # | Problem | Rješenje | Prije | Poslije |
|---|---|---|---|---|
| 1 | 404 bijela stranica (5.1) | `<Route path="*" element={<NotFound/>}/>` u `App.jsx` | Bijela stranica | Jasna 404 stranica |
| 2 | Cijela app se ruši na error (5.2) | `ErrorBoundary` klasa oko `<Routes>` | Bijela stranica | Graceful fallback |
| 3 | Duplikat sifre (5.3) | `Math.max(...ids) + 1` u oba backenda | Mogući duplikati | Konzistentno |
| 4 | `npm run lint` ne radi (5.5) | `"lint": "oxlint"` u `package.json` | `Cannot find module` | Lint radi |
| 5 | `DATA_SOURCE` hardkodiran (5.4) | `import.meta.env.VITE_DATA_SOURCE` + `.env` | Ručno mijenjanje koda | Env var |

## 7. Preporuke – Sprint 2 (bitno)

| # | Problem | Rješenje |
|---|---|---|
| 6 | `alert()` umjesto toast (5.7) | `useObavijesti()` u `NovoPutovanje.jsx` |
| 7 | Nema validacija od/do (5.8) | `if (datum_od > datum_do) → toast error` |
| 8 | Duplikat `PrazanServis` (5.10) | Ekstraktirati u `services/PrazanServis.js` |
| 9 | Nema loading spinner (5.11) | `useState(ucitavanje)` + `<Spinner>` |
| 10 | Duplikat `id` u nav (5.6) | Jedinstveni `id` atributi |

## 8. Preporuke – Sprint 3 (poželjno)

| # | Problem | Rješenje |
|---|---|---|
| 11 | Nema testova (5.12) | Vitest + @testing-library/react, pokriti service sloj |
| 12 | Nema TypeScript (5.13) | Postepena migracija: services → components |
| 13 | `Home.jsx` učitava sve (5.9) | `dohvatiStranicu(1, 1000)` ili dedicated `getStats()` |

---

## 9. Zaključak

**PlanerPutovanja** je dobro strukturirana, uredna React aplikacija s jasnom separacijom slojeva (UI / service / persistence). Strategy pattern i Null Object fallback daju solidan temelj za eksponencijalnost.

**Glavni rizici** su na razini **pouzdanosti**:
- Nema ErrorBoundary → jedan bug = cijela app ruši
- Nema 404 route → korisnik se zaglavi na bijeloj stranici
- Inkonzistentna ID generacija → mogući duplikati podataka

**Sprint-1 popravke** (5.1 – 5.5) su male, niskog rizika i visokog utjecaja. Preporučuje se njihova implementacija prije bilo kakve nove funkcionalnosti.

---
*Izvješće generirano na temelju analize ~34 izvornih datoteka, 11.06.2026.*


