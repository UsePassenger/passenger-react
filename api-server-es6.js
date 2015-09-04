var express = require('express');
var app = express();

var routeEventPairs = require('./data');

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
};

app.use(allowCrossDomain);

app.get('/', function (req, res) {

  console.log(routeEventPairs);

  var dep = req.query.departure;
  var dest = req.query.destination;

  if (!dep || !dest) {
    return res.status(500).send('Something broke!');
  }

  var hello;
  var filteredRouteEventPairs = routeEventPairs.filter(({departure, destination}) => {
    return departure.stationName.toLowerCase() === dep.toLowerCase()
        && destination.stationName.toLowerCase() === dest.toLowerCase();
  });

  console.log(filteredRouteEventPairs);
  console.log('stuff501');

  res.send(filteredRouteEventPairs);
});

var server = app.listen(3001, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
