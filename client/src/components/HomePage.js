import React, { useEffect } from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

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
import waygoLogo from '../resources/logo/waygo-logo.png';

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
	}, [])
		
	return (
		<div className="homepage">
			<AnimationSection />
			<AdvertisingSection />
			<AnalyticsSection />
		</div>
	);
}

function mapStateToProps(state) {
	return({
		userState: state.userState,
	})
}

export default connect(mapStateToProps)(HomePage);