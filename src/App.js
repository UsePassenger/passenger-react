import React, { Component } from 'react';

import superagent from 'superagent';

require('react-widgets/dist/css/react-widgets.css');
require('./stylesheets/main.css');

var DateTimePicker = require('react-widgets/lib/DateTimePicker');
var ComboBox = require('react-widgets/lib/ComboBox');

// http://localhost:8000/api/v1/mnr/search?departure=1&destination=4&daystamp=20150904
// var baseUrl = "http://localhost:3001";
var baseUrl = "http://localhost:5050";

var StationReference = require('./StationReference');
var stationDictionary = StationReference.stationDictionary;
var stationArray = StationReference.stationArray;

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
  var stationName = station.stop_name.toLowerCase()
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

    console.log(arguments);

    if (field && val) {
      queryParams[field] = val;
    }

    superagent
      .get(baseUrl + '/api/v1/mnr/search'
        + "?departure=" + queryParams.departure
        + "&destination=" + queryParams.destination
        + "&daystamp=" + getDayStamp(queryParams.date))
      .end(function(err, res) {
        if (err) {
          console.log(err);
        } else {
          console.log(res);
          
          var newState = {};
          newState[field] = val;

          var data = res.body.result;

          var routeEventPairs = data.map(({departure, destination}) => {
            departure.date = new Date(departure.date);
            destination.date = new Date(destination.date);
            return {
              departure: departure,
              destination: destination,
            };
          });

          newState.data = routeEventPairs;

          this.setState(newState);
        }
      }.bind(this));
  },
  getInitialState: function() {
    return {
      departure: "1",
      destination: "4",
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

    return (
      <div className="passengerContent">
        <h1>Filter</h1>
        <PassengerFilter data={this.state} onChange={this.onChange} />
        <h1>Time Table</h1>
        <PassengerRouteEventPairsList data={routeEventPairs} />
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
          Departure: {stationDictionary[this.props.departure.stop_id].stop_name}, {this.props.departure.departure_time}
        </td>
        <td className="routeEventPairDestinationTime">
          Destination: {stationDictionary[this.props.destination.stop_id].stop_name}, {this.props.destination.departure_time}
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
              data={stationArray}
              value={this.props.data.departure} 
              valueField='stop_id' textField='stop_name'
              filter={filterStation}
              onChange={station => this.props.onChange('departure', station.stop_id)} />
          </div>
          <div className="passengerFilterDestinationStation">
            <label>Destination</label>
            <ComboBox 
              data={stationArray}
              value={this.props.data.destination}
              valueField='stop_id' textField='stop_name'
              filter={filterStation}
              onChange={station => this.props.onChange('destination', station.stop_id)} />
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