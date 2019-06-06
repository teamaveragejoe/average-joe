import React from 'react';
import LocationButton from './LocationButton.js'

function Locations(props) {
  return (
    <div className="location-list">
      {props.searchResults.map((location, index) => {
        return (
          <LocationButton
            key={index + location.address}
            setDestination={props.setDestination}
            index={index}
            name={location.name}
            address={location.address}
            highlightedLocations={props.highlightedLocations}
          />
        )
      })}
    </div>
  );
}

export default Locations