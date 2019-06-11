import React from 'react'
import LocationButton from './LocationButton.js'

function Locations (props) {
  return (
    <div className='location-list' id='location-list-id'>
      {props.areSearchResultsEmpty ? (
        <p className='no-results-found-text'>
          No search results found. Try searching for something a little less
          creative. <span role="img" aria-label="Annoyed Emoji">😒</span>
        </p>
      ) : null}

      {props.searchResults.map((location, index) => {
        return (
          <LocationButton
            key={index + location.address}
            setDestination={props.setDestination}
            index={index}
            name={location.name}
            address={location.address}
            highlightedLocations={props.highlightedLocations}
            touristMode={props.touristMode}
            duplicateNames={props.duplicateNames}
          />
        )
      })}
    </div>
  )
}

export default Locations
