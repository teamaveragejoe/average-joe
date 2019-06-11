import React from 'react'

function Directions(props) {
    return (
        <div className='directions-list'>
            <h3>Directions</h3>
            <ol>
                {props.directions.map((direction, index) => (
                    <li key={index}>{direction}</li>
                ))}
            </ol>
        </div>
    )
}

export default Directions
