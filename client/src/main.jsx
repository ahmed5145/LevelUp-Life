import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { StatusProvider } from './components/StatusContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <StatusProvider>
      <App />
      </StatusProvider>
    </BrowserRouter> 
  </StrictMode>,
)
