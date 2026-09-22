import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { IME_APLIKACIJE, RouteNames } from '../constants';
import { useNavigate } from 'react-router-dom';

export default function Izbornik() {

    const navigate = useNavigate()

    return (
        <Navbar expand="lg" className="bg-body-tertiary">
            <Container>
                <Navbar.Brand href="#home">{IME_APLIKACIJE}</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link
                            onClick={() => { navigate(RouteNames.HOME) }}
                        >Početna</Nav.Link>
                        <NavDropdown title="Putovanja" id="basic-nav-dropdown">
                            <NavDropdown.Item
                                onClick={() => { navigate(RouteNames.PUTOVANJA) }}
                            >Europa</NavDropdown.Item>
                            <NavDropdown.Item
                                onClick={() => { navigate(RouteNames.PUTOVANJA) }}
                            >
                                Azija
                            </NavDropdown.Item>
                            <NavDropdown.Item
                                onClick={() => { navigate(RouteNames.PUTOVANJA) }}
                            >Amerika</NavDropdown.Item>
                            <NavDropdown.Item
                                onClick={() => { navigate(RouteNames.PUTOVANJA) }}
                            >Australija</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}