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

function App() {

  return (
    <>
      <Container>
        <Izbornik />
        <Container className='app'>
          <Routes>
            <Route path={RouteNames.HOME} element={<Home />} />
            <Route path={RouteNames.PUTOVANJA} element={<PutovanjePregled />} />
            <Route path={RouteNames.PUTOVANJA_DODAJ} element={<NovoPutovanje />} />
            <Route path={RouteNames.LISTA_PAKIRANJA} element={<ListaPakiranja />} />
            <Route path={RouteNames.LISTA_PAKIRANJA_ODABRANO} element={<ListaPakiranja />} />
            <Route path={RouteNames.PUTOVANJA_PROMIJENA} element={<PutovanjePromjena />} />
            <Route path={RouteNames.PUTOVANJA_DETALJI} element={<PutovanjaDetalji />} />
            <Route path={RouteNames.PREDMETI} element={<Predmeti />} />
            <Route path={RouteNames.PREDMET_PROMJENA} element={<PredmetPromjena />} />
            <Route path={RouteNames.LISTA_PAKIRANJA_UREDI} element={<UrediListuPakiranja />} />
            <Route path={RouteNames.DRZAVE} element={<DrzavePregled />} />
            <Route path={RouteNames.DRZAVE_DODAJ} element={<NovaDrzava />} />
            <Route path={RouteNames.DRZAVE_PROMJENA} element={<DrzavaPromjena />} />
            <Route path={RouteNames.GENERIRANJE_PODATAKA} element={<GeneriranjePodataka />} />
            <Route path={RouteNames.ITINERAR} element={<ItinerarPregled />} />
            <Route path={RouteNames.ITINERAR_PROMJENA} element={<ItinerarPromjena />} />
            <Route path={RouteNames.ITINERAR_DODAJ} element={<ItinerarNovo />} />
            <Route path={RouteNames.KALENDAR} element={<Kalendar />} />
            <Route path={RouteNames.BUDZET} element={<BudzetPregled />} />
            <Route path={RouteNames.BUDZET_PROMJENA} element={<BudzetPromjena />} />
            <Route path={RouteNames.BUDZET_NOVO} element={<BudzetNovo />} />
            <Route path={RouteNames.KARTA_POSJETA} element={<KartaPregled />} />
            <Route path={RouteNames.KARTA_POSJETA_PROMJENA} element={<KartaPromjena />} />
            <Route path={RouteNames.KARTA_POSJETA_NOVO} element={<KartaNovo />} />
            <Route path={RouteNames.FOTOGRAFIJE} element={<FotografijePregled />} />
            <Route path={RouteNames.FOTOGRAFIJE_NOVO} element={<FotografijaNovo />} />
            <Route path={RouteNames.FOTOGRAFIJE_PROMJENA} element={<FotografijaPromjena />} />
            <Route path={RouteNames.OPERATERI} element={<OperaterPregled />} />
            <Route path={RouteNames.OPERATERI_NOVI} element={<OperaterNovi />} />
            <Route path={RouteNames.OPERATERI_PROMJENA} element={<OperaterPromjena />} />
            <Route path={RouteNames.OPERATERI_PROMJENA_LOZINKE} element={<OperaterPromjenaLozinke />} />
          </Routes>
        </Container>
        <hr className="footer-hr" />
        <p className="footer-text">&copy; {IME_APLIKACIJE}</p>
      </Container>
    </>
  )
}

export default App