import React from 'react'

function Form (props) {
  return (
    <form onSubmit={props.search} className='form-flex'>
      <div className='form-inputs'>
        <div className='start-input-group input-group'>
          <h2>Where are you?</h2>
          <input
            type='text'
            name='base'
            placeholder='ex. 483 Queen St W, Toronto'
            required
            pattern='\S.{0,40}'
            title='No empty space in the beginning please.'
            value={props.base}
            onChange={props.handleInput}
            disabled={props.usingCurrent}
          />
          <div className='check-contain'>
            <label htmlFor='current-location' className='checkbox-container'>
              <input
                id='current-location'
                type='checkbox'
                className='checkbox'
                onChange={props.getCurrentLocation}
              />
              <label htmlFor='current-location' className='check-label'>
                Use Current Location
              </label>
            </label>
          </div>
        </div>

        <div className='search-input-group input-group'>
          <h2>Where would you like to go?</h2>
          <input
            type='text'
            name='searchTerm'
            placeholder="ex. cafe, Tim Horton's"
            required
            title='No empty space in the beginning please.'
            pattern='\S.{0,40}'
            value={props.searchTerm}
            onChange={props.handleInput}
          />
          <div className='check-contain'>
            <label htmlFor='tourist-mode' className='checkbox-container'>
              <input
                id='tourist-mode'
                type='checkbox'
                className='checkbox'
                onChange={props.toggleTouristMode}
              />
              <label htmlFor='tourist-mode' className='check-label'>
                Tourist Mode
              </label>
            </label>
          </div>
        </div>

        <div className='range-input-group input-group'>
          <h2>How far would you go?</h2>
          <input
            type='range'
            name='range'
            className='range-slider'
            min='1000'
            aria-valuemin='1000'
            max='20000'
            aria-valuemax='20000'
            step='1000'
            value={props.range}
            onMouseUp={props.handleInput}
            onTouchEnd={props.handleInput}
            onKeyDown={props.handleEnter}
            onChange={props.updateSliderRange}
          />
          <h4>{props.range / 1000}km</h4>
        </div>
      </div>

      <div className='form-button'>
        <button type='submit' id='submit-search'>
          Submit
        </button>
      </div>
    </form>
  )
}

export default Form
