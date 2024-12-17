  import { useEffect, useState } from 'react';
  import Container from 'react-bootstrap/Container';
  import Nav from 'react-bootstrap/Nav';
  import Navbar from 'react-bootstrap/Navbar';
  import NavDropdown from 'react-bootstrap/NavDropdown';
  import { Link } from 'react-router-dom';
  

  function NavBar({ isLoggedIn, handleLogout, navigate }) {
    const [frame, setFrame] = useState([]);
    const [avatar, setAvatar] = useState([]);
    const [theme, setTheme] = useState('light');
    const framePath='/assets/frame/';
    const path='/assets/character/';
    useEffect(()=>{
      document.documentElement.setAttribute('data-theme', theme);
      if (isLoggedIn){
        fetchCurrentNavbarElement();
      }
    }, [isLoggedIn, theme]);

    const toggleTheme = () => {
      setTheme(theme === 'light' ? 'dark' : 'light');
    };
    
    const fetchCurrentNavbarElement = async () => {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)access_token_cookie\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const csrfToken = document.cookie.replace(/(?:(?:^|.*;\s*)csrf_access_token\s*\=\s*([^;]*).*$)|^.*$/, "$1"); 
      try {
        const response = await fetch("http://127.0.0.1:5000/api/navbarAvatar", {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": csrfToken,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch avatar");
        }
        const data = await response.json();
        setAvatar(data.avatar);
        setFrame(data.frame)
      } catch (error) {
        console.error("Error fetching avatar:", error);
      }
    };

    return (
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container>
          <Navbar.Brand>
            <Link to='/'>LevelUp Life</Link></Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {isLoggedIn ? (
                <>
                  <Nav.Link>
                    <Link to="/home">Home</Link>
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
            <Nav>
              <Nav.Link className="ml-2">
                <button onClick={toggleTheme} className={`bi bi-${theme === 'light' ? 'moon' : 'sun'}`}>
                  Toggle Theme
                </button>
              </Nav.Link>
            </Nav>
            <Nav>
              
              {isLoggedIn && (
                <Nav.Link>
                <Link to="/avatar">
                <Navbar.Brand>
                  <div className="avatar-frame">
                    <img
                        src={`${path}${avatar}`}
                        alt="Avatar"
                        id='nav-avatar'
                        className="avatar-image"/>
                    <img
                        src={`${framePath}${frame}`}
                        alt="Frame"
                        className="frame-image"/>
                    </div>
                </Navbar.Brand>
                </Link>
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }

  export default NavBar;
