const Persons = ({ persons, newSearch, deletePerson }) => {
    const filteredPersons = persons.filter((person) =>
      person.name.toLowerCase().includes(newSearch.toLowerCase())
    )
    return (
      <ul>
        {filteredPersons.map((person) => (
          <li key={person.id}>
            {person.name} {person.number}
            <button onClick={() => deletePerson(person.id)}>delete</button>
          </li>
        ))}
      </ul>
    )
  }

export default Persons