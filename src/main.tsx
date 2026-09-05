import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./styles/profile.css"
import "./styles/auth.css"
import "./styles/global.css"
import "./styles/tokens.css"
import "./styles/layout.css"
import "./styles/home.css"
import "./styles/items.css"
import App from './App.tsx'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from './app/store.ts'



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)


