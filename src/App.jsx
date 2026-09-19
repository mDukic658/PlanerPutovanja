import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import { Badge, Container } from 'react-bootstrap'

function App() {

  return (
    <>
    <Container>
      Hello
    </Container>
    <hr />
    <div className='podrucje'>
      Planer Putovanja
    </div>

    <Badge bg='success'>5</Badge>
    </>
  )
}

export default App