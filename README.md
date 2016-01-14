# Passenger React

## How to Run

The development version of the website works best with 3 tabs.

Tab 1 (ES6 Transpiler):

```
npm install -g babel
babel api-server-es6.js --out-file api-server.js --watch
```

Tab 2 (API Server):

```
npm install -g forever
forever start --watch api-server.js
forever logs api-server.js -f
```

Tab 3 (Webpack Dev Server):

```
node server
```

Then open [http://localhost:3000/webpack-dev-server/](http://localhost:3000/webpack-dev-server/)

With this setup, you never have to refresh or restart the server after making changes!

NOTE: When changing the webpack.config, you may have to restart the webpack dev server.

NOTE: When there are errors, it is probably best to refresh.

# To Open

http://pssngr.co/mnr/timetable?departure=1&destination=4
