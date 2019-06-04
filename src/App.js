import React, { Component } from 'react';

class App extends Component {
  constructor() {
    super();

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
        this.setState({
          base: [position.coords.latitude, position.coords.longitude]
        });
      });
    } else {
      console.log("Geolocation is not supported by this browser.");
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
