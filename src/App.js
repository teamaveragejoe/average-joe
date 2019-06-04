import React, { Component } from 'react';
import Axios from 'axios';

class App extends Component {
  constructor() {
    super();

    this.key = 'oi8gGoB5ItjqriYYUPxcSa8aTVFAMla5';
    
    this.state = {
      base: [],
    }
  }

  handleInput = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        // this.setState({
        //   base: [position.coords.latitude, position.coords.longitude]
        // });
        this.reverseGeo(`${position.coords.latitude},${position.coords.longitude}`);
      });
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }

  reverseGeo = async (location) => {
    try {
      const data = await Axios.get("http://www.mapquestapi.com/geocoding/v1/reverse", {
        params: {
          key: 'oi8gGoB5ItjqriYYUPxcSa8aTVFAMla5',
          location: location
        }
      });
      
      this.setState({
        base: data.data.results[0].locations[0].street
      })
    } catch(err) {
      console.log("Cannot reverse geo location.");
    }
  }

  render() {
    return (
      <div className="App">
        <h1>Average Joe</h1>

        <form>
          <input
            type="text" 
            name="base" 
            placeholder="Starting Location"
            value={this.state.base}
            onChange={this.handleInput} />
          <button type="button" onClick={this.getCurrentLocation}>Current Location</button>
        </form>

      </div>
    );
  }
}

export default App;
