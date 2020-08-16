import React, { Component } from 'react';
import { observer } from 'mobx-react';

import './App.css';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

// Map Component
import MapComponent from './components/MapComponent';

import history from './history';

import UserStore from './stores/UserStore';

import Nav from './components/Nav';

const LOGOUT_API_URL = window.location.hostname === "localhost" ? "http://localhost:1337/api/logout" : "production-url-here";
const ISLOGGEDIN_API_URL = window.location.hostname === "localhost" ? "http://localhost:1337/api/isLoggedIn" : "production-url-here";

class App extends Component {
  // every component has a state object, can be set with setState()
  state = {
    userPosition: {
      lat: 51.505,
      lng: -0.09,
    },
    hasUserPosition: false,

    markerPosition: {
      lat: 0,
      lng: 0,
    },
    activeMarker: false,

    zoom: 2,

    userWayMessage: {
      name: "",
      message: ""
    },

    showWayMessageForm: false,
    sendingWayMessage: false,
    sentWayMessage: false,

    waymessages: []
  }

  async componentDidMount() {

    // Check if user is logged in on application load
    try {
      // fetch isLoggedIn api

      let res = await fetch(ISLOGGEDIN_API_URL, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      let result = await res.json();
      if (result && result.success) {
        // user is logged in
        UserStore.loading = false;
        UserStore.isLoggedIn = true;
        UserStore.username = result.username;
      } else { 
        // user isn't logged in on the page
        UserStore.loading = false;
        UserStore.isLoggedIn = false;
        UserStore.username = '';
      }
    } 
    catch(e) {
      UserStore.loading = false;
      UserStore.isLoggedIn = false;
    }
  }

  render() {
    return(
      <Router history={history}>

        <Nav />

        <Route path="/live-map" component={MapComponent} />
      
      </Router>
      
    )
  }
  
}

export default observer(App);
