import React, { useState, useEffect, useContext } from 'react'
import './stock-home.css'
import { StockContext } from '../../context/StockContext'
import { Link } from 'react-router-dom'
import MiniChart from '../../components/MiniChart/MiniChart'

const StockHome = () => {
  const { allStock, currency, isLoading, error } = useContext(StockContext)
  const [displayStock, setDisplayStock] = useState([])
  const [input, setInput] = useState('')

  const inputHandler = (e) => {
    setInput(e.target.value)
  }

  const searchHandler = (e) => {
    e.preventDefault()
    const coins = allStock.filter((item)=>{
      return (item.name || item.symbol).toLowerCase().includes(input.toLowerCase())
    })
    setDisplayStock(coins)
  }

  useEffect(()=>{
    setDisplayStock(allStock)
  },[allStock])

  return (
    <div className='home'>
      <div className="hero">
        <h1>Largest <br/> Stock Marketplace</h1>
        <p>Welcome to the world's largest stock marketplace. Sign up to explore more about stocks.</p>
        <form onSubmit={searchHandler}>

          <input onChange={inputHandler} list='stocklist' value={input} type="text" placeholder='Search stock..' />

          <datalist id='stocklist'>
            {allStock.map((item, index)=>(<option key={index} value={item.symbol}/>))}
          </datalist>

          <button type="submit">Search</button>
        </form>
      </div>

      <div className="crypto-table">
        <div className="table-layout">
          <p>#</p>
          <p>Stock</p>
          <p>Price</p>
          <p style={{textAlign:"center"}}>24H Change</p>
          <p className='market-cap'>Market Cap</p>
        </div>

        {isLoading && (
          <div className="table-layout">
            <p colSpan={5} style={{opacity: 0.9}}>Loading stocks...</p>
          </div>
        )}

        {!isLoading && (displayStock && displayStock.length > 0) && (
          displayStock.map((item, index)=>(
            <Link to={`/stock/${encodeURIComponent(item.symbol)}`} key={index} className="table-link">
              <div className="table-layout">
                <p>{index+1}</p>
                <div>
                  <img src={item.image || ''} alt="" />
                  <p>{item.name + " - " + item.symbol}</p>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:12}}>
                  <MiniChart symbol={item.symbol || ('s'+index)} value={item.current_price || undefined} />
                  <p style={{minWidth:100}}>{currency.symbol} {item.current_price ? item.current_price.toLocaleString() : '-'}</p>
                </div>
                <p className={item.price_change_percentage_24h>0?"green":"red"}>
                  {item.price_change_percentage_24h}</p>
                <p className='market-cap'>{currency.symbol} {item.market_cap? item.market_cap.toLocaleString() : '-'}</p>
              </div>
            </Link>
          ))
        )}

        {!isLoading && error && (
          <div className="table-layout" style={{color: 'tomato'}}>
            <p colSpan={5} style={{opacity: 0.9}}>Failed to load stocks: {error}</p>
          </div>
        )}

        {!isLoading && !error && (!displayStock || displayStock.length === 0) && (
          <div className="table-layout">
            <p colSpan={5} style={{opacity: 0.8}}>No stocks available yet. Try refreshing or wait a moment (API rate limit may apply).</p>
          </div>
        )}

      </div>
    </div>
  )
}

export default StockHome
