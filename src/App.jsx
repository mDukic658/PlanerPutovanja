import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import { Container } from 'react-bootstrap'
import Izbornik from './components/zajednicko/Izbornik'
import { IME_APLIKACIJE, RouteNames } from './constants'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import PutovanjePregled from './pages/putovanja/PutovanjaPregled'
import NovoPutovanje from './pages/putovanja/NovoPutovanje'
import ListaPakiranja from './pages/lista_pakiranja/ListaPakiranja'
import PutovanjePromjena from './pages/putovanja/PutovanjePromjena'
import Predmeti from './pages/predmeti/Predmeti'
import PredmetPromjena from './pages/predmeti/PredmetPromjena'
import UrediListuPakiranja from './pages/lista_pakiranja/UrediListuPakiranja'
import DrzavePregled from './pages/drzave/DrzavePregled'
import DrzavaPromjena from './pages/drzave/DrzavaPromjena'
import NovaDrzava from './pages/drzave/NovaDrzava'
import GeneriranjePodataka from './pages/GeneriranjePodataka'
import ItinerarPregled from './pages/Itinerar/ItinerarPregled'
import ItinerarPromjena from './pages/Itinerar/ItinerarPromjena'
import ItinerarNovo from './pages/Itinerar/ItinerarNovo'
import Kalendar from './pages/Kalendar'
import BudzetPregled from './pages/budzet/BudzetPregled'
import BudzetPromjena from './pages/budzet/BudzetPromjena'
import BudzetNovo from './pages/budzet/BudzetNovo'
import KartaPregled from './pages/karta/KartaPregled'
import KartaPromjena from './pages/karta/KartaPromjena'
import KartaNovo from './pages/karta/KartaNovo'
import PutovanjaDetalji from './pages/putovanja/PutovanjaDetalji'
import FotografijePregled from './pages/fotografije/FotografijePregled'
import FotografijaNovo from './pages/fotografije/FotografijaNovo'
import FotografijaPromjena from './pages/fotografije/FotografijaPromjena'
import OperaterPregled from './pages/operateri/OperaterPregled'
import OperaterNovi from './pages/operateri/OperaterNovi'
import OperaterPromjena from './pages/operateri/OperaterPromjena'
import OperaterPromjenaLozinke from './pages/operateri/OperaterPromjenaLozinke'
import Login from './pages/login/Login'
import ZasticenaRuta from './components/ZasticenaRuta'
import NepostojecaStranica from './pages/NepostojecaStranica'
import { useEffect } from 'react'
import OAplikaciji from './pages/OAplikaciji'

function Stranica({ naslov, children }) {
  useEffect(() => {
    document.title = `${naslov} · ${IME_APLIKACIJE}`
  }, [naslov])

  return children
}

function App() {

  return (
    <>
      <Container>
        <Izbornik />
        <Container className='app'>
          <Routes>
            <Route path={RouteNames.HOME} element={<Stranica naslov="Početna"><Home /></Stranica>} />
            <Route path={RouteNames.O_APLIKACIJI} element={<Stranica naslov="O aplikaciji"><OAplikaciji /></Stranica>} />
            <Route path={RouteNames.LOGIN} element={<Stranica naslov="Prijava"><Login /></Stranica>} />

            <Route element={<ZasticenaRuta />}>
              <Route path={RouteNames.PUTOVANJA} element={<Stranica naslov="Putovanja"><PutovanjePregled /></Stranica>} />
              <Route path={RouteNames.PUTOVANJA_DODAJ} element={<Stranica naslov="Novo putovanje"><NovoPutovanje /></Stranica>} />
              <Route path={RouteNames.PUTOVANJA_PROMIJENA} element={<Stranica naslov="Uredi putovanje"><PutovanjePromjena /></Stranica>} />
              <Route path={RouteNames.PUTOVANJA_DETALJI} element={<Stranica naslov="Detalji putovanja"><PutovanjaDetalji /></Stranica>} />

              <Route path={RouteNames.LISTA_PAKIRANJA} element={<Stranica naslov="Lista pakiranja"><ListaPakiranja /></Stranica>} />
              <Route path={RouteNames.LISTA_PAKIRANJA_ODABRANO} element={<Stranica naslov="Lista pakiranja"><ListaPakiranja /></Stranica>} />
              <Route path={RouteNames.LISTA_PAKIRANJA_UREDI} element={<Stranica naslov="Uredi listu pakiranja"><UrediListuPakiranja /></Stranica>} />

              <Route path={RouteNames.PREDMETI} element={<Stranica naslov="Predmeti"><Predmeti /></Stranica>} />
              <Route path={RouteNames.PREDMET_PROMJENA} element={<Stranica naslov="Uredi predmet"><PredmetPromjena /></Stranica>} />

              <Route path={RouteNames.ITINERAR} element={<Stranica naslov="Itinerar"><ItinerarPregled /></Stranica>} />
              <Route path={RouteNames.ITINERAR_PROMJENA} element={<Stranica naslov="Uredi aktivnost"><ItinerarPromjena /></Stranica>} />
              <Route path={RouteNames.ITINERAR_DODAJ} element={<Stranica naslov="Nova aktivnost"><ItinerarNovo /></Stranica>} />

              <Route path={RouteNames.KALENDAR} element={<Stranica naslov="Kalendar"><Kalendar /></Stranica>} />

              <Route path={RouteNames.BUDZET} element={<Stranica naslov="Budžet i troškovi"><BudzetPregled /></Stranica>} />
              <Route path={RouteNames.BUDZET_PROMJENA} element={<Stranica naslov="Uredi trošak"><BudzetPromjena /></Stranica>} />
              <Route path={RouteNames.BUDZET_NOVO} element={<Stranica naslov="Novi trošak"><BudzetNovo /></Stranica>} />

              <Route path={RouteNames.KARTA_POSJETA} element={<Stranica naslov="Karta posjeta"><KartaPregled /></Stranica>} />
              <Route path={RouteNames.KARTA_POSJETA_PROMJENA} element={<Stranica naslov="Uredi posjet"><KartaPromjena /></Stranica>} />
              <Route path={RouteNames.KARTA_POSJETA_NOVO} element={<Stranica naslov="Novi posjet"><KartaNovo /></Stranica>} />

              <Route path={RouteNames.FOTOGRAFIJE} element={<Stranica naslov="Albumi"><FotografijePregled /></Stranica>} />
              <Route path={RouteNames.FOTOGRAFIJE_NOVO} element={<Stranica naslov="Dodaj fotografije"><FotografijaNovo /></Stranica>} />
              <Route path={RouteNames.FOTOGRAFIJE_PROMJENA} element={<Stranica naslov="Uredi fotografiju"><FotografijaPromjena /></Stranica>} />
            </Route>

            <Route element={<ZasticenaRuta uloge={['admin']} />}>
              <Route path={RouteNames.DRZAVE} element={<Stranica naslov="Države"><DrzavePregled /></Stranica>} />
              <Route path={RouteNames.DRZAVE_DODAJ} element={<Stranica naslov="Nova država"><NovaDrzava /></Stranica>} />
              <Route path={RouteNames.DRZAVE_PROMJENA} element={<Stranica naslov="Uredi državu"><DrzavaPromjena /></Stranica>} />

              <Route
                path={RouteNames.GENERIRANJE_PODATAKA}
                element={<Stranica naslov="Generiranje podataka"><GeneriranjePodataka /></Stranica>}
              />

              <Route path={RouteNames.OPERATERI} element={<Stranica naslov="Operateri"><OperaterPregled /></Stranica>} />
              <Route path={RouteNames.OPERATERI_NOVI} element={<Stranica naslov="Novi operater"><OperaterNovi /></Stranica>} />
              <Route path={RouteNames.OPERATERI_PROMJENA} element={<Stranica naslov="Uredi operatera"><OperaterPromjena /></Stranica>} />
              <Route
                path={RouteNames.OPERATERI_PROMJENA_LOZINKE}
                element={<Stranica naslov="Promjena lozinke"><OperaterPromjenaLozinke /></Stranica>}
              />
            </Route>

            <Route path="*" element={<Stranica naslov="Stranica nije pronađena"><NepostojecaStranica /></Stranica>} />
          </Routes>
        </Container>
        <hr className="footer-hr" />
        <p className="footer-text">&copy; {IME_APLIKACIJE}</p>
      </Container>
    </>
  )
}

export default App