import React, { Component } from 'react';
import Axios from 'axios';
import Form from './Form.js';
import Map from './Map.js';
import Directions from './Directions.js';

class App extends Component {
  constructor() {
    super();

    this.key = 'oi8gGoB5ItjqriYYUPxcSa8aTVFAMla5';

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
      directions: [],
    };
  }

  // generic input setter
  handleInput = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

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

      const directions = data.data.route.legs[0].maneuvers.map(steps => steps.narrative);
      this.setState({
        directions
      });
      console.log(this.state.directions);
    } catch (err) {
      console.log('Cannot get route.')
    }
  }

  // convert an array of addresses into one string of a required format
  streetArrayToString = () => {
    return this.state.searchResults.reduce((result, current) => {
      return result + '||' + current.address;
    }, '').substring(2).replace('#', ' ');
  }

  // using the navigator object, fetch user's browser location
  getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.setState({
          baseGeoLocation: [position.coords.latitude, position.coords.longitude]
        })
        // convert the lat and lng to an address
        this.reverseGeo(`${position.coords.latitude},${position.coords.longitude}`);
      });
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }

  // set destination to the address selected and display the route map from base to destination
  setDestination = (address) => {
    this.setState({
      destination: address
    }, () => {
      this.getRouteMapImage();
      this.displayRoute();
    })
  }

  // Given an address, convert the address to [lat, lng] and store it in baseGeoLocation
  geoLocation = async (location) => {
    try {
      const data = await Axios.get("http://www.mapquestapi.com/geocoding/v1/address", {
        params: {
          key: this.key,
          location: location
        }
      });

      const { lat, lng } = data.data.results[0].locations[0].latLng;
      this.setState({
        baseGeoLocation: [lat, lng]
      })
    } catch (err) {
      console.log("Cannot get geo location.");
    }
  }

  // Given a string in the form of 'lat,lng' representing a lat and lng, covert it to
  // an address and store it in base
  reverseGeo = async (location) => {
    try {
      const data = await Axios.get("http://www.mapquestapi.com/geocoding/v1/reverse", {
        params: {
          key: this.key,
          location: location
        }
      });
      // set current location as base
      this.setState({
        base: data.data.results[0].locations[0].street
      })
    } catch (err) {
      console.log("Cannot reverse geo location.");
    }
  }

  // search a place of interest and display a list of the results as well as a map
  // marking said results
  search = async (e) => {
    e.preventDefault();

    try {
      // convert address entered into geo location
      if (this.state.base) {
        await this.geoLocation(this.state.base);
      }

      let data = await Axios.get("https://www.mapquestapi.com/search/v4/place", {
        params: {
          key: this.key,
          sort: 'relevance',
          circle: `${this.state.baseGeoLocation[1]}, ${this.state.baseGeoLocation[0]}, 10000`,
          q: this.state.searchTerm,
          pageSize: 50
        }
      })

      // convert the results array into an array of objects each containing the name and address of a location
      const results = data.data.results.map(location => {
        return {
          name: location.name,
          address: location.displayString.slice(location.name.length + 2)
        }
      });

      //Find the most "average" location... aka highlight the middle result (or middle two results in the event of an even number of results)
      let highlightedLocations = [null, null];

      if (results.length % 2 === 0) {
        highlightedLocations = [(results.length / 2) - 1, (results.length / 2)];
      } else {
        highlightedLocations = [Math.floor(results.length / 2)];
      }

      console.log(highlightedLocations)

      this.setState({
        searchResults: results,
        highlightedLocations: highlightedLocations
      })

      this.getLocationsMapImage();

    } catch (err) {
      console.log("Cannot perform search.");
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
          start: this.state.base,
          locations: this.streetArrayToString(),
          scalebar: 'true|bottom',
          zoom: 12,
          shape: 'radius:10km|' + this.state.base,
          size: '800,800'
        }
      })
      this.setState({
        mapImageURL: URL.createObjectURL(data.data)
      })
    } catch (err) {
      console.log("Cannot generate locations map.");
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
          start: this.state.base,
          end: this.state.destination,
          scalebar: 'true|bottom',
          size: '800,800'
        }
      })
      this.setState({
        mapImageURL: URL.createObjectURL(data.data)
      })
    } catch (err) {
      console.log("Cannot generate route map.");
    }
  }

  render() {
    return (
      <div className="flex-container">
        <div className="App">
          <header>
            <h1>Average Joe</h1>
          </header>

          <Form 
            search={this.search}
            base={this.state.base}
            handleInput={this.handleInput}
            getCurrentLocation={this.getCurrentLocation}
            searchTerm={this.state.searchTerm}
          />

          <div className="content-container">
            <div className="location-list">
              {this.state.searchResults.map((location, index) => {
                return (
                  <button 
                  key={index + location.address} 
                  onClick={() => { this.setDestination(location.address)}}
                  className={(this.state.highlightedLocations[0] === index || this.state.highlightedLocations[1] === index ? "highlighted-button" : "")}
                  >
                  <h4>{location.name}</h4>
                  <p>{location.address}</p>
                </button>
                )
              })}
            </div>

            <Map url={this.state.mapImageURL}/>

            <Directions directions={this.state.directions}/>
          </div>
        </div>
        
      </div>
    );
  }
}

export default App;
