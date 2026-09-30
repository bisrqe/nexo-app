import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { SavedProvider } from './context/SavedContext.jsx'
import { DirectMessagesProvider } from './context/DirectMessagesContext.jsx'
import { GroupsProvider } from './context/GroupsContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { UserContentProvider } from './context/UserContentContext.jsx'
import { ProfileProvider } from './context/ProfileContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <ProfileProvider>
              <SavedProvider>
                <DirectMessagesProvider>
                  <GroupsProvider>
                    <UserContentProvider>
                      <App />
                    </UserContentProvider>
                  </GroupsProvider>
                </DirectMessagesProvider>
              </SavedProvider>
            </ProfileProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
