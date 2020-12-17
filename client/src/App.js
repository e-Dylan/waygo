import React, { useState, useEffect } from 'react';
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

const RoutesWithNav = () => {
	return (
		<div>
			<Nav />
			<Switch>
				<Route exact path="/" component={HomePage} />
				<Route path="/login" component={LoginRegisterComponent} />
				<Route path="/register" component={LoginRegisterComponent} />
			</Switch>
		</div>
	);
}

const App = () => {

	return (
		<Router history={history}>
			<div className="app">
				<Switch>
					<Route path="/live-map" component={MapComponent} />
					<Route component={RoutesWithNav} />
				</Switch>
			</div>
		</Router>
	);
  
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
