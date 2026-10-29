import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ObavijestiProvider } from './components/Obavijesti.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ObavijestiProvider>
        <App />
      </ObavijestiProvider>
    </BrowserRouter>
  </StrictMode>,
)
