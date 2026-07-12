import { useState, useEffect } from 'react'
import personService from './services/persons'
import PersonForm from './components/PersonForm'
import Filter from './components/Filter'
import Persons from './components/Persons'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [fitlerName, setFilterName] = useState('')

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])


  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleNameFilter = (event) => {
    setFilterName(event.target.value)
  }

  const addPerson = (event) => {
    event.preventDefault()

    const nameExisted = persons.some(person => person.name.toLowerCase() === newName.toLowerCase())

    if(nameExisted) {
      alert(`${newName} is already added to phonebook`)
      setNewName('')
      return
    }

    const personObject = {
      name : newName,
      number : newNumber
    }

    personService
      .create(personObject)
      .then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
        setNewName('')
        setNewNumber('')
      })
  }

  const personToShow = fitlerName === ''
    ? persons
    : persons.filter(person => person.name.toLowerCase().includes(fitlerName.toLowerCase()))

  return (
    <div>
      <h2>Phonebook</h2>
      <Filter value={fitlerName} onChange={handleNameFilter}/>
      <h4>add a new</h4>
      <PersonForm 
        onSubmit={addPerson}
        nameValue={newName}
        numberValue={newNumber}
        nameOnChange={handleNameChange}
        numberOnChange={handleNumberChange}/>
      <h4>Numbers</h4>
      <Persons persons={personToShow}/>
    </div>
  )
}

export default App