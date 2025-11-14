import { createContext, useEffect, useState, useContext } from "react";
import { CoinContext } from "./CoinContext";

export const StockContext = createContext();

const StockContextProvider = (props) => {

    // Finnhub details (user provided key) — reverting to previous approach
    const API_KEY = 'd4bpnvhr01qoua30vjdgd4bpnvhr01qoua30vje0'
    const BASE = 'https://finnhub.io/api/v1'

    const [allStock, setAllStock] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Reuse the currency from CoinContext so changing currency updates both markets
    const { currency } = useContext(CoinContext)

    // Default tracked symbols — expanded list
    const trackedSymbols = [
        'AAPL','MSFT','TSLA','AMZN','GOOGL','NVDA','META','BRK.B','JNJ','V',
        'PG','DIS','MA','PYPL','ADBE','CSCO','INTC','CRM','NFLX','ORCL'
    ]

        // No placeholders: fetch real data on mount or when currency changes

    // Helper: fetch quote from Finnhub
    const fetchQuote = async (symbol) => {
        const url = `${BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${API_KEY}`
        const res = await fetch(url)
        if(!res.ok) throw new Error(`quote ${symbol} status ${res.status}`)
        const data = await res.json()
        // data: {c: current, h, l, o, pc: prev close, t}
        return data
    }

    // Helper: fetch company profile (name, logo, marketCapitalization)
    const fetchProfile = async (symbol) => {
        const url = `${BASE}/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${API_KEY}`
        const res = await fetch(url)
        if(!res.ok) throw new Error(`profile ${symbol} status ${res.status}`)
        const data = await res.json()
        return data
    }

    // Helper: fetch forex rate (USD -> target) using exchangerate.host (free)
    const fetchFxRate = async (toCurrency) => {
        if(!toCurrency || toCurrency.toLowerCase() === 'usd') return 1
        try{
            const res = await fetch(`https://api.exchangerate.host/latest?base=USD&symbols=${encodeURIComponent(toCurrency.toUpperCase())}`)
            if(!res.ok) throw new Error('fx status ' + res.status)
            const data = await res.json()
            const rate = data && data.rates && data.rates[toCurrency.toUpperCase()]
            return rate ? parseFloat(rate) : 1
        }catch(e){
            console.error('fetchFxRate error', e)
            return 1
        }
    }

    const sleep = (ms) => new Promise(res => setTimeout(res, ms))

    
        const fetchAllStock = async ()=>{
            try{
                    console.log('[StockContext] fetchAllStock start', trackedSymbols.length)
                    setIsLoading(true)
                    setError(null)
                    let fxRate = 1
                    try{
                        fxRate = await fetchFxRate(currency.name)
                    }catch(e){
                        console.warn('[StockContext] FX fetch failed, defaulting to 1', e)
                        fxRate = 1
                    }

                    const results = []
                    // Sequentially fetch each symbol with a short delay to reduce rate-limit issues
                    for(const sym of trackedSymbols){
                        console.log('[StockContext] fetching', sym)
                        try{
                            const [quote, profile] = await Promise.all([fetchQuote(sym), fetchProfile(sym)])
                            console.log('[StockContext] fetched', sym, quote, profile)
                            const priceUSD = (quote && quote.c) ? parseFloat(quote.c) : null
                            const prevClose = (quote && quote.pc) ? parseFloat(quote.pc) : null
                            const changePercent = (priceUSD != null && prevClose != null) ? ((priceUSD - prevClose)/ (prevClose||1) * 100) : 0
                            const convertedPrice = priceUSD != null ? +(priceUSD * fxRate) : null
                            const convertedPrev = prevClose != null ? +(prevClose * fxRate) : null

                            results.push({
                                symbol: sym,
                                name: profile && profile.name ? profile.name : sym,
                                image: profile && profile.logo ? profile.logo : null,
                                current_price: convertedPrice,
                                previous_close: convertedPrev,
                                price_change_percentage_24h: +(Math.round(changePercent * 100)/100),
                                market_cap: profile && profile.marketCapitalization ? profile.marketCapitalization : null
                            })
                        }catch(e){
                            console.error('[StockContext] fetch error for', sym, e)
                            results.push({ symbol: sym, name: sym, image:null, current_price:null, previous_close:null, price_change_percentage_24h:0, market_cap:null })
                        }
                        // throttle between requests (350ms)
                        await sleep(350)
                    }

                    console.log('[StockContext] fetchAllStock done, items', results.length)
                    setAllStock(results)
                }catch(err){
                    console.error('[StockContext] Failed fetching stocks (finnhub outer)', err)
                    setError(err.message || String(err))
                    // keep whatever results we accumulated rather than wiping out
                }finally{
                    console.log('[StockContext] fetchAllStock finally')
                    setIsLoading(false)
                }
        }

    useEffect(()=>{
        fetchAllStock();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[currency])

    const contextValue = {
        allStock, currency, fetchAllStock, API_KEY, BASE, isLoading, error
    }

    return (
        <StockContext.Provider value={contextValue}>
            {props.children}
        </StockContext.Provider>
    )
}

export default StockContextProvider;
