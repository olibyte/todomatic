// src/components/Todo/FilterButton.js
import React from 'react';

function FilterButton({ name, isPressed, setFilter, count }) {
  return (
    <button
      type="button"
      className={`btn toggle-btn ${isPressed ? "isPressed" : ""}`}
      aria-pressed={isPressed}
      onClick={() => setFilter(name)}
    >
      <span>{name} ({count})</span>
    </button>
  );
}

export default FilterButton;
