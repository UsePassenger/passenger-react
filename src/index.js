import React from 'react';

// We're doing destructuring!
import { PassengerContent } from './App';
import { MainApp } from './App';

var Router = require('react-router');

var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;

// React.render(<PassengerContent />, document.getElementById('root'));

var routes = (
  <Route name="app" path="/mnr/timetable" handler={MainApp}>
    <DefaultRoute handler={PassengerContent}/>
  </Route>
);

Router.run(routes, Router.HistoryLocation, function (Handler, state) {
  React.render(<Handler {...state}/>, document.getElementById('root'));
});