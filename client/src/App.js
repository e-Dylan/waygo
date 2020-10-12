import React, { Component } from 'react';
import { observer } from 'mobx-react';

import './App.css';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

// Map Component
import MapComponent from './components/MapComponent';

import history from './history';

import UserStore from './stores/UserStore';

import Nav from './components/Nav';
import LoginRegisterComponent from './components/LoginRegisterComponent';

const LOGOUT_API_URL = window.location.hostname === "localhost" ? "http://localhost:1337/api/logout" : "production-url-here";
const ISLOGGEDIN_API_URL = window.location.hostname === "localhost" ? "http://localhost:1337/api/isLoggedIn" : "production-url-here";

class App extends Component {

  // every component has a state object, can be set with setState()
  state = {
	
  };

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

  async doLogout() {
    console.log("logging out");
    console.log("logged:"+UserStore.isLoggedIn);

    try {
      let res = await fetch(LOGOUT_API_URL, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      let result = await res.json();
      if (result && result.success) {
        // user has logged out
        UserStore.loading = false;
        UserStore.isLoggedIn = false;
        UserStore.username = '';
        alert(result.msg);
      } else {
        // stay logged out, error for some reason
        UserStore.loading = false;
        alert(result.msg);
      }
    } 
    catch (e) {
      UserStore.loading = false;
      console.log(e);
    }
  }

  render() {

	const RoutesWithNav = () => {
		return (
			<div>
				<Nav doLogout={this.doLogout} />
				<Switch>
					<Route exact path="/" />
					<Route path="/account/login" component={LoginRegisterComponent} />
				</Switch>
			</div>
		);
	}

    return(
	<Router history={history}>
		<div className="app">
			<Switch>
				<Route path="/live-map" component={MapComponent} />
				<Route component={RoutesWithNav} />
			</Switch>
		</div>
	</Router>
    )
  }
  
}

export default observer(App);
