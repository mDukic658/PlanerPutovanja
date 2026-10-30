
export const IME_APLIKACIJE = 'Planer Putovanja'

export const RouteNames = {
    HOME: '/',

    PUTOVANJA: '/putovanja',
    PUTOVANJA_DODAJ: '/novo/putovanje',
    PUTOVANJA_PROMIJENA: '/putovanja/:sifra',

    PREDMETI: '/predmeti',
    PREDMET_PROMJENA: '/predmet/promjena/:sifra',

    LISTA_PAKIRANJA: '/lista/pakiranja',
    LISTA_PAKIRANJA_UREDI: '/lista/pakiranja/:sifra',

    DRZAVE: '/drzave',
    DRZAVE_DODAJ: '/drzave/novo',
    DRZAVE_PROMJENA: '/drzave/promjena/:sifra',

    GENERIRANJE_PODATAKA: '/generiraj-podatke',

    ITINERAR: '/itinerar',
    ITINERAR_PROMJENA: '/itinerar/promjena/:sifra',
    ITINERAR_DODAJ: '/novo/itinerar',

    KALENDAR: '/kalendar'
}

// memorija, localStorage, firebase
export const DATA_SOURCE = 'memorija'