import React, { useEffect, useState } from 'react';
import './App.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleLogin from './GoogleLogin';
import TaskManager from './components/TaskManager';
import Signup from './Signup';
import Login from './Login';
import { BrowserRouter as Router, Route, Routes, useNavigate, createBrowserRouter } from 'react-router-dom';
import GetCharacter from './components/Characters';
import NavBar from './components/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import Status from "./components/status";

function App() {
  const cId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInStatus = localStorage.getItem("isLoggedIn");
    const storedUser = localStorage.getItem("user");
    if (loggedInStatus === "true" && storedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser));
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);

  const handleLoginSuccess = (response) => {
    if (response){
      setUser(response)
    } else{
      setUser(null);
    }
    setIsLoggedIn(true);
    try {
      localStorage.setItem("isLoggedIn", true);
      localStorage.setItem("user", JSON.stringify(response));
    } catch (error) {
      console.error("Error adding to local storage");
    }
    navigate("/home");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <>
      <NavBar
        isLoggedIn={isLoggedIn}
        handleLogout={handleLogout}
        navigate={navigate}
      />
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
          <Route
            path="/login"
            element={<Login onLoginSuccess={handleLoginSuccess} />}
          />
          <Route
            path="/home"
            element={
              isLoggedIn ? (
                <>
                  <TaskManager />
                  <Status />
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