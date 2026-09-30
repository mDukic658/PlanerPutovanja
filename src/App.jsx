import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import { Container } from 'react-bootstrap'
import Izbornik from './components/Izbornik'
import { IME_APLIKACIJE, RouteNames } from './constants'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import PutovanjePregled from './pages/putovanja/PutovanjaPregled'
import NovoPutovanje from './pages/putovanja/NovoPutovanje'
import ListaPakiranja from './pages/lista_pakiranja/ListaPakiranja'

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
          </Routes>
        </Container>
        <hr />
        &copy; {IME_APLIKACIJE}
      </Container>
    </>
  )
}

export default App