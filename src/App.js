import React, { Component } from 'react';
import { HotKeys, HotKeyMapMixin } from 'react-hotkeys';



// Simple "name:key sequence/s" to create a hotkey map
const keyMap = {
  'simpleTest': 'escape',
  'filterTest': 'b'
};

const handlers = {
  'simpleTest': hotKeyHandler
};

function hotKeyHandler () {
  console.log("right on!");
}

import superagent from 'superagent';

require('react-widgets/dist/css/react-widgets.css');
require('./stylesheets/main.css');
require('./stylesheets/flex.css');

var DateTimePicker = require('react-widgets/lib/DateTimePicker');
var ComboBox = require('react-widgets/lib/Combobox');
var Router = require('react-router');

var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;

var Navigation = require('react-router').Navigation;

// http://localhost:8000/api/v1/mnr/search?departure=1&destination=4&daystamp=20150904
// var baseUrl = "http://localhost:3001";
var baseUrl = "http://pssngr.co";

var StationReference = require('./StationReference');
var stationDictionary = StationReference.stationDictionary;
var stationArray = StationReference.stationArray;
var cache = {};

// http://stackoverflow.com/a/25047903/1185578
function isValidDate (date) {
  return ( (new Date(date) !== "Invalid Date" && !isNaN(new Date(date)) ));
}

function getCacheKey(departure, destination, daystamp) {
  return departure + "-" + destination + "-" + daystamp;
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
      <RouteHandler  {...this.props}/>
    );
  }
});

export var PassengerContent = React.createClass({
  mixins: [ Navigation, HotKeyMapMixin(keyMap) ],
  shouldComponentUpdate (nextProps, nextState) {
    return true;
  },
  componentWillReceiveProps (nextProps) {
    var oldQuery = this.props.query;
    var newQuery = nextProps.query;

    var newParams = {
      departure: newQuery.departure || "1",
      destination: newQuery.destination || "4",
      date: newQuery.daystamp ? dateFromDayStamp(newQuery.daystamp) : new Date()
    };

    this.setState(newParams);
    this.fetchRouteEventPairs(newParams);
  },
  fetchRouteEventPairs: function (newParams) {
    var queryParams = newParams;

    var queryString = "departure=" + queryParams.departure
        + "&destination=" + queryParams.destination;

    if (cache[getCacheKey(queryParams.departure, queryParams.destination, queryParams.date)]) {
      var newState = {};
      var data = cache[getCacheKey(queryParams.departure, queryParams.destination, queryParams.date)];
      newState.data = data;
      this.setState(newState);
    } else {
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

            cache[getCacheKey(queryParams.departure, queryParams.destination, queryParams.date)] = newState.data;
          }
        }.bind(this));
    }

  },
  transitionForNewParams: function(newParams) {
    var queryParams = {
      departure: newParams.departure || this.state.departure,
      destination: newParams.destination || this.state.destination,
      date: newParams.date || this.state.date
    };

    var queryString = "departure=" + queryParams.departure
        + "&destination=" + queryParams.destination;
    if (getDayStamp(new Date()) !== getDayStamp(queryParams.date)) {
      queryString += "&daystamp=" + getDayStamp(queryParams.date)
    }

    var url = '/mnr/timetable?' + queryString;

    this.transitionTo(url);
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
    var queryParams = {
      departure: this.state.departure,
      destination: this.state.destination,
      date: this.state.date
    };
    this.transitionForNewParams({});
    this.fetchRouteEventPairs(queryParams);
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
    var newState = {};
    newState[field] = newValue;
    this.setState(newState);

    if (this.validateProps(field, newValue)) {
      this.transitionForNewParams(newState);
    }
  },
  render: function() {
    var routeEventPairs = this.state.data;

    return (
      <HotKeys handlers={handlers}>
        <div className="passengerContent">
          <div className="passengerHeader">
            <div className="passengerTitle">
              <h1>Passenger</h1>
            </div>
            <div className="passengerFilterContainer">
              <PassengerFilter data={this.state} onChange={this.onChange} />
            </div>
          </div>
          <div className="passengerTimetableContainer">
            <PassengerRouteEventPairsList data={routeEventPairs} />
          </div>
        </div>
      </HotKeys>
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
        <RouteEventPair departure={routeEventPair.departure} destination={routeEventPair.destination} key={index} />
      );
    });
    return (
      <div className="tableContainer">
        <div>
          {"Yesterday's Schedule"}
        </div>
        <div className="routeEventPairTableContainer">
          <table className="routeEventPairTable">
            {routeEventPairNodes}
          </table>
        </div>
        <div>
          {"Tomorrow's Schedule"}
        </div>
      </div>
    );
  }
});

var RouteEventPair = React.createClass({
  render: function() {
    return (
      <tr>
        <td>
          <div>
            {this.props.departure.departure_time} - {this.props.destination.departure_time}
          </div>
        </td>
      </tr>
    );
  }
});

var PassengerFilter = React.createClass({

  
  render: function() {

    const filterHandlers = {
      'filterTest': this.filterHandler
    };

    return (
      <div className="Grid passengerFilter">
        <div className="Grid-cell">
          <div className="Grid passengerFilter-cell">
            <div className="Grid-cell">
              <label>From</label>
              <ComboBox 
                data={stationArray}
                value={this.props.data.departure} 
                valueField='stop_id' textField='stop_name'
                filter={filterStation}
                onChange={station => this.props.onChange('departure', station.stop_id)} />
            </div>
            <div className="Grid-cell">
              <label>To</label>
              <ComboBox 
                data={stationArray}
                value={this.props.data.destination}
                valueField='stop_id' textField='stop_name'
                filter={filterStation}
                onChange={station => this.props.onChange('destination', station.stop_id)} />
            </div>
          </div>
        </div>
        <div className="Grid-cell u-1of3">
          <div className="Grid passengerFilter-cell">
            <div className="Grid-cell">
              <label>Date</label>
              <DateTimePicker 
                time={false}
                value={this.props.data.date}
                onChange={date => this.props.onChange('date', date)} />
            </div>
          </div>
        </div>
      </div>
    );
  }
});