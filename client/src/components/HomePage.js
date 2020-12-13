import React from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

// import { Card, Button, CardTitle, CardText, Row, Col, Form, FormGroup, Label, Input, ButtonDropdown } from "reactstrap";
import { Card } from 'reactstrap';

import $ from 'jquery';

import './components-styles/HomePage.scss'; // change to components css

import AnimationSection from './HomePageComponents/AnimationSection';
import AdvertisingSection from './HomePageComponents/AdvertisingSection';
import AnalyticsSection from './HomePageComponents/AnalyticsSection';

// Images/icons
import waygoLogo from '../resources/logo/waygo-logo.png';

class HomePage extends React.Component {

	state = {	

	}

    render() {
        return (
			<div className="homepage">
				<AnimationSection />
				<AdvertisingSection />
				<AnalyticsSection />
			</div>
        );
    }

}

function mapStateToProps(state) {
	return({
		userState: state.userState,
	})
}

export default connect(mapStateToProps)(HomePage);