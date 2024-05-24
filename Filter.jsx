const Filter = ({ newSearch, handleSearch }) => (
    <div>
      filter shown with <input value={newSearch} onChange={handleSearch} />
    </div>
  )

export default Filter