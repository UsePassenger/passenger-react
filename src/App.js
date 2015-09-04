import React, { Component } from 'react';

import superagent from 'superagent';

require('react-widgets/dist/css/react-widgets.css');
require('./stylesheets/main.css');

var DateTimePicker = require('react-widgets/lib/DateTimePicker');
var ComboBox = require('react-widgets/lib/ComboBox');

var baseUrl = "http://localhost:3001";

var stationObjects = [
  {
    stationId: 0,
    stationName: "Scarsdale"
  },
  {
    stationId: 0,
    stationName: "Hartsdale"
  },
  {
    stationId: 0,
    stationName: "Grand-Central"
  }
];

export default class App extends Component {
  render() {
    return (
      <h1>Hello, world!</h1>
    );
  }
}

// http://stackoverflow.com/a/3067896/1185578
function getDayStamp (date) {
  var yyyy = date.getFullYear().toString();
  var mm = (date.getMonth()+1).toString(); // getMonth() is zero-based
  var dd  = date.getDate().toString();
  return yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]); // padding
}

function getTimeStamp (date) {
  var hours = date.getHours();
  var hoursAdjusted = hours % 12;
  var ampm = hours < 12 ? "AM" : "PM";

  var hh = hoursAdjusted.toString();
  var mm = date.getMinutes().toString();
  return (hh[1]?hh:"0"+hh[0]) + ":" + (mm[1]?mm:"0"+mm[0]) + ampm;
}

function filterStation(station, value) { 
  var stationName = station.stationName.toLowerCase()
    , search      = value.toLowerCase();

  return stationName.indexOf(search) >= 0;
}

export var PassengerContent = React.createClass({
  loadRouteEventPairsFromServer: function(field, val) {
    var queryParams = {
      departure: this.state.departure,
      destination: this.state.destination,
      date: this.state.date
    };

    if (field && val) {
      queryParams[field] = val;
    }

    superagent
      .get(baseUrl + '/route-event-pairs'
        + "?departure=" + queryParams.departure.toLowerCase()
        + "&destination=" + queryParams.destination.toLowerCase()
        + "&daystamp=" + getDayStamp(queryParams.date))
      .end(function(err, res) {
        if (err) {
          console.log(err);
        } else {
          console.log(res);
          
          var newState = {};
          newState[field] = val;

          var routeEventPairs = res.body.map(({departure, destination}) => {
            departure.date = new Date(departure.date);
            destination.date = new Date(destination.date);
            return {
              departure: departure,
              destination: destination,
            };
          });

          newState.data = res.body;

          this.setState(newState);
        }
      }.bind(this));
  },
  getInitialState: function() {
    return {
      departure: "Grand-Central",
      destination: "Scarsdale",
      date: new Date(),
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
          Departure: {this.props.departure.stationName}, {getTimeStamp(this.props.departure.date)}
        </td>
        <td className="routeEventPairDestinationTime">
          Destination: {this.props.destination.stationName}, {getTimeStamp(this.props.destination.date)}
        </td>
      </tr>
    );
  }
});

var PassengerFilter = React.createClass({
  render: function() {
    return (
      <div className="passengerFilter">
        <div className="passengerFilter-left">
          <div className="passengerFilterDepartureStation">
            <label>Departure</label>
            <ComboBox 
              data={stationObjects}
              value={this.props.data.departure} 
              valueField='stationName' textField='stationName'
              filter={filterStation}
              onChange={value => this.props.onChange('departure', value)} />
          </div>
          <div className="passengerFilterDestinationStation">
            <label>Destination</label>
            <ComboBox 
              data={stationObjects}
              value={this.props.data.destination}
              valueField='stationName' textField='stationName'
              filter={filterStation}
              onChange={value => this.props.onChange('destination', value)} />
          </div>
        </div>
        <div className="passengerFilter-right">
          <div className="passengerFilterDepartureDate">
            <label>Date</label>
            <DateTimePicker 
              time={false}
              value={this.props.data.date}
              onChange={date => this.props.onChange('date', date)} />
          </div>
        </div>
      </div>
    );
  }
});