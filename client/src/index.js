/*

  index.js acts as main entry way into the react app,
  use to import main dependencies and libraries

*/

import React from 'react';
import ReactDOM from 'react-dom';

import "bootstrap/dist/css/bootstrap.css"

import { applyMiddleware, createStore, compose } from 'redux';
import { Provider } from 'react-redux';
import allReducers from './redux/reducers/main';


import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import history from './history';

const store = createStore(
	allReducers,
	window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()	
);

/*

  Only the app should ever be rendered, on the app will determine which
  component gets rendered based on app state data
  (isLoggedIn, show main app page, /login route, show login page,
    always render nav, etc.)

  Split map into its own component to move out of the app
  Use app to render components based on state data if logged in or not etc.
  Use Router in app, import components in App.

*/

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,

  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
