import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ObavijestiProvider } from './components/zajednicko/Obavijesti.jsx'
import { AuthProvider } from './components/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ObavijestiProvider>
          <App />
        </ObavijestiProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
