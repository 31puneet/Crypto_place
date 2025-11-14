import React, { useMemo } from 'react'
import { Chart } from 'react-google-charts'
import './MiniChart.css'

// Deterministic pseudo-random generator based on symbol
const seedFrom = (s) => {
  let h = 0
  for(let i=0;i<s.length;i++) h = (h<<5) - h + s.charCodeAt(i)
  return Math.abs(h)
}

const generateSeries = (symbol, baseValue) => {
  const seed = seedFrom(symbol || 'x')
  const rnd = (n) => {
    // simple linear congruential
    const v = (seed * 9301 + 49297 + n * 233) % 233280
    return v / 233280
  }
  const points = []
  const now = Date.now()
  const base = baseValue != null ? baseValue : (50 + (seed % 300))
  for(let i=9;i>=0;i--){
    const t = now - i * 24 * 60 * 60 * 1000
    const noise = (rnd(i) - 0.5) * (base * 0.06)
    const val = Math.max(0.1, +(base + noise).toFixed(2))
    points.push([t, val])
  }
  return { prices: points }
}

const MiniChart = ({ symbol, value }) => {
  const data = useMemo(()=>{
    const hist = generateSeries(symbol || '', value)
    const out = [["Date","Price"]]
    hist.prices.forEach(p => out.push([new Date(p[0]).toLocaleDateString().slice(0,-5), p[1]]))
    return out
  },[symbol, value])

  const options = {
    legend: 'none',
    chartArea: { left: 0, top: 4, width: '100%', height: '80%' },
    hAxis: { textPosition: 'none' },
    vAxis: { textPosition: 'none' },
    colors: ['#7c3aed'],
    lineWidth: 2,
    backgroundColor: 'transparent'
  }

  return (
    <div className="mini-chart">
      <Chart
        chartType='LineChart'
        data={data}
        options={options}
        width={'140px'}
        height={'60px'}
      />
    </div>
  )
}

export default MiniChart
