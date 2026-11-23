import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import { Link, useNavigate } from 'react-router-dom'
import { IME_APLIKACIJE, RouteNames } from '../../constants'
import useAuth from '../../hooks/useAuth'
import './Izbornik.scss'

export default function Izbornik() {
    const navigate = useNavigate()
    const { isLoggedIn, authUser, logout } = useAuth()

    return (
        <Navbar collapseOnSelect expand="xl" className="bg-body-tertiary">
            <Container>
                <Navbar.Brand as={Link} to={RouteNames.HOME}>
                    {IME_APLIKACIJE}
                </Navbar.Brand>

                <Navbar.Toggle
                    aria-controls="basic-navbar-nav"
                    aria-label="Otvori ili zatvori izbornik"
                />

                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link
                            onClick={() => navigate(RouteNames.HOME)}
                            eventKey={RouteNames.HOME}
                        >
                            Početna
                        </Nav.Link>

                        {isLoggedIn && (
                            <>

                                <NavDropdown title="Putovanja" id="putovanja-dropdown">
                                    <NavDropdown.Item
                                        onClick={() => navigate(RouteNames.PUTOVANJA)}
                                        eventKey={RouteNames.PUTOVANJA}
                                    >
                                        Pregled putovanja
                                    </NavDropdown.Item>

                                    <NavDropdown.Item
                                        onClick={() => navigate(RouteNames.LISTA_PAKIRANJA)}
                                        eventKey={RouteNames.LISTA_PAKIRANJA}
                                    >
                                        Lista pakiranja
                                    </NavDropdown.Item>

                                    <NavDropdown.Item
                                        onClick={() => navigate(RouteNames.PREDMETI)}
                                        eventKey={RouteNames.PREDMETI}
                                    >
                                        Predmeti
                                    </NavDropdown.Item>

                                    <NavDropdown.Item
                                        onClick={() => navigate(RouteNames.ITINERAR)}
                                        eventKey={RouteNames.ITINERAR}
                                    >
                                        Itinerar
                                    </NavDropdown.Item>

                                    <NavDropdown.Item
                                        onClick={() => navigate(RouteNames.BUDZET)}
                                        eventKey={RouteNames.BUDZET}
                                    >
                                        Evidencija troškova
                                    </NavDropdown.Item>
                                </NavDropdown>

                                <Nav.Link
                                    as={Link}
                                    to={RouteNames.KALENDAR}
                                    eventKey={RouteNames.KALENDAR}
                                >
                                    Kalendar
                                </Nav.Link>

                                <Nav.Link
                                    onClick={() => navigate(RouteNames.FOTOGRAFIJE)}
                                    eventKey={RouteNames.FOTOGRAFIJE}
                                >
                                    Albumi
                                </Nav.Link>

                                <Nav.Link
                                    as={Link}
                                    to={RouteNames.KARTA_POSJETA}
                                    eventKey={RouteNames.KARTA_POSJETA}
                                >
                                    Karta posjeta
                                </Nav.Link>
                            </>
                        )}

                        {isLoggedIn && authUser.uloga === 'admin' && (
                            <NavDropdown title="Programi" id="programi-dropdown">
                                <NavDropdown.Item
                                    as={Link}
                                    to={RouteNames.DRZAVE}
                                    eventKey={RouteNames.DRZAVE}
                                >
                                    Države
                                </NavDropdown.Item>

                                <NavDropdown.Item
                                    as={Link}
                                    to={RouteNames.OPERATERI}
                                    eventKey={RouteNames.OPERATERI}
                                >
                                    Operateri
                                </NavDropdown.Item>

                                <NavDropdown.Item
                                    as={Link}
                                    to={RouteNames.GENERIRANJE_PODATAKA}
                                    eventKey={RouteNames.GENERIRANJE_PODATAKA}
                                >
                                    Generiranje podataka
                                </NavDropdown.Item>
                            </NavDropdown>
                        )}

                        <Nav.Link
                            as={Link}
                            to={RouteNames.O_APLIKACIJI}
                            eventKey={RouteNames.O_APLIKACIJI}
                        >
                            O aplikaciji
                        </Nav.Link>
                    </Nav>

                    <Nav className="ms-auto">
                        {isLoggedIn ? (
                            <NavDropdown
                                title={authUser.email}
                                id="korisnicki-izbornik"
                                align="end"
                            >
                                <NavDropdown.ItemText>
                                    Uloga: {authUser.uloga}
                                </NavDropdown.ItemText>

                                <NavDropdown.Divider />

                                <NavDropdown.Item
                                    onClick={logout}
                                    eventKey="odjava"
                                >
                                    Odjava
                                </NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <Nav.Link
                                as={Link}
                                to={RouteNames.LOGIN}
                                eventKey={RouteNames.LOGIN}
                            >
                                Prijava
                            </Nav.Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar >
    )
}