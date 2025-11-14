import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import CoinContextProvider from './context/CoinContext.jsx'
import StockContextProvider from './context/StockContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CoinContextProvider>
        <StockContextProvider>
          <App />
        </StockContextProvider>
      </CoinContextProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
