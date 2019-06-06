import React from 'react';
import LocationButton from './LocationButton.js'

function Locations(props) {
  return (
    <div className="location-list">
      {props.searchResults.map((location, index) => {
        return (
          <LocationButton 
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