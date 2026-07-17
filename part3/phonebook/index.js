const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())

morgan.token('body', (request) => JSON.stringify(request.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
  {
    "id": "1",
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": "2",
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": "3",
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": "4",
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

const generateId = () => Math.floor(Math.random() * 1000000).toString()

app.post('/api/persons', (request, response) => {
  const { name, number } = request.body

  if (!name || !number) {
    return response.status(400).json({
      error: 'name or number is missing'
    })
  }

  if (persons.some(person => person.name === name)) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }

  const person = {
    name,
    number,
    id: generateId()
  }
  persons.push(person)
  response.json(person)
})

app.get('/info', (request, response) => {
  response.send(`<p>Phonebook has info for ${persons.length} people</p>
  <p>${new Date()}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
  response.json(persons.find(person => person.id === request.params.id))
})

app.delete('/api/persons/:id', (request, response) => {
  persons = persons.filter(person => person.id !== request.params.id)
  response.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
