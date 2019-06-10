import React, { Component } from 'react'
import Axios from 'axios'
import Form from './Form.js'
import Map from './Map.js'
import Locations from './Locations.js'
import Directions from './Directions.js'
import GeolocationLoading from './GeolocationLoading'
import './App.css'

class App extends Component {
  constructor () {
    super()

    this.APIKEY = process.env.REACT_APP_API_KEY
    this.displayNone = { display: 'none' }
    this.displayShow = { display: 'block' }

    // set initial location (blank)
    this.state = {
      base: '',
      usingCurrent: false,
      searchTerm: '',
      range: 10000,
      baseGeoLocation: [],
      searchResults: [],
      mapImageURL: '',
      destination: '',
      highlightedLocations: [null, null],
      directions: [],
      areSearchResultsEmpty: false,
      mapLoadingStyle: this.displayNone,
      geolocationLoadingStyle: this.displayNone,
      showInfo: false,
      showDirections: false
    }
  }

  // input setter
  handleInput = e => {
    this.setState({
      [e.target.name]: e.target.value
    })
    if (e.target.name === 'range' && this.state.base && this.state.searchTerm) {
      this.search()
    }
  }

  updateSliderRange = e => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleEnter = e => {
    if (e.keyCode === 13) {
      this.handleInput(e)
    }
  }

  // get and set the directions from base to destination
  displayRoute = async () => {
    try {
      const data = await Axios.get(
        'http://www.mapquestapi.com/directions/v2/route',
        {
          params: {
            key: this.APIKEY,
            from: this.state.base,
            to: this.state.destination
          }
        }
      )

      const directions = data.data.route.legs[0].maneuvers.map(
        steps => steps.narrative
      )
      this.setState({
        directions
      })
    } catch (err) {
      console.log('Cannot get route.')
    }
  }

  // convert an array of addresses into one string of a required format
  streetArrayToString = () => {
    return this.state.searchResults
      .reduce((result, current, index) => {
        if (this.state.highlightedLocations.includes(index)) {
          console.log(index)
          return result + current.address + '|flag-FFD700-so so||'
        } else {
          return result + current.address + '||'
        }
      }, '')
      .replace('#', ' ')
  }

  // using the navigator object, fetch user's browser location
  getCurrentLocation = () => {
    this.setState({
      usingCurrent: !this.state.usingCurrent
    })

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.setState({
          baseGeoLocation: [
            position.coords.latitude,
            position.coords.longitude
          ]
        })
        // convert the lat and lng to an address
        this.reverseGeo(
          `${position.coords.latitude},${position.coords.longitude}`
        )
      })
    } else {
      alert('Geolocation is not supported by this browser.')
    }
  }

  // set destination to the address selected and display the route map from base to destination
  setDestination = address => {
    this.setState(
      {
        destination: address,
        showDirections: true
      },
      () => {
        this.getRouteMapImage()
        this.displayRoute()
      }
    )
  }

  // Given an address, convert the address to [lat, lng] and store it in baseGeoLocation
  geoLocation = async location => {
    try {
      const data = await Axios.get(
        'http://www.mapquestapi.com/geocoding/v1/address',
        {
          params: {
            key: this.APIKEY,
            location: location
          }
        }
      )

      const { lat, lng } = data.data.results[0].locations[0].latLng
      this.setState({
        baseGeoLocation: [lat, lng]
      })
    } catch (err) {
      console.log('Cannot get geo location.')
    }
  }

  // Given a string in the form of 'lat,lng' representing a lat and lng, covert it to
  // an address and store it in base
  reverseGeo = async location => {
    // only fire when the using current location checkbox is checked
    if (this.state.usingCurrent === true) {
      // When attempting to find address automatically using browser geolocation, display loading popup
      this.setState({
        geolocationLoadingStyle: this.displayShow
      })

      try {
        const data = await Axios.get(
          'http://www.mapquestapi.com/geocoding/v1/reverse',
          {
            params: {
              key: this.APIKEY,
              location: location
            }
          }
        )

        // save the result of the reverse lookup, and then parse out the address and save it into state
        const reverseAddressResult = data.data.results[0].locations[0]

        this.setState({
          base:
            reverseAddressResult.street +
            ', ' +
            reverseAddressResult.adminArea5 +
            ', ' +
            reverseAddressResult.adminArea3,
          geolocationLoadingStyle: this.displayNone
        })
      } catch (err) {
        alert('An error occured finding your address automatically.')
        this.setState({
          geolocationLoadingStyle: this.displayNone
        })
      }
    } // closing bracket for if statement
  }

  // search a place of interest and display a list of the results as well as a map
  // marking said results
  search = async e => {
    if (e) {
      e.preventDefault()
    }

    this.setState({
      directions: []
    })

    try {
      // convert address entered into geo location
      await this.geoLocation(this.state.base)

      let data = await Axios.get(
        'https://www.mapquestapi.com/search/v4/place',
        {
          params: {
            key: this.APIKEY,
            sort: 'relevance',
            circle: `${this.state.baseGeoLocation[1]}, ${
              this.state.baseGeoLocation[0]
            }, ${this.state.range}`,
            q: this.state.searchTerm,
            pageSize: 50
          }
        }
      )

      // convert the results array into an array of objects each containing the name and address of a location
      const results = data.data.results.map(location => {
        return {
          name: location.name,
          address: location.displayString.slice(location.name.length + 2)
        }
      })

      // Do a check to see if any results are found, and if so, set a search results empty flag.
      if (results.length === 0) {
        this.setState({
          areSearchResultsEmpty: true
        })
      } else {
        this.setState({
          areSearchResultsEmpty: false
        })
      }

      // Find the most "average" location... aka highlight the middle result (or middle two results in the event of an even number of results)
      let highlightedLocations = [null, null]

      if (results.length % 2 === 0) {
        highlightedLocations = [results.length / 2 - 1, results.length / 2]
      } else {
        highlightedLocations = [Math.floor(results.length / 2)]
      }

      this.setState({
        searchResults: results,
        highlightedLocations: highlightedLocations,
        showInfo: true
      })

      this.getLocationsMapImage()
    } catch (err) {
      alert('Cannot perform search. An error has occured.')
    }
  }

  // get and set the locations map image url
  getLocationsMapImage = async () => {
    // Set the map loading div to show up
    this.setState({
      mapLoadingStyle: this.displayShow
    })

    try {
      const data = await Axios({
        method: 'GET',
        url: 'https://www.mapquestapi.com/staticmap/v5/map',
        responseType: 'blob',
        params: {
          key: this.APIKEY,
          locations:
            this.streetArrayToString() + this.state.base + '|flag-start',
          scalebar: 'true|bottom',
          shape: `radius:${this.state.range / 1000}km` + '|' + this.state.base,
          size: '800,800'
        }
      })
      this.setState({
        mapImageURL: URL.createObjectURL(data.data),
        // hide the map loading div once the API request goes through
        mapLoadingStyle: this.displayNone
      })
    } catch (err) {
      alert('Cannot generate locations map.')
      this.setState({
        mapLoadingStyle: this.displayNone
      })
    }
  }

  // get and set the route map image url
  getRouteMapImage = async () => {
    // Set the map loading div to show up
    this.setState({
      mapLoadingStyle: {
        display: 'block'
      }
    })
    try {
      const data = await Axios({
        method: 'GET',
        url: 'https://www.mapquestapi.com/staticmap/v5/map',
        responseType: 'blob',
        params: {
          key: this.APIKEY,
          start: this.state.base + '|flag-start',
          end: this.state.destination + '|flag-end',
          scalebar: 'true|bottom',
          size: '800,800'
        }
      })
      this.setState({
        mapImageURL: URL.createObjectURL(data.data),
        // hide the map loading div once the API request goes through
        mapLoadingStyle: {
          display: 'none'
        }
      })
    } catch (err) {
      alert('Cannot generate route map.')
    }
  }

  componentDidUpdate () {
    // Do the below as long as the search results aren't zero.
    if (this.state.searchResults.length > 0) {
      // Find which button is highlighted for the most 'average' location, aka the middle of the list
      let highlightButtonElement = document.getElementById(
        'button-highlight-id'
      )

      // Since the highlighted button is scrolled just past the top of the div, subtract the button height times 4 (seemed like a good value when tested) to push the scroll back to where we can see the highlighted buttons
      let topOffset =
        highlightButtonElement.offsetTop -
        highlightButtonElement.offsetHeight * 4

      // set the scroll of the location list div to the above values.
      document.getElementById('location-list-id').scrollTop = topOffset
    }
  }

  render () {
    return (
      <div className='wrapper'>
        <div className='App'>
          <header>
            <h1>Average Joe</h1>
          </header>
          <div className='form-contact-contain'>
            <div className='form-container'>
              <Form
                search={this.search}
                base={this.state.base}
                usingCurrent={this.state.usingCurrent}
                range={this.state.range}
                handleInput={this.handleInput}
                handleEnter={this.handleEnter}
                updateSliderRange={this.updateSliderRange}
                getCurrentLocation={this.getCurrentLocation}
                searchTerm={this.state.searchTerm}
              />
              <GeolocationLoading style={this.state.geolocationLoadingStyle} />
            </div>
            {this.state.showInfo ? (
              <div className='content-container'>
                <div className='map-and-locations'>
                  <Locations
                    setDestination={this.setDestination}
                    searchResults={this.state.searchResults}
                    highlightedLocations={this.state.highlightedLocations}
                    areSearchResultsEmpty={this.state.areSearchResultsEmpty}
                  />

                  <Map
                    url={this.state.mapImageURL}
                    style={this.state.mapLoadingStyle}
                  />
                </div>

                <div className='direction-container'>
                  {this.state.showDirections ? (
                    this.state.directions.length > 0 ? (
                      <Directions directions={this.state.directions} />
                    ) : null
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    )
  }
}

export default App
