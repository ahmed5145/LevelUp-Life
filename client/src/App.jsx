import React, {useState} from 'react'
import './App.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import GoogleLogin from './GoogleLogin'
import TaskManager from './components/TaskManager'

function App() {
  const cId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <>
      <h1>LevelUpLife</h1>
      <div className="App">
        <header className='Appheader'>
          <GoogleOAuthProvider clientId={cId}>
            <GoogleLogin onLoginSuccess={handleLoginSuccess} />
          </GoogleOAuthProvider>
        </header>
        {isLoggedIn && <TaskManager />}
      </div>
    </>
  )
}

export default App
