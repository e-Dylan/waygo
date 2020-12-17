import React, { useEffect, useState } from 'react';
import '../App.css';
import './components-styles/Nav.scss'

import * as api from '../api';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setUserState } from '../redux/actions/setUserState';

import waygoLogo from '../resources/logo/new/waygo-logo.png'

const Nav = (props) => {

	useEffect(() => {
		try {
			api.checkIsLoggedIn()
			.then(userState => {
				props.setUserState(userState);
			})
		} catch (e) {
			
		}
	}, []);

	const doLogout = () => {
		try {
			api.doLogout()
			.then(userState => {
				props.setUserState(userState);
			});
		} catch (e) {
			
		}
	}

	return (
		<div>
			<nav>
				<div className="nav-container">
					<div className="nav-left">
						<a className="nav-link" href="/">
							<img src={waygoLogo} className="nav-logo"></img>
							<b>Waygo</b>
						</a>
						<a className="nav-link" href="/live-map">Live Maps</a>
					</div>
					

					<div className="nav-right">
						{ props.globalState.userState.isLoggedIn ?
							<div className="nav-right">
								<a className="nav-link">{props.globalState.userState.username}</a>
								<a className="nav-link" href="/" onClick={doLogout}>logout</a>
							</div>
						:
							<div className="nav-right">
								<a className="nav-link" href="/login">login</a>
								<a className="nav-link" href="/register">register</a>
							</div>
						}
					</div>

				</div>
			</nav>
		</div>
	);
}

function mapStateToProps(globalState) {
	// Retrieve any data contained in redux global store.
	return {
		globalState
	};
}

function matchDispatchToProps(dispatch) {
	return bindActionCreators({ 
		setUserState: setUserState, 
	}, dispatch);
}

export default connect(mapStateToProps, matchDispatchToProps)(Nav)