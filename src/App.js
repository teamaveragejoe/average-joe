import React, { Component } from 'react';
import Axios from 'axios';

class App extends Component {
  constructor() {
    super();

    this.key = 'oi8gGoB5ItjqriYYUPxcSa8aTVFAMla5';
    
    // set initial location (blank)
    this.state = {
      base: '',
      search: '',
      baseGeoLocation: [],
      searchResults: [],
      // mapMarkers: [],
      mapImageURL: '',
      destination: '',
    }
  }

  handleInput = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  // using the navigator object, fetch user's browser location
  getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        // use long and lat input to return user's location in street address form
        this.setState({ baseGeoLocation: [position.coords.latitude, position.coords.longitude] })
        this.reverseGeo(`${position.coords.latitude},${position.coords.longitude}`);
      });
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }

  streetArrayToString = () => {
    return this.state.searchResults.reduce((result, current) => {
      return result + '||' + current.displayString.slice(current.name.length + 2);
    }, '').substring(2).replace('#', ' ');
   }

  reverseGeo = async (location) => {
    try {
      const data = await Axios.get("http://www.mapquestapi.com/geocoding/v1/reverse", {
        params: {
          key: 'oi8gGoB5ItjqriYYUPxcSa8aTVFAMla5',
          location: location
        }
      });
      // set current location as base
      this.setState({
        base: data.data.results[0].locations[0].street
      })
    } catch(err) {
      console.log("Cannot reverse geo location.");
    }
  }

  search = async () => {
    try {
      const data = await Axios.get("https://www.mapquestapi.com/search/v4/place", {
        params: {
          key: this.key,
          sort: 'relevance',
          circle: `${this.state.baseGeoLocation[1]}, ${this.state.baseGeoLocation[0]}, 10000`,
          q: this.state.search,
          pageSize: 50,
        }
      })
      this.setState({
        searchResults: data.data.results
      })
      // console.log(this.state.searchResults)

      console.log(this.streetArrayToString());

      this.getMapImage(this.streetArrayToString())

    } catch (err) {
      console.log("Cannot perform search.");
    }
  }

  getMapImage = async (locations) => {
    try {
      const data = await Axios.get("https://www.mapquestapi.com/staticmap/v5/map", {
        params: {
          start: this.state.base,
          end: this.state.destination,
          locations: locations,
          scalebar: 'true|bottom',
          shape: 'radius:10km|' + this.state.base,
        }
      })

      this.state ({
        mapImageURL: data.data
      })
    } catch (err) {
      console.log("Cannot generate map.");
    }
  }

  render() {
    return (
      <div className="App">
        <h1>Average Joe</h1>

        <form>
          <h2>Where are you?</h2>
          <input
            type="text" 
            name="base" 
            placeholder="e.g. 483 Queen St W, Toronto, ON"
            value={this.state.base}
            onChange={this.handleInput} />
          <button type="button" onClick={this.getCurrentLocation}>Current Location</button>
          <h2>Where would you like to go?</h2>
          <input
            type="text"
            name="search"
            placeholder="e.g. cafes, Tim Horton's"
            value={this.state.search}
            onChange={this.handleInput} />
          <button type="button" id="submit-search" onClick={this.search}>Submit</button>
        </form>

        <div className="map-markers">
          <img src={this.state.mapImageURL}></img>
        </div>
      </div>
    );
  }
}

export default App;
