import React, { useContext, useEffect, useState } from 'react'
import './stock.css'
import { useParams } from 'react-router-dom'
import { StockContext } from '../../context/StockContext'
import LineChart from '../../components/LineChart/LineChart'

const Stock = () => {
  const { symbol } = useParams()
  const { API_KEY, currency } = useContext(StockContext)
  const [profile, setProfile] = useState()
  const [quote, setQuote] = useState()
  const [historicalData, setHistoricalData] = useState()
  const [error, setError] = useState(null)

  const fetchProfile = async () => {
    try{
      setError(null)
      setProfile(undefined)
      const res = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${API_KEY}`)
      if(!res.ok){
        const txt = await res.text()
        throw new Error(`profile status ${res.status} ${txt}`)
      }
      const data = await res.json()
      setProfile(data)
    }catch(e){
      console.error('fetchProfile error', e)
      setError(e.message || String(e))
      setProfile(null)
    }
  }

  const fetchQuote = async () => {
    try{
      setError(null)
      setQuote(undefined)
      const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${API_KEY}`)
      if(!res.ok){
        const txt = await res.text()
        throw new Error(`quote status ${res.status} ${txt}`)
      }
      const data = await res.json()
      setQuote(data)
    }catch(e){
      console.error('fetchQuote error', e)
      setError(e.message || String(e))
      setQuote(null)
    }
  }

  const fetchHistorical = async () => {
    try{
      setError(null)
      setHistoricalData(undefined)
      const to = Math.floor(Date.now()/1000)
      const from = to - (10 * 24 * 60 * 60) // last 10 days
      const res = await fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=D&from=${from}&to=${to}&token=${API_KEY}`)
      if(!res.ok){
        const txt = await res.text()
        // don't block the UI for candle permission issues; fall back to placeholder
        console.warn('candle fetch non-ok', res.status, txt)
        const base = quote && quote.c ? parseFloat(quote.c) : undefined
        setHistoricalData(generatePlaceholder(symbol, base))
        return
      }
      const data = await res.json()
      // Convert Finnhub candles to {prices: [[ms, price], ...]}
      if(data && data.s === 'ok' && Array.isArray(data.t) && Array.isArray(data.c)){
        const prices = data.t.map((ts, idx)=>[ts*1000, data.c[idx]])
        setHistoricalData({prices})
      }else{
        // empty or error state from API -> placeholder
        const base = quote && quote.c ? parseFloat(quote.c) : undefined
        setHistoricalData(generatePlaceholder(symbol, base))
      }
    }catch(e){
      console.error('fetchHistorical error', e)
      // fallback to generated placeholder so UI still shows a coin-like chart
      const base = quote && quote.c ? parseFloat(quote.c) : undefined
      setHistoricalData(generatePlaceholder(symbol, base))
    }
  }

  // Generate deterministic placeholder historical data when real candles are unavailable
  const generatePlaceholder = (sym, baseValue) => {
    const seedFrom = (s) => {
      let h = 0
      for(let i=0;i<s.length;i++) h = (h<<5) - h + s.charCodeAt(i)
      return Math.abs(h)
    }
    const seed = seedFrom(sym || 'x')
    const rnd = (n) => {
      const v = (seed * 9301 + 49297 + n * 233) % 233280
      return v / 233280
    }
    const now = Date.now()
    const base = baseValue != null ? baseValue : (50 + (seed % 300))
    const prices = []
    for(let i=9;i>=0;i--){
      const t = now - i * 24 * 60 * 60 * 1000
      const noise = (rnd(i) - 0.5) * (base * 0.06)
      const val = Math.max(0.1, +(base + noise).toFixed(2))
      prices.push([t, val])
    }
    return {prices}
  }

  useEffect(()=>{
    fetchProfile();
    fetchQuote();
    fetchHistorical();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[symbol, currency])

  if(error){
    return (
      <div className='stock-detail'>
        <div style={{padding:40, textAlign:'center'}}>
          <h2>Failed to load stock data</h2>
          <p>{String(error)}</p>
          <button onClick={()=>{ setError(null); fetchProfile(); fetchQuote(); fetchHistorical(); }}>Retry</button>
        </div>
      </div>
    )
  }

  if(profile && quote && historicalData){
    const currentPriceUSD = quote.c != null ? parseFloat(quote.c) : null
    // convert using exchangerate.host? StockContext already converted when listing, but here we show USD and symbol
    return (
      <div className='stock-detail'>
        <div className='stock-name'>
          {profile.logo && <img src={profile.logo} alt='' />}
          <p><b>{profile.name || symbol} ({symbol})</b></p>
        </div>

        <div className='stock-chart'>
          <LineChart historicalData={historicalData} />
        </div>

        <div className='stock-info'>
          <ul>
            <li>Current Price (USD)</li>
            <li>{currentPriceUSD != null ? `$ ${currentPriceUSD.toLocaleString()}` : '-'}</li>
          </ul>
          <ul>
            <li>Previous Close</li>
            <li>{quote.pc != null ? `$ ${quote.pc.toLocaleString()}` : '-'}</li>
          </ul>
          <ul>
            <li>High (day)</li>
            <li>{quote.h != null ? `$ ${quote.h.toLocaleString()}` : '-'}</li>
          </ul>
          <ul>
            <li>Low (day)</li>
            <li>{quote.l != null ? `$ ${quote.l.toLocaleString()}` : '-'}</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className='spinner'>
      <div className="spin"></div>
    </div>
  )
}

export default Stock
