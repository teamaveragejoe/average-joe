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
    };
  }

  handleInput = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  setDestination = (e) => {
    console.log(e.target.value)
    // console.log(e.target.value.slice(e.target.value.length + 2)

    this.setState({
      destination: e.target.value
    }, () => {
      console.log(this.state.destination);
      this.getMapImage(null, this.state.destination)
    })
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
    } catch (err) {
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
          pageSize: 20
        }
      })

      this.setState({
        searchResults: data.data.results
      })

      // console.log(this.streetArrayToString());

      this.getMapImage(this.streetArrayToString(), null);

    } catch (err) {
      console.log("Cannot perform search.");
    }
  }

  getMapImage = async (locations, destination) => {
    try {
      const data = await Axios({
        method: 'GET',
        url: 'https://www.mapquestapi.com/staticmap/v5/map',
        responseType: 'blob',
        params: {
          key: this.key,
          start: this.state.base,
          end: destination,
          locations: locations,
          scalebar: 'true|bottom',
          // zoom: 12,
          // shape: 'radius:10km|' + this.state.base,
          size: '800,800'
        }
      })
      console.log(data)
      this.setState({
        mapImageURL: URL.createObjectURL(data.data)
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
          <button type="button" onClick={this.getCurrentLocation}>Use Current Location</button>
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
          <img src={this.state.mapImageURL} />
        </div>
        <div className="location-list">
          {this.state.searchResults.map(location => {
            let address = location.displayString.slice(location.name.length +2);
            return (
              <button onClick={this.setDestination} value={address}>{location.displayString}</button>
            )  
          })}
        </div>
      </div>
    );
  }
}

export default App;
