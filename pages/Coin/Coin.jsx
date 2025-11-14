import React, { useContext, useEffect, useState } from 'react'
import './Coin.css'
import { useParams } from 'react-router-dom'
import { CoinContext } from '../../context/CoinContext';
import LineChart from '../../components/LineChart/LineChart';


const Coin = () => {

  const {coinId} = useParams();
  const [coinData, setCoinData] = useState();
  const [historicalData, setHistoricalData] = useState();
  const [fetchError, setFetchError] = useState(null)
  const {currency, API_KEY} = useContext(CoinContext);

  const fetchCoinData = async ()=>{
    const options = {
      method: 'GET',
      headers: {accept: 'application/json', 'x-cg-demo-api-key': API_KEY}
    };
    
    try{
      setFetchError(null)
      setCoinData(undefined)
      console.log('fetchCoinData: requesting', coinId)
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`, options)
      console.log('fetchCoinData: status', response.status)
      if(!response.ok){
        const txt = await response.text()
        console.error('fetchCoinData non-ok response:', response.status, txt)
        setFetchError(`Coin fetch failed: ${response.status}`)
        setCoinData(null)
        return
      }
      const data = await response.json()
      console.log('fetchCoinData: got', data && data.id)
      setCoinData(data)
    }catch(err){
      console.error('fetchCoinData error:', err)
      setFetchError(err.message || String(err))
      setCoinData(null)
    }
  }

  const fetchHistoricalData = async ()=>{
    const options = {
      method: 'GET',
      headers: {accept: 'application/json', 'x-cg-demo-api-key': API_KEY}
    };
    
    try{
      setFetchError(null)
      setHistoricalData(undefined)
      console.log('fetchHistoricalData: requesting', coinId, 'vs', currency.name)
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${currency.name}&days=10&interval=daily`, options)
      console.log('fetchHistoricalData: status', response.status)
      if(!response.ok){
        const txt = await response.text()
        console.error('fetchHistoricalData non-ok response:', response.status, txt)
        setFetchError(`Historical data fetch failed: ${response.status}`)
        setHistoricalData(null)
        return
      }
      const data = await response.json()
      console.log('fetchHistoricalData: got', data && data.prices && data.prices.length)
      setHistoricalData(data)
    }catch(err){
      console.error('fetchHistoricalData error:', err)
      setFetchError(err.message || String(err))
      setHistoricalData(null)
    }
  }

  useEffect(()=>{
    fetchCoinData();
    fetchHistoricalData();
    // run whenever currency OR coinId changes
  },[currency, coinId])

if(fetchError){
  return (
    <div className='coin'>
      <div style={{padding:40, textAlign:'center'}}>
        <h2>Failed to load coin data</h2>
        <p>{String(fetchError)}</p>
        <button onClick={()=>{ setFetchError(null); fetchCoinData(); fetchHistoricalData(); }}>Retry</button>
      </div>
    </div>
  )
}

if(coinData && historicalData){
  return (
    <div className='coin'>
      <div className="coin-name">
        <img src={coinData.image.large} alt="" />
        <p><b>{coinData.name} ({coinData.symbol.toUpperCase()})</b></p>
      </div>
      <div className="coin-chart">
        <LineChart historicalData={historicalData}/>
      </div>

    <div className="coin-info">
      <ul>
        <li>Crypto Market Rank</li>
        <li>{coinData.market_cap_rank}</li>
      </ul>
      <ul>
        <li>Current Price</li>
        <li>{currency.symbol} {coinData.market_data.current_price[currency.name].toLocaleString()}</li>
      </ul>
      <ul>
        <li>Market cap</li>
        <li>{currency.symbol} {coinData.market_data.market_cap[currency.name].toLocaleString()}</li>
      </ul>
      <ul>
        <li>24 Hour high</li>
        <li>{currency.symbol} {coinData.market_data.high_24h[currency.name].toLocaleString()}</li>
      </ul>
      <ul>
        <li>24 Hour low</li>
        <li>{currency.symbol} {coinData.market_data.low_24h[currency.name].toLocaleString()}</li>
      </ul>
    </div>

    </div>
  )
}else{
  return (
    <div className='spinner'>
      <div className="spin"></div>
    </div>
  )
}
  
}

export default Coin
