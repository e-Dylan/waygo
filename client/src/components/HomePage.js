import React, { useEffect, useState } from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createBrowserHistory } from 'history'

// import { Card, Button, CardTitle, CardText, Row, Col, Form, FormGroup, Label, Input, ButtonDropdown } from "reactstrap";
import { Card } from 'reactstrap';

import $ from 'jquery';
import AOS from "aos";
import "aos/dist/aos.css";

import '../App.css'
import './components-styles/HomePage.scss'; // change to components css

import AnimationSection from './HomePageComponents/AnimationSection';
import AdvertisingSection from './HomePageComponents/AdvertisingSection';
import AnalyticsSection from './HomePageComponents/AnalyticsSection';

// Images/icons
import waygoLogo from '../resources/logo/new/waygo-logo.png';

// Google Analytics
import ReactGA from 'react-ga';

import { renderButton, checkSignedIn } from "../analyticsUtils";

// const trackingId = "G-M7Z6KW7GT6"

const HomePage = (props) => {

	useEffect(() => {
		AOS.init({
			offset: 400,
			duration: 700,
			once: true,
			disable: 'mobile',
			easing: 'ease-in-out-sine'
		});
		AOS.refresh();
			// implement checking if user is logged in and caching their
			// data on application load,
			// rn each page must load their own user data with an api call.
			// ReactGA.event({
			// 	category: "Page Views",
			// 	action: "User loaded the front page."
			// });
		
			// ReactGA.pageview(window.location.pathname);

	}, [])
		
	return (
		<div>
			<div className="homepage">
				<AnimationSection />
				<AdvertisingSection />
				<AnalyticsSection />
			</div>
		</div>
	);
}

function mapStateToProps(state) {
	return({
		userState: state.userState,
	})
}

export default connect(mapStateToProps)(HomePage);