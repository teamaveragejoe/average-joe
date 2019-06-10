import React from 'react';

function LocationButton(props) {
  const { setDestination, index, name, address, highlightedLocations, touristMode, duplicateNames } = props

  return (
    <button
      onClick={() => { setDestination(address) }}
      className={
        highlightedLocations[0] === index || highlightedLocations[1] === index
          ? "highlighted-button"
          : touristMode && duplicateNames[name] > 1
            ? "tourist-mode-button"
            : ""
      }
      id={
        highlightedLocations[0] === index
          ? "button-highlight-id"
          : touristMode && duplicateNames[name] > 1
            ? "tourist-mode-id"
            : ""
      }
    >
      <h4>{name}</h4>
      <p>{address}</p>
    </button>
  )
}

export default LocationButton;