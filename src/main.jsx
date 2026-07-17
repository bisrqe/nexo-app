import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { SavedProvider } from './context/SavedContext.jsx'
import { MessagesProvider } from './context/MessagesContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <SavedProvider>
          <MessagesProvider>
            <App />
          </MessagesProvider>
        </SavedProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
