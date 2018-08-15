import React, { Component } from 'react';
import { HotKeys, HotKeyMapMixin } from 'react-hotkeys';



// Simple "name:key sequence/s" to create a hotkey map
const keyMap = {
  'simpleTest': 'escape',
  'filterTest': 'b'
};



import superagent from 'superagent';

require('react-widgets/dist/css/react-widgets.css');
require('./static/stylesheets/main.css');
require('./static/stylesheets/flex.css');

var DateTimePicker = require('react-widgets/lib/DateTimePicker');
var ComboBox = require('react-widgets/lib/Combobox');
var Router = require('react-router');

var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;

// console.log('watch me!!!');

var Navigation = require('react-router').Navigation;

// http://localhost:8000/api/v1/mnr/search?departure=1&destination=4&daystamp=20150904
var baseUrl = "";
// var baseUrl = "http://pssngr.co";

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

function dateFromTimeAndDay(hr, min, sec, day) {
  // TODO
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
      <RouteHandler {...this.props}/>
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
        .get(baseUrl + '/api/query'
          + "?" + queryString 
          + "&daystamp=" + getDayStamp(queryParams.date))
        .end(function(err, res) {
          if (err) {
            // console.log(err);
          } else {
            // console.log(res);
            
            var newState = {};

            var data = res.body;

            var routeEventPairs = data.results.map(({departure, destination}) => {
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

    var url = '/timetable/mnr?' + queryString;

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
  hotKeyHandler () {
    console.log("right on!");
    React.findDOMNode(this.refs.hotKeyTopLevel).focus();
  },
  render: function() {
    var routeEventPairs = this.state.data;

    const handlers = {
      'simpleTest': this.hotKeyHandler
    };

    const titleStyle = {
      textDecoration: 'none'
    };

    return (
      <HotKeys handlers={handlers} ref="hotKeyTopLevel">
        <div className="passengerContent">
          <div className="passengerHeader">
            <div className="Grid passengerHeaderWrapper">
              <div className="Grid-cell">
                <div className="Grid">
                  <div className="Grid-cell cell-logo">
                    <img className="passenger-logo"></img>
                  </div>
                  <div className="Grid-cell cell-title">
                    <span><a href={window.location.href}>Passenger MNR</a></span>
                  </div>
                </div>
              </div>

              <div className="Grid-cell"></div>

              <div className="Grid Grid-cell u-1of3">
                <div className="Grid-cell ps-centerText">
                  <span></span>
                </div>
                <div className="Grid-cell ps-centerText">
                  <span></span>
                </div>
                <div className="Grid-cell ps-centerText">
                  <span></span>
                </div>
                <div className="Grid-cell ps-centerText">
                  <span><a className="dbox-donation-button" href="https://donorbox.org/passenger-donations">donate</a></span>
                </div>
              </div>
            </div>
          </div>
          <div className="passengerTimetableContainer">
            <div className="passengerFilterContainer">
              <PassengerFilter data={this.state} onChange={this.onChange} />
            </div>
            <PassengerRouteEventPairsList data={this.state}/>
          </div>
        </div>
      </HotKeys>
    );
  }
});

function pad(num, size) {
  var s = num+"";
  while (s.length < size) s = "0" + s;
  return s;
}

var PassengerRouteEventPairsList = React.createClass({
  handleClick () {
    console.log(arguments);
  },
  timeUntil: function(t, td, now) {
    // TODO: Need date of query and the current time to be accurate.
  },
  timeDiff: function(t1, t2) {
    // Returns the difference between dates as minutes.
    // Expects t1 to be later than t2.
    return (t1 - t2) / 1000 / 60;
  },
  formatTime: function(t) {
    // DEBT
    var hr = t.getHours();
    var m = t.getMinutes();
    var ampm = "AM";
    if (hr > 12) {
      hr = hr % 12;
      ampm = "PM";
    }
    if (hr === 0) {
      hr = 12;
    }
    return hr.toString() + ":" + pad(m.toString(), 2) + ampm;
  },
  render: function() {
    var d = this.props.data.date;
    var routeEventPairs = this.props.data.data;
    var routeEventPairRows = routeEventPairs.map(function(routeEventPair, index) {
      var depT = routeEventPair.departure.date;
      var arrT = routeEventPair.destination.date;
      var depStr = this.formatTime(depT);
      var arrStr = this.formatTime(arrT);
      // var depStr = routeEventPair.departure.date.toString();
      // var arrStr = routeEventPair.destination.date.toString();
      var travelStr = this.timeDiff(arrT, depT).toString() + "m";
      // var travelStr = "0m";

      return (
        // `key` is a React-specific concept and is not mandatory for the
        // purpose of this tutorial. if you're curious, see more here:
        // http://facebook.github.io/react/docs/multiple-components.html#dynamic-children
        <tr onClick={event => this.handleClick(event, index)} key={index} >
          <td>
            <div>
              <span className="trainTime">{depStr} - {arrStr}</span> <span className="travelTime">{travelStr}</span>
            </div>
          </td>
        </tr>
      );
    }.bind(this));
    return (
      <div className="tableContainer">
        <div className="routeEventPairTableContainer">
          <table className="routeEventPairTable">
            {routeEventPairRows}
          </table>
        </div>
      </div>
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
        <div className="Grid Grid-cell">
          <div className="Grid-cell passengerFilter-cell">
            <div className="Grid">
              <label className="Grid-cell ps-cellLabel">From</label>
              <ComboBox className="Grid-cell"
                data={stationArray}
                value={this.props.data.departure} 
                valueField='stop_id' textField='stop_name'
                filter={filterStation}
                onChange={station => this.props.onChange('departure', station.stop_id)} />
            </div>
            <div className="Grid">
              <label className="Grid-cell ps-cellLabel">To</label>
              <ComboBox className="Grid-cell ps-station"
                data={stationArray}
                value={this.props.data.destination}
                valueField='stop_id' textField='stop_name'
                filter={filterStation}
                onChange={station => this.props.onChange('destination', station.stop_id)} />
            </div>
          </div>
          <div className="Grid-cell ps-centerText ps-filterCell-swap">
          </div>
        </div>
        <div className="Grid-cell u-1of3">
          <div className="Grid passengerFilter-cell">
            <div className="Grid">
              <label className="Grid-cell ps-cellLabel">Date</label>
              <DateTimePicker className="Grid-cell"
                time={false}
                value={this.props.data.date}
                onChange={date => this.props.onChange('date', date)} />
            </div>
            <div className="Grid">
            </div>
          </div>
        </div>
      </div>
    );
  }
});