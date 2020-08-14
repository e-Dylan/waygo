/*

  index.js acts as main entry way into the react app,
  use to import main dependencies and libraries

*/

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import "leaflet/dist/leaflet.css"
import "bootstrap/dist/css/bootstrap.css"

import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

// Components to render for each route.
import Nav from './components/Nav';
import LoginForm from './components/LoginForm';

import history from './history';

ReactDOM.render(
  <Router history={history}>
    <div className="app">
        <Nav />
        <div className="container">
          <Route path="/account/login" component={LoginForm} />
        </div>
    </div>

  </Router>,

  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
