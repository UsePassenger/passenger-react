import React, { Component } from 'react';

import superagent from 'superagent';

require('react-widgets/dist/css/react-widgets.css');
require('./stylesheets/main.css');

var DateTimePicker = require('react-widgets/lib/DateTimePicker');
var ComboBox = require('react-widgets/lib/ComboBox');
var Router = require('react-router');

var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;

var Navigation = require('react-router').Navigation;

// http://localhost:8000/api/v1/mnr/search?departure=1&destination=4&daystamp=20150904
// var baseUrl = "http://localhost:3001";
var baseUrl = "http://localhost:5050";

var StationReference = require('./StationReference');
var stationDictionary = StationReference.stationDictionary;
var stationArray = StationReference.stationArray;
var cache = {};

// http://stackoverflow.com/a/25047903/1185578
function isValidDate (date) {
  return ( (new Date(date) !== "Invalid Date" && !isNaN(new Date(date)) ));
}

function dateFromDayStamp(daystamp) {
  var year = daystamp.substring(0,4);
  var month = daystamp.substring(4,6);
  var day = daystamp.substring(6,8);
  return new Date(month + "/" + day + "/" + year);
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

export var MainApp = React.createClass({
  render: function() {
    return (
      <div className="andrew">
        <RouteHandler  {...this.props}/>
      </div>
    );
  }
});

export var PassengerContent = React.createClass({
  mixins: [ Navigation ],
  shouldComponentUpdate (nextProps, nextState) {
    console.log("shouldComponentUpdate", nextProps, nextState);
    return true;
  },
  componentWillReceiveProps (nextProps) {
    var oldQuery = this.props.query;
    var newQuery = nextProps.query;
    console.log("componentWillReceiveProps", newQuery);

    // var queryString = "?departure=" + newQuery.departure
    //   + "&destination=" + newQuery.destination;

    // if (newQuery.daystamp) {
    //   queryString += "&daystamp=" + newQuery.daystamp;
    // }

    // var newParams = {
    //   departure: this.props.query.departure || "1",
    //   destination: this.props.query.destination || "4",
    //   date: this.props.query.daystamp ? dateFromDayStamp(this.props.query.daystamp) : new Date(),
    //   data: cache[queryString] || []
    // };

    // var newState = {
    //   departure: newParams.departure,
    //   destination: newParams.destination,
    //   daystamp: getDayStamp(newParams.date),
    //   data: newParams.data
    // };

    // this.setState(newState);

    // this.loadRouteEventPairsFromServerWithState(newParams);

    // var queryString = "?departure=" + newQuery.departure
    //   + "&destination=" + newQuery.destination;
    // var newState = {};
    // newState.departure = newQuery.departure;
    // newState.destination = newQuery.destination;

    // if (newQuery.daystamp) {
    //   queryString += "&daystamp=" + newQuery.daystamp;
    //   newState.daystamp = newQuery.daystamp;
    // }

    // if (cache[queryString]) {
    //   newState.data = cache[queryString];
    //   this.setState(newState);
    //   this.forceUpdate();
    // } else {
    //   this.loadRouteEventPairsFromServer();
    // }
  },
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

    var queryString = "departure=" + queryParams.departure
        + "&destination=" + queryParams.destination;

    superagent
      .get(baseUrl + '/api/v1/mnr/search'
        + "?" + queryString 
        + "&daystamp=" + getDayStamp(queryParams.date))
      .end(function(err, res) {
        if (err) {
          console.log(err);
        } else {
          console.log(res);
          
          var newState = {};

          var data = res.body.result;

          var routeEventPairs = data.map(({departure, destination}) => {
            departure.date = new Date(departure.date);
            destination.date = new Date(destination.date);
            return {
              departure, destination
            };
          });

          newState.data = routeEventPairs;

          // Warning! Be careful setting state in deferred code.
          // Check the community for "react-async", or "ismounted".
          // Basically, we want to make sure that this component is
          // mounted before setting state. component.isMounted
          this.setState(newState);

          var url = '/mnr/timetable?' + queryString;
          if (getDayStamp(new Date()) !== getDayStamp(queryParams.date)) {
            url += "&daystamp=" + getDayStamp(queryParams.date)
          }
          cache[url] = data;
          this.transitionTo(url);
        }
      }.bind(this));
  },
  getInitialState: function() {
    return {
      departure: this.props.query.departure || "1",
      destination: this.props.query.destination || "4",
      date: this.props.query.daystamp ? dateFromDayStamp(this.props.query.daystamp) : new Date(),
      data: []
    };
  },
  componentDidMount: function() {
    this.loadRouteEventPairsFromServer();
  },
  validateProps: function (field, newValue) {
    if (field == "date") {
      return isValidDate(newValue);
    } else if (field == "departure" || field == "destination") {
      return !!(newValue in stationDictionary);
    }
    return false;
  },
  onChange: function (field, newValue) {
    console.log("onChange", field, newValue);
    var newState = {};
    newState[field] = newValue;
    this.setState(newState);

    if (this.validateProps(field, newValue)) {
      this.loadRouteEventPairsFromServer(field, newValue);
    }
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