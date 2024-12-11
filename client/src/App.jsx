import React, {useState} from 'react'
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

  const handleLoginSuccess = (response) => {
    setUser(response);
    setIsLoggedIn(true);
    navigate('/home');
  };

  return (
    <>
      <h1>LevelUpLife</h1>
      <div className="App">
        <header className='Appheader'>
          <GoogleOAuthProvider clientId={cId}>
            {!isLoggedIn? (
              <GoogleLogin onLoginSuccess={handleLoginSuccess} />
            ):(
              <button onClick={() => setIsLoggedIn(false)}>Logout</button>
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
