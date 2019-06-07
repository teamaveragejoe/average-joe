import React from 'react'

function Form (props) {
  return (
    <form onSubmit={props.search}>
      <div className='start-input-group'>
        <h2>Where are you?</h2>

        <input
          type='text'
          name='base'
          placeholder='e.g. 483 Queen St W, Toronto, ON'
          required
          pattern='\S.{0,40}'
          title='No empty space in the beginning please.'
          value={props.base}
          onChange={props.handleInput}
        />
        <div className='check-contain'>
          <label for='current-location' class='checkbox-container'>
            <input
              id='current-location'
              type='checkbox'
              onChange={props.getCurrentLocation}
            />
            <span class='checkmark' />
            Use Current Location
          </label>
        </div>
      </div>

      <div className='search-input-group'>
        <h2>Where would you like to go?</h2>
        <input
          type='text'
          name='searchTerm'
          placeholder="e.g. cafes, Tim Horton's"
          required
          pattern='\S.{0,40}'
          title='No empty space in the beginning please.'
          value={props.searchTerm}
          onChange={props.handleInput}
        />
        <button type='submit' id='submit-search'>
          Submit
        </button>
      </div>

      <div className="range-input-group">
        <h2>What far in metres do you want to search?</h2>
        <input
          type="range"
          name="range"
          min="1000"
          max="20000"
          step="1000"
          value={props.range}
          onChange={props.handleInput}
        />
        <h3>{props.range}m</h3>
      </div>
    </form>
  )
}

export default Form
