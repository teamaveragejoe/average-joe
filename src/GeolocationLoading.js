import React from 'react';

function Map(props) {
  return(
    <div className="geolocator-loading-prompt" style={props.style}>
    <p>Finding your approximate address...</p>
    </div>
  );
}

export default Map;