import React, { useState } from 'react';
import SearchResultsComponent from './SearchResultsComponent';

function SearchPage() {
  const [itemType, setItemType] = useState('Book');
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);

  const searchItems = async () => {
    const response = await fetch(
      `/api/searchItems?searchTerm=${encodeURIComponent(searchTerm)}&itemType=${itemType}`
    );
    const data = await response.json();
    setResults(data);
  };

  return (
    <div>
      <h1>Search Items</h1>
      <select value={itemType} onChange={(e) => setItemType(e.target.value)}>
        <option value="Book">Book</option>
        <option value="Media">Media</option>
        <option value="Device">Device</option>
      </select>
      <input
        type="text"
        placeholder="Enter search term..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={searchItems}>Search</button>
      <SearchResultsComponent results={results} />
    </div>
  );
}

export default SearchPage;
