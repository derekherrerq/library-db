import React from 'react';

function SearchResultsComponent({ results }) {
  if (results.length === 0) {
    return <p>No results found.</p>;
  }

  return (
    <div>
      <h2>Search Results</h2>
      <ul>
        {results.map((item) => (
          <li key={item.Identifier}>
            <strong>{item.Title}</strong>
            <br />
            {item.Author && <span>Author: {item.Author}<br /></span>}
            {item.Director && <span>Director: {item.Director}<br /></span>}
            {item.Brand && <span>Brand: {item.Brand}<br /></span>}
            Identifier: {item.Identifier}
            <br />
            Total Copies: {item.TotalCopies}, Available: {item.AvailableCopies}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchResultsComponent;