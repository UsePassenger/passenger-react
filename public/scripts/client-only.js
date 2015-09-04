var PassengerContent = React.createClass({
  getInitialState: function() {
    return {
      filter: {
        departure: "Grand Central",
        destination: "Scarsdale",
        date: "Aug 18 00:00:00 EDT 2015"
      },
      routeEventPairs: [
        {
          departure: {
            date: "Aug 18 21:30:00 EDT 2015",
            stationName: "Grand Central",
            stationId: 1,
            routeId: 1,
            directionId: 0
          },
          destination: {
            date: "Aug 18 23:30:00 EDT 2015",
            stationName: "Scarsdale",
            stationId: 2,
            routeId: 1,
            directionId: 0
          }
        },
        {
          departure: {
            date: "Aug 18 21:30:00 EDT 2015",
            stationName: "Grand Central",
            stationId: 1,
            routeId: 1,
            directionId: 0
          },
          destination: {
            date: "Aug 18 23:30:00 EDT 2015",
            stationName: "Scarsdale",
            stationId: 2,
            routeId: 1,
            directionId: 0
          }
        }
      ]
    };
  },
  render: function() {
    return (
      <div className="passengerContent">
        <h1>Filter</h1>
        <PassengerFilter data={this.state.filter} />
        <h1>Time Table</h1>
        <PassengerRouteEventPairsList data={this.state.routeEventPairs} />
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
          Departure: {this.props.departure.date}
        </td>
        <td className="routeEventPairDestinationTime">
          Destination: {this.props.destination.date}
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
          Departure: <select>
            <option value="Hartsdale">Hartsdale</option>
            <option value="Scarsdale">Scarsdale</option>
            <option value="Grand-Central">Grand Central</option>
          </select>
        </h2>
        <h2 className="passengerFilterDestinationStation">
          Destination: <select>
            <option value="Hartsdale">Hartsdale</option>
            <option value="Scarsdale">Scarsdale</option>
            <option value="Grand-Central">Grand Central</option>
          </select>
        </h2>
        <h2 className="passengerFilterDepartureDate">
          Date: {this.props.data.date}
        </h2>
      </div>
    );
  }
});

React.render(
  <PassengerContent />,
  document.getElementById('content')
);