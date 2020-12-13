import React, { useEffect, useState } from 'react';
import '../App.css';
import './components-styles/Nav.scss'

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setUserState } from '../redux/actions/setUserState';

import waygoLogo from '../resources/logo/waygo-logo.png'

const ISLOGGEDIN_API_URL = window.location.hostname === "localhost" ? `${process.env.REACT_APP_DEVELOPMENT_API_URL}/isLoggedIn` : `${process.env.REACT_APP_PRODUCTION_API_URL}/isLoggedIn`;
const LOGOUT_API_URL = window.location.hostname === "localhost" ? `${process.env.REACT_APP_DEVELOPMENT_API_URL}/logout` : `${process.env.REACT_APP_PRODUCTION_API_URL}/logout`;

const Nav = (props) => {

	useEffect(() => {
		var userState = {}; 
		var res = fetch(ISLOGGEDIN_API_URL, {
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
				props.setUserState(userState);
			} catch(e) {
				
			}
		})
	}, []);

	const doLogout = () => {
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
				props.setUserState(userState);
				alert(result.msg);
			} catch(e) {
				props.setUserState({ loading: false });
				console.log(e);
			}
		});
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
							<a className="nav-link" href="/" onClick={doLogout}>logout</a>
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