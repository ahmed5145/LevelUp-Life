import React, { useEffect, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleLogin from './GoogleLogin';
import TaskManager from './components/TaskManager';
import Signup from './Signup';
import Login from './Login';
import { BrowserRouter as Router, Route, Routes, useNavigate, createBrowserRouter } from 'react-router-dom';
import GetCharacter from './components/Characters';
import NavBar from './components/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Status from "./components/status";
import axios from "axios";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import HabitManager from "./components/HabitManager";
import RewardsManager from "./components/RewardsManager";
import { useStatus } from './components/StatusContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const cId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const {resetStatus} = useStatus();
  const {fetchStatus} = useStatus();

  useEffect(() => {
    checkAccessToken();
  }, []);

  // Function to check access token and manage user session
  const checkAccessToken = async () => {
    const tokenExists = document.cookie.includes("access_token_cookie");
    const storedUser = localStorage.getItem("user");

    if (tokenExists && storedUser) {
      try {
        const response = await axios.get("https://levelup-life-3.onrender.com/api/validate", {
          withCredentials: true,
        });

        if (response.status === 200) {
          await fetchStatus();
          setIsLoggedIn(true);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        handleApiError(error);
      }
    } else if (!tokenExists && storedUser) {
      alert("Session expired. Please log in again.");
      handleLogout();
    }
  };

  const handleApiError = (error) => {
    if (
      error.response?.status === 401 &&
      error.response?.data?.msg === "The token has expired. Please log in again."
    ) {
      alert("Session expired. Please log in again.");
      handleLogout();
    } else {
      console.error("API error:", error);
    }
  };

  const handleLoginSuccess = async (response) => {

    if (response) {
      await fetchStatus();
      setUser(response);
    } else {
      setUser(null);
    }
    setIsLoggedIn(true);
    try {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify(response));
    } catch (error) {
      console.error("Error adding to local storage:", error);
    }
    navigate("/home");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    resetStatus();
    navigate("/");
  };

  return (
    <>
      <NavBar isLoggedIn={isLoggedIn} handleLogout={handleLogout} navigate={navigate} />
      <div>
        <Routes>
          <Route
            path="/"
            element={
              <header className="Appheader">
                <GoogleOAuthProvider clientId={cId}>
                  {!isLoggedIn ? (
                    <>
                      <GoogleLogin onLoginSuccess={handleLoginSuccess} />
                      <button onClick={() => navigate("/signup")}>Signup</button>
                      <button onClick={() => navigate("/login")}>Login</button>
                    </>
                  ) : (
                    <button onClick={handleLogout}>Logout</button>
                  )}
                </GoogleOAuthProvider>
              </header>
            }
          />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route
            path="/home"
            element={
              isLoggedIn ? (
                <>
                  <Status />
                  <Container>
                    <Row>
                      <Col>
                        <div>
                          <TaskManager />
                        </div>
                      </Col>
                      <Col>
                        <div>
                          <HabitManager />  
                        </div>
                      </Col>
                      <Col>
                        <div>
                        <RewardsManager />
                        </div>
                      </Col>
                    </Row>
                  </Container>
                  <ToastContainer />

                  
                </>
              ) : (
                <h2>Please login to access tasks</h2>
              )
            }
          />
          <Route path="/avatar" element={<GetCharacter />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
