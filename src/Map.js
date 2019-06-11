import React from 'react';

function Map(props) {
  return(
    <div className="map-markers">
      <img src={props.url} alt="Map indicating the search results."/>
      <div className="loading-popup" style={props.style}>
        <p>Retrieving Map...</p>
      </div>
    </div>
  );
}

export default Map;