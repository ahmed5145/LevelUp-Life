import React, {useEffect, useState} from 'react'
import './App.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import GoogleLogin from './GoogleLogin'
import TaskManager from './components/TaskManager'
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom'

function App() {
  const cId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [isLoggedIn, setIsLoggedIn]= useState(false);
  const [user, setUser]= useState(null);
  const navigate= useNavigate();

  useEffect( () =>{
    const loggedInStatus= localStorage.getItem("isLoggedIn");
    const storedUser= localStorage.getItem("user");
    console.log("Logged in ", loggedInStatus)
    console.log("Stored", storedUser)

    if (loggedInStatus=="true" && storedUser){
      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser));
    } else{
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);

  const handleLoginSuccess = (response) => {
    setUser(response);
    console.log(response)
    setIsLoggedIn(true);
    try {
      localStorage.setItem("isLoggedIn", true);
      localStorage.setItem("user", JSON.stringify(response));
    } catch (error) {
      console.log("Error adding to local storage"), 404
    }
    navigate("/home");
  };

  const handleLogout= () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('user');
    navigate("/")
  }

  return (
    <>
      <h1>LevelUpLife</h1>
      <div className="App">
        <header className='Appheader'>
          <GoogleOAuthProvider clientId={cId}>
            {!isLoggedIn? (
              <GoogleLogin onLoginSuccess={handleLoginSuccess} />
            ):(
              <button onClick={handleLogout}>Logout</button>
            )} 
          </GoogleOAuthProvider>
        </header>
        <Routes>
          <Route path="/home" element={isLoggedIn? <TaskManager />: <h2>Please login to access tasks</h2>}/>
        </Routes>
      </div>
    </>
  )
}

export default function AppWraper() {
  return (
    <Router>
      <App />
    </Router>
  )
}
