import React, { Component } from 'react'
import Axios from 'axios'
import Form from './Form.js'
import Map from './Map.js'
import Locations from './Locations.js'
import Directions from './Directions.js'
import './App.css'

class App extends Component {
  constructor() {
    super()

    this.key = 'oi8gGoB5ItjqriYYUPxcSa8aTVFAMla5'

    // set initial location (blank)
    this.state = {
      base: '481 Queen St W',
      searchTerm: '',
      baseGeoLocation: [],
      searchResults: [],
      // mapMarkers: [],
      mapImageURL: '',
      destination: '',
      highlightedLocations: [null, null],
      directions: []
    }
  }

  // generic input setter
  handleInput = e => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  // get and set the directions from base to destination
  displayRoute = async () => {
    try {
      const data = await Axios.get(
        'http://www.mapquestapi.com/directions/v2/route',
        {
          params: {
            key: this.key,
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
      .reduce((result, current) => {
        return result + current.address + '||'
      }, '')
      .replace('#', ' ')
  }

  // using the navigator object, fetch user's browser location
  getCurrentLocation = () => {
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
      console.log('Geolocation is not supported by this browser.')
    }
  }

  // set destination to the address selected and display the route map from base to destination
  setDestination = address => {
    this.setState(
      {
        destination: address
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
            key: this.key,
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
    try {
      const data = await Axios.get(
        'http://www.mapquestapi.com/geocoding/v1/reverse',
        {
          params: {
            key: this.key,
            location: location
          }
        }
      )
      // set current location as base
      this.setState({
        base: data.data.results[0].locations[0].street
      })
    } catch (err) {
      console.log('Cannot reverse geo location.')
    }
  }

  // search a place of interest and display a list of the results as well as a map
  // marking said results
  search = async e => {
    e.preventDefault()

    try {
      // convert address entered into geo location
      await this.geoLocation(this.state.base)

      let data = await Axios.get(
        'https://www.mapquestapi.com/search/v4/place',
        {
          params: {
            key: this.key,
            sort: 'relevance',
            circle: `${this.state.baseGeoLocation[1]}, ${
              this.state.baseGeoLocation[0]
              }, 10000`,
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

      // Find the most "average" location... aka highlight the middle result (or middle two results in the event of an even number of results)
      let highlightedLocations = [null, null]

      if (results.length % 2 === 0) {
        highlightedLocations = [results.length / 2 - 1, results.length / 2]
      } else {
        highlightedLocations = [Math.floor(results.length / 2)]
      }

      console.log(highlightedLocations)

      this.setState({
        searchResults: results,
        highlightedLocations: highlightedLocations
      })

      this.getLocationsMapImage()
    } catch (err) {
      console.log('Cannot perform search.')
    }
  }

  // get and set the locations map image url
  getLocationsMapImage = async () => {
    try {
      const data = await Axios({
        method: 'GET',
        url: 'https://www.mapquestapi.com/staticmap/v5/map',
        responseType: 'blob',
        params: {
          key: this.key,
          locations:
            this.streetArrayToString() + this.state.base + '|flag-start',
          scalebar: 'true|bottom',
          shape: 'radius:10km|' + this.state.base,
          size: '800,800'
        }
      })
      this.setState({
        mapImageURL: URL.createObjectURL(data.data)
      })
    } catch (err) {
      console.log('Cannot generate locations map.')
    }
  }

  // get and set the route map image url
  getRouteMapImage = async () => {
    try {
      const data = await Axios({
        method: 'GET',
        url: 'https://www.mapquestapi.com/staticmap/v5/map',
        responseType: 'blob',
        params: {
          key: this.key,
          start: this.state.base + '|flag-start',
          end: this.state.destination + '|flag-end',
          scalebar: 'true|bottom',
          size: '800,800'
        }
      })
      this.setState({
        mapImageURL: URL.createObjectURL(data.data)
      })
    } catch (err) {
      console.log('Cannot generate route map.')
    }
  }

  componentDidUpdate() {

    // Do the below as long as the search results aren't zero.
    if (this.state.searchResults.length > 0) {

      //Find which button is highlighted for the most 'average' location, aka the middle of the list
      let highlightButtonElement = document.getElementById("button-highlight-id");

      //Since the highlighted button is scrolled just past the top of the div, subtract the button height times 6 (seemed like a good value when tested) to push the scroll back to where we can see the highlighted buttons
      let topOffset = highlightButtonElement.offsetTop - highlightButtonElement.offsetHeight * 6;

      //set the scroll of the location list div to the above values.
      document.getElementById("location-list-id").scrollTop = topOffset;
    }
  }

  render() {
    return (
      <div className='wrapper'>
        <div className='App'>
          <header>
            <h1>Average Joe</h1>
          </header>

          <div className='form-container'>
            <Form
              search={this.search}
              base={this.state.base}
              handleInput={this.handleInput}
              getCurrentLocation={this.getCurrentLocation}
              searchTerm={this.state.searchTerm}
            />
          </div>

          <div className='content-container'>
            <div className='map-and-locations'>
              <Locations
                setDestination={this.setDestination}
                searchResults={this.state.searchResults}
                highlightedLocations={this.state.highlightedLocations}
              />

              <Map url={this.state.mapImageURL} />
            </div>

            <Directions directions={this.state.directions} />
          </div>
        </div>
      </div>
    )
  }
}

export default App
