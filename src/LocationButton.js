import React from 'react';

function LocationButton(props) {
  const {setDestination, index, name, address, highlightedLocations} = props

  return(
    <button
      onClick={() => { setDestination(address) }}
      className={
        highlightedLocations[0] === index || highlightedLocations[1] === index
          ? "highlighted-button"
          : ""
      }
    >
      <h4>{name}</h4>
      <p>{address}</p>
    </button>
  )
}

export default LocationButton;