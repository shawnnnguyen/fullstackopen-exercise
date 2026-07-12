import { useEffect, useState } from 'react'
import countryService from './services/countries'
import CountryList from './components/CountryList'
import CountryDetail from './components/CountryDetail'

const App = () => {
  const [countries, setCountries] = useState([])
  const [query, setQuery] = useState('')
  const [matches, setMatches] = useState([])
  const [country, setCountry] = useState(null)

  useEffect(() => {
    countryService.getAll().then(setCountries)
  }, [])

  useEffect(() => {
    setMatches(
      query
        ? countries.filter((c) =>
            c.name.common.toLowerCase().includes(query.toLowerCase())
          )
        : []
    )
  }, [countries, query])

  useEffect(() => {
    if (matches.length !== 1) {
      setCountry(null)
      return
    }

    countryService
      .getByName(matches[0].name.common)
      .then(setCountry)
  }, [matches])

  const handleChange = (event) => {
    setQuery(event.target.value)
  }

  return (
    <div>
      <div>
        <label htmlFor="find-country">find country </label>
        <input id="find-country" value={query} onChange={handleChange} />
      </div>
      {matches.length > 10 && <p>Too many matches</p>}
      {matches.length > 1 && matches.length <= 10 && (
        <CountryList countries={matches} />
      )}
      {matches.length === 1 && country && <CountryDetail country={country} />}
    </div>
  )
}

export default App
