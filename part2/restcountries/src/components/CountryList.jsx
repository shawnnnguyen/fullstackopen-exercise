const CountryList = ({ countries }) => (
  <ul>
    {countries.map((country) => (
      <li key={country.name.common}>{country.name.common}</li>
    ))}
  </ul>
)

export default CountryList
