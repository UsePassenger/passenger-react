var express = require('express');
var app = express();

var routeEventPairs = require('./data').routeEventPairs;

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
};

function getDayStamp (date) {
  var yyyy = date.getFullYear().toString();
  var mm = (date.getMonth()+1).toString(); // getMonth() is zero-based
  var dd  = date.getDate().toString();
  return yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]); // padding
}

app.use(allowCrossDomain);

app.get('/api/v1/mnr/search', function (req, res) {

  var r_departure = req.query.departure;
  var r_destination = req.query.destination;
  var r_daystamp = req.query.daystamp;

  if (!r_departure || !r_destination || !r_daystamp) {
    return res.status(500).send('Something broke!');
  }

  var filteredRouteEventPairs = routeEventPairs.filter(({departure, destination}) => {
    return departure.stationName.toLowerCase() === r_departure.toLowerCase()
        && destination.stationName.toLowerCase() === r_destination.toLowerCase()
        && getDayStamp(new Date(departure.date)) === r_daystamp;
  });

  res.send(filteredRouteEventPairs);
});

var server = app.listen(3001, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
