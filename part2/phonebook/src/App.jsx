import { useState, useEffect } from 'react'
import personService from './services/persons'
import PersonForm from './components/PersonForm'
import Filter from './components/Filter'
import Persons from './components/Persons'
import Notification from './components/Notification'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [fitlerName, setFilterName] = useState('')
  const [notification, setNotification] = useState(null)

  const notify = (message, type) => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

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
      if(window.confirm(`${newName} is already added to phonebook. Do you want to update the number?`)) {
        const person = persons.find(person => person.name.toLowerCase() === newName.toLowerCase())
        personService
          .put(person.id, {
            name : newName,
            number : newNumber
          })
          .then(returnedPerson => {
            setPersons(persons.map(p => p.id !== person.id ? p : returnedPerson))
            notify(`${newName}'s number has been updated`, 'success')
            setNewName('')
            setNewNumber('')
          })
          .catch(() => {
            notify(`Information of '${newName}' has already been removed from server`, 'error')
            setPersons(persons.filter(p => p.id !== person.id))
          })
      }
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
        notify(`${newName} has been added to phonebook`, 'success')
        setNewName('')
        setNewNumber('')
      })
      .catch(error => {
        notify(error.response?.data?.error || `Failed to add ${newName}`, 'error')
      })
  }

  const deletePerson = (id) => {
    const person = persons.find(person => person.id === id)

    if (!window.confirm(`Delete ${person.name}?`)) {
      return
    }

    personService
      .remove(id)
      .then(() => {
        setPersons(persons.filter(person => person.id !== id))
        notify(`${person.name} has been deleted`, 'success')
      })
      .catch(() => {
        notify(`Information of '${person.name}' has already been removed from server`, 'error')
        setPersons(persons.filter(person => person.id !== id))
      })
  }

  const personToShow = fitlerName === ''
    ? persons
    : persons.filter(person => person.name.toLowerCase().includes(fitlerName.toLowerCase()))

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notification?.message ?? null} type={notification?.type}/>
      <Filter value={fitlerName} onChange={handleNameFilter}/>
      <h4>add a new</h4>
      <PersonForm 
        onSubmit={addPerson}
        nameValue={newName}
        numberValue={newNumber}
        nameOnChange={handleNameChange}
        numberOnChange={handleNumberChange}/>
      <h4>Numbers</h4>
      <Persons persons={personToShow} deletePerson={deletePerson}/>
    </div>
  )
}

export default App