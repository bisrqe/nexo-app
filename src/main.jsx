import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { SavedProvider } from './context/SavedContext.jsx'
import { MessagesProvider } from './context/MessagesContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { UserContentProvider } from './context/UserContentContext.jsx'
import { ProfileProvider } from './context/ProfileContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ProfileProvider>
            <SavedProvider>
              <MessagesProvider>
                <UserContentProvider>
                  <App />
                </UserContentProvider>
              </MessagesProvider>
            </SavedProvider>
          </ProfileProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
