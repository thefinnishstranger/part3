import { useEffect, useState } from 'react';
import personsService from './services/persons';
import Notification from './components/Notification';
import Persons from './components/Persons';
import Filter from './components/Filter';
import PersonForm from './components/PersonForm';
import './App.css';

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newSearch, setNewSearch] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    personsService
      .getAll()
      .then((initialPersons) => {
        // Map the returned data to assign _id to id
        const updatedPersons = initialPersons.map((person) => {
          return { ...person, id: person._id };
        });
        setPersons(updatedPersons);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setErrorMessage('Error fetching data');
        setTimeout(() => {
          setErrorMessage(null);
        }, 5000);
      });
  }, []);

  const addToContacts = (event) => {
    event.preventDefault();
    const lowerCaseInput = newName.toLowerCase();
    const existingContact = persons.find((person) => person.name.toLowerCase() === lowerCaseInput);
    const newContact = {
      name: newName,
      number: newNumber,
    };

    if (existingContact) {
      const confirmUpdate = window.confirm(
        `${newName} is already added to phonebook, replace the old number with a new one?`
      );
      if (confirmUpdate) {
        const updatedContact = {
          ...existingContact,
          number: newNumber,
        };
        personsService
          .update(existingContact.id, updatedContact)
          .then((updatedPerson) => {
            setPersons(
              persons.map((person) =>
                person.id !== existingContact.id ? person : updatedPerson
              )
            );
            setNewName('');
            setNewNumber('');
            setSuccessMessage(`Successfully updated ${newContact.name}'s number`);
            setTimeout(() => {
              setSuccessMessage(null);
            }, 5000);
          })
          .catch((error) => {
            console.error('Error updating contact: ', error);
            setErrorMessage('Error updating contact');
            setTimeout(() => {
              setErrorMessage(null);
            }, 5000);
          });
      }
    } else {
      personsService
        .create(newContact)
        .then((returnedPerson) => {
          setPersons(persons.concat(returnedPerson));
          setSuccessMessage(`${newContact.name} has been added`);
          setTimeout(() => {
            setSuccessMessage(null);
          }, 5000);
          setNewName('');
          setNewNumber('');
        })
        .catch((error) => {
          console.error('Error adding contact: ', error);
          setErrorMessage(error.response.data.error)
          //setErrorMessage('Error adding contact');
          setTimeout(() => {
            setErrorMessage(null);
          }, 5000);
        });
    }
  };


  const deletePerson = (id) => {
    const confirmed = window.confirm('Do you want to delete this contact?');
    console.log(id)
    
    if (confirmed) {
      personsService
        .delete(id) 
        .then(() => {
          setPersons(persons.filter((person) => person._id !== id)); 
          
          setSuccessMessage(`Contact has been deleted`);
          setTimeout(() => {
            setSuccessMessage(null);
          }, 5000);
        })
        .catch((error) => {
          console.error('Error deleting contact: ', error);
          setErrorMessage('Error deleting contact');
          setPersons(persons.filter((person) => person._id !== id)); 
          setTimeout(() => {
            setErrorMessage(null);
          }, 5000);
        });
    }
  };
  

  const handleNewName = (event) => {
    setNewName(event.target.value);
  };

  const handleNewNumber = (event) => {
    setNewNumber(event.target.value);
  };

  const handleSearch = (event) => {
    setNewSearch(event.target.value);
  };

  return (
    <div>
      <h1>Phonebook</h1>
      <div className='errorMessage'>
        <Notification message={errorMessage} />
      </div>
      <Filter newSearch={newSearch} handleSearch={handleSearch} />
      <h2>add a new</h2>
      <div className='successMessage'>
        <Notification message={successMessage} />
      </div>
      <PersonForm
        newName={newName}
        newNumber={newNumber}
        handleNewName={handleNewName}
        handleNewNumber={handleNewNumber}
        addToContacts={addToContacts}
      />
      <h2>Numbers</h2>
      <Persons persons={persons} newSearch={newSearch} deletePerson={deletePerson} />
    </div>
  );
};

export default App;
