import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Link } from 'react-router-dom';

function NavBar({ isLoggedIn, handleLogout, navigate }) {
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand>
          <Link to="/">LevelUp Life</Link>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isLoggedIn ? (
              <>
                <Nav.Link>
                  <Link to="/home">Home</Link>
                </Nav.Link>
                <Nav.Link>
                  <Link to="/avatar">Avatar</Link>
                </Nav.Link>
                <NavDropdown title="User Menu" id="basic-nav-dropdown">
                  <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <NavDropdown title="Login/Signup" id="basic-nav-dropdown">
                  <NavDropdown.Item onClick={() => navigate("/login")}>
                    Login
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={() => navigate("/signup")}>
                    Signup
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
