import React, { Component } from 'react';
import Axios from 'axios';

class App extends Component {
  constructor() {
    super();

    this.key = 'oi8gGoB5ItjqriYYUPxcSa8aTVFAMla5';

    // set initial location (blank)
    this.state = {
      base: '481 Queen St W',
      search: '',
      baseGeoLocation: [],
      searchResults: [],
      // mapMarkers: [],
      mapImageURL: '',
      destination: '',
    };
  }

  // generic input setter
  handleInput = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  // displayRoute = async () => {
  //   try {
  //     const data = await Axios.get(
  //       'http://www.mapquestapi.com/staticmap/v5/map',
  //       {
  //         params: {
  //           key: 'oi8gGoB5ItjqriYYUPxcSa8aTVFAMla5',
  //           start: this.state.base,
  //           end: this.state.destination
  //         }
  //       }
  //     )
  //     console.log(data.data)
  //   } catch (err) {
  //     console.log('Cannot get route.')
  //   }
  // }

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
  search = async () => {
    try {
      if (this.state.base) {
        await this.geoLocation(this.state.base);
      }

      let data = await Axios.get("https://www.mapquestapi.com/search/v4/place", {
        params: {
          key: this.key,
          sort: 'relevance',
          circle: `${this.state.baseGeoLocation[1]}, ${this.state.baseGeoLocation[0]}, 10000`,
          q: this.state.search,
          pageSize: 20
        }
      })

      // convert the results array into an array of objects each containing the name and address of a location
      const results = data.data.results.map(location => {
        return {
          name: location.name,
          address: location.displayString.slice(location.name.length + 2)
        }
      });

      this.setState({
        searchResults: results
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
      <div className="App">
        <header>
          <h1>Average Joe</h1>
        </header>

        <form>
          <div className="start-input-group">
            <h2>Where are you?</h2>
            <input
              type="text"
              name="base"
              placeholder="e.g. 483 Queen St W, Toronto, ON"
              value={this.state.base}
              onChange={this.handleInput} />
            <button type="button" onClick={this.getCurrentLocation}>Use Current Location</button>
          </div>
          <div className="search-input-group">
            <h2>Where would you like to go?</h2>
            <input
              type="text"
              name="search"
              placeholder="e.g. cafes, Tim Horton's"
              value={this.state.search}
              onChange={this.handleInput} />
            <button type="button" id="submit-search" onClick={this.search}>Submit</button>
          </div>
        </form>

        <div className="content-container">
          <div className="location-list">
            {this.state.searchResults.map(location => {
              return (
                <button key={location.address} onClick={() => { this.setDestination(location.address)}}>
                  <h4>{location.name}</h4>
                  <p>{location.address}</p>
                </button>
              )
            })}
          </div>

          <div className="map-markers">
            <img src={this.state.mapImageURL} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
