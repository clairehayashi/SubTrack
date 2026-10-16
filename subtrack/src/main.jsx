import './styles/tokens.css'
import { StrictMode } from 'react'
import { applyTheme, getInitialTheme } from './utils/theme'
applyTheme(getInitialTheme())
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
