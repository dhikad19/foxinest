import React from "react";

const SearchBar = ({ query, setQuery }) => (
  <input
    type="text"
    placeholder="🔍 Search title or category..."
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    style={{
      width: "100%",
      padding: 8,
      marginBottom: 20,
      borderRadius: 4,
      border: "1px solid #ccc",
    }}
  />
);

export default SearchBar;
