import React from 'react';

function Map(props) {
  return(
    <div className="map-markers">
      <img src={props.url} />
    </div>
  );
}

export default Map;