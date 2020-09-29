import React, { useEffect, useState } from 'react'
import './App.css'
import axios from 'axios'

function App() {
  const [bigMacData, setBigMacData] = useState(null)
  const [ip, setIPV4Adress] = useState(null)
  const [country, setCountry] = useState('canada')
  const [value, setValue] = useState('')

  const [randomLocalPrice, setRandomLocalPrice] = useState('')
  const [randomDollarPrice, setRandomDollarPrice] = useState('')
  const [randomCountry, setRandomCountry] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // Handles grabbing data from nodejs server
  useEffect(() => {
    const getData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/')

        const {
          data: { results, ip },
        } = res

        setLoading(false)

        setIPV4Adress(ip)

        setBigMacData(results)
      } catch (error) {
        console.error(error)
        setError('Something went wrong fetching the data')
      }
    }

    getData()
  }, [])

  // Handles grabbing country data from 3rd party API using the IP returned
  useEffect(() => {
    const getData = async () => {
      const res = await axios.get(`https://ipvigilante.com/json/${ip}`)
      // Handle res, destructure country, might need to parse JSON
      console.log({ res })

      setLoading(false)

      setCountry('canada')

      // The API was down on 2020-09-28 so I wasn't able to finish grabbing the country data.
    }

    if (ip) {
      getData()
    }
  }, [ip])

  // Determines and sets state for the random country
  useEffect(() => {
    const getRandomCountry = (max) => {
      const slicedAt = Math.floor(Math.random() * Math.floor(max))
      const slicedFrom = slicedAt + 1

      const [random] = bigMacData.slice(slicedAt, slicedFrom)

      setRandomLocalPrice(random['Local price'])
      setRandomDollarPrice(random['Dollar price'])
      setRandomCountry(random['Country'])
    }

    if (bigMacData) {
      getRandomCountry(bigMacData.length)
    }
  }, [bigMacData])

  // Get Purchase Parity of Local Country
  const getPurchaseParity = () => {
    const purchaseParity = bigMacData
      .filter((result) => result.Country.toLowerCase() === country.toLowerCase())
      // Sort by latest date (could easily change to average)
      .sort((a, b) => new Date(b.Date) - new Date(a.Date))

    return purchaseParity[0]['Dollar PPP']
  }

  // Get Dollar Price of Local Country
  const getDollarPrice = () => {
    const dollarPrice = bigMacData
      .filter((result) => result.Country.toLowerCase() === country.toLowerCase())
      // Sort by latest date (could easily change to average)
      .sort((a, b) => new Date(b.Date) - new Date(a.Date))

    return dollarPrice[0]['Dollar price']
  }

  // Get Local Price of Local Country
  const getLocalPrice = () => {
    const localPrice = bigMacData
      .filter((result) => result.Country.toLowerCase() === country.toLowerCase())
      // Sort by latest date (could easily change to average)
      .sort((a, b) => new Date(b.Date) - new Date(a.Date))

    return localPrice[0]['Local price']
  }

  // Calc how many big macs you can buy in random country with input
  const calculateBigMacs = (value) => {
    const numberOfBigMacs = (value / getLocalPrice()) * (getDollarPrice() / randomDollarPrice)
    return numberOfBigMacs.toFixed(2)
  }

  const calcDollarValueInRandomCountry = (value) => {
    const dollarValue = (value * getDollarPrice()) / randomDollarPrice
    return dollarValue.toFixed(2)
  }

  if (error) {
    return (
      <div className='App'>
        <header>Sorry something went wrong!</header>
      </div>
    )
  }

  if (loading) return <div>...loading</div>

  return (
    <div className='App'>
      <header>
        <h1>
          You are in <strong>{country}</strong>
        </h1>

        <span>Please enter an amount of money in your local currency</span>
        <input type='text' value={value} onChange={(e) => setValue(e.target.value)} />
      </header>
      <section>
        <h2>Local results </h2>
        {bigMacData && (
          <p>
            {!value ? (
              <span>No McDonalds for you</span>
            ) : (
              <>
                You could buy <strong>{calculateBigMacs(value)}</strong> of Big Macs in your country
              </>
            )}
          </p>
        )}

        {bigMacData && (
          <p>
            Your Dollar Purchasing Parity(PPP) is <strong>{getPurchaseParity()}</strong>
          </p>
        )}
      </section>
      <footer>
        {bigMacData && (
          <>
            <h2>Results compared to {randomCountry}</h2>
            <p>Random Country: {randomCountry} </p>

            {!value ? (
              <p>...calculating burgers</p>
            ) : (
              <>
                <span>
                  You could buy <strong>{calculateBigMacs(value)}</strong> of Big Macs in {randomCountry} with ${value}!
                </span>
                <br />
                <small>
                  Your <strong>{value}</strong> is worth about <strong>{calcDollarValueInRandomCountry(value)} </strong>
                  in {randomCountry}
                </small>
              </>
            )}
          </>
        )}
      </footer>
    </div>
  )
}

export default App
