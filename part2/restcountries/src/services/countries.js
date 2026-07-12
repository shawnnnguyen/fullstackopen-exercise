import axios from 'axios'

const baseUrl = 'https://studies.cs.helsinki.fi/restcountries/api'

const getAll = () => {
  return axios
    .get(`${baseUrl}/all`, {
      params: {
        fields: 'name,capital,population,area,flags,languages',
      },
    })
    .then((response) => response.data)
}

const getByName = (name) => {
  return axios
    .get(`${baseUrl}/name/${name}`, {
      params: { fullText: true },
    })
    .then((response) => response.data)
}

export default { getAll, getByName }
