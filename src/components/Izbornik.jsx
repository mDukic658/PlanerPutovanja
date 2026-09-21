import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { IME_APLIKACIJE } from '../constants';

export default function Izbornik() {

    return (
        <Navbar expand="lg" className="bg-body-tertiary">
            <Container>
                <Navbar.Brand href="#home">{IME_APLIKACIJE}</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="#home">Početna</Nav.Link>
                        <NavDropdown title="Putovanja" id="basic-nav-dropdown">
                            <NavDropdown.Item href="#action/3.1">Europa</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.2">
                                Azija
                            </NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.3">Amerika</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}