import React, { Component } from 'react';

import superagent from 'superagent';

export default class App extends Component {
  render() {
    return (
      <h1>Hello, world!</h1>
    );
  }
}

export var PassengerContent = React.createClass({
  loadRouteEventPairsFromServer: function(field, val) {
    var baseUrl = "http://localhost:3001";

    var queryParams = {
      departure: this.state.departure.toLowerCase(),
      destination: this.state.destination.toLowerCase()
    };

    if (field && val) {
      queryParams[field] = val.toLowerCase();
    }

    superagent
      .get(baseUrl 
        + "?departure=" + queryParams.departure.toLowerCase()
        + "&destination=" + queryParams.destination.toLowerCase())
      .end(function(err, res) {
        if (err) {
          console.log(err);
        } else {
          console.log(res);
          
          var newState = {};
          newState[field] = val;
          newState.data = res.body;
          this.setState(newState);
        }
      }.bind(this));
  },
  getInitialState: function() {
    return {
      departure: "Grand-Central",
      destination: "Scarsdale",
      date: "Aug 18 00:00:00 EDT 2015",
      data: []
    };
  },
  componentDidMount: function() {
    this.loadRouteEventPairsFromServer();
  },
  onChange: function (field, newValue) {
    console.log(arguments);
    this.loadRouteEventPairsFromServer(field, newValue);
  },
  render: function() {
    var routeEventPairs = this.state.data;

    console.log("render", this.state);
    var filteredRouteEventPairs = routeEventPairs.filter(({departure, destination}) => {
      return departure.stationName === this.state.departure
          && destination.stationName === this.state.destination;
    });

    return (
      <div className="passengerContent">
        <h1>Filter</h1>
        <PassengerFilter data={this.state} onChange={this.onChange} />
        <h1>Time Table</h1>
        <PassengerRouteEventPairsList data={filteredRouteEventPairs} />
      </div>
    );
  }
});

var PassengerRouteEventPairsList = React.createClass({
  render: function() {
    var routeEventPairNodes = this.props.data.map(function(routeEventPair, index) {
      return (
        // `key` is a React-specific concept and is not mandatory for the
        // purpose of this tutorial. if you're curious, see more here:
        // http://facebook.github.io/react/docs/multiple-components.html#dynamic-children
        <table style={{ width: "100%" }}>
          <RouteEventPair departure={routeEventPair.departure} destination={routeEventPair.destination} key={index} />
        </table>
      );
    });
    return (
      <div className="routeEventPairsList">
        {routeEventPairNodes}
      </div>
    );
  }
});

var RouteEventPair = React.createClass({
  render: function() {
    return (
      <tr className="routeEventPair">
        <td className="routeEventPairDepartureTime">
          Departure: {this.props.departure.stationName}, {this.props.departure.date}
        </td>
        <td className="routeEventPairDestinationTime">
          Destination: {this.props.destination.stationName}, {this.props.destination.date}
        </td>
      </tr>
    );
  }
});

var PassengerFilter = React.createClass({
  render: function() {
    return (
      <div className="passengerFilter">
        <h2 className="passengerFilterDepartureStation">
          Departure: <select onChange={event => this.props.onChange('departure', event.target.value)} value={this.props.data.departure}>
            <option value="Hartsdale">Hartsdale</option>
            <option value="Scarsdale">Scarsdale</option>
            <option value="Grand-Central">Grand-Central</option>
          </select>
        </h2>
        <h2 className="passengerFilterDestinationStation">
          Destination: <select onChange={event => this.props.onChange('destination', event.target.value)} value={this.props.data.destination}>
            <option value="Hartsdale">Hartsdale</option>
            <option value="Scarsdale">Scarsdale</option>
            <option value="Grand-Central">Grand-Central</option>
          </select>
        </h2>
        <h2 className="passengerFilterDepartureDate">
          Date: {this.props.data.date}
        </h2>
      </div>
    );
  }
});