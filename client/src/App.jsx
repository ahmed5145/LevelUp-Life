import React, {useState} from 'react'
import './App.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import GoogleLogin from './GoogleLogin'

function App() {
  const cId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return (
    <>
      <h1>LevelUpLife</h1>
      <div className="App">
        <header className='Appheader'>
          <GoogleOAuthProvider clientId= {cId}>
            <GoogleLogin />
          </GoogleOAuthProvider>
        </header>
      </div>
    </>
  )
}

export default App
