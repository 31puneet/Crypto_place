import React from 'react'
import Navbar from './components/Navbar/Navbar'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import Coin from './pages/Coin/Coin'
import StockHome from './pages/Stock/stock-home'
import Stock from './pages/Stock/Stock'
import Footer from './components/Footer/Footer'

const App = () => {
  return (
    <div className='app'>
      <Navbar/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/coin/:coinId' element={<Coin/>}/>
        <Route path='/stock' element={<StockHome/>}/>
        <Route path='/stock/:symbol' element={<Stock/>}/>
      </Routes>
      <Footer/>
    </div>
  )
}

export default App