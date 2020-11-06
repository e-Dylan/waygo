import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setUserState } from './redux/actions/setUserState';

import './App.css';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

// Map Component
import MapComponent from './components/MapComponent';

import history from './history';

import HomePage from './components/HomePage';
import Nav from './components/Nav';
import LoginRegisterComponent from './components/LoginRegisterComponent';

const LOGOUT_API_URL = window.location.hostname === "localhost" ? "http://localhost:1337/api/logout" : "production-url-here";
const ISLOGGEDIN_API_URL = window.location.hostname === "localhost" ? "http://localhost:1337/api/isLoggedIn" : "production-url-here";

class App extends Component {

  // every component has a state object, can be set with setState()
  state = {
	
  };

	componentDidMount() {
		// Check if user is logged in on application load
		var userState = {}; 
		let res = fetch(ISLOGGEDIN_API_URL, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			}
		})
		.then(res => res.json())
		.then(result => {
			try {
				if (result && result.success) {
					// user is logged in
					userState = {
						username: result.username,
						email: result.email,
						isLoggedIn: true,
						loading: false,
					}
				} else { 
					// user isn't logged in on the page
					userState = {
						username: '',
						email: '',
						isLoggedIn: false,
						loading: false,
					}
				}
				// call action of setting user state.
				// reducer listens and updates the store with this data.
				this.props.setUserState(userState);
			} catch(e) {
				
			}
		});
	}

  doLogout() {
	  console.log("logging out");

	  var userState = {}; 
	  let res = fetch(LOGOUT_API_URL, {
		  method: 'POST',
		  credentials: 'include',
		  headers: {
			  'Accept': 'application/json',
			  'Content-Type': 'application/json',
		  }
	  })
	  .then(res => res.json())
	  .then(result => {
		  try {
			  if (result && result.success) {
				  // user is logged in
				  userState = {
					  username: "",
					  email: "",
					  isLoggedIn: false,
					  loading: false,
				  }
			  } else { 
				  // user isn't logged in on the page
				  userState = {
					  loading: false,
				  }
			  }
			  // call action of setting user state.
			  // reducer listens and updates the store with this data.
			  this.props.setUserState(userState);
			  alert(result.msg);
		  } catch(e) {
			  this.props.setUserState({ loading: false });
			  console.log(e);
		  }
	  });
	}

  render() {

	const RoutesWithNav = () => {
		return (
			<div>
				<Nav doLogout={this.doLogout} />
				<Switch>
					<Route exact path="/" component={HomePage} />
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

// export default observer(App);

function mapStateToProps(globalState) {
	// Retrieve any data contained in redux global store.
	return {
		globalState,
	};
}

function matchDispatchToProps(dispatch) {
	
	return bindActionCreators({ setUserState: setUserState }, dispatch);
}

export default connect(mapStateToProps, matchDispatchToProps)(App)
