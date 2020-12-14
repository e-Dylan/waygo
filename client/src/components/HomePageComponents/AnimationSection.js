import React from 'react';

import $ from 'jquery';

import '../components-styles/HomePage.scss'; // change to components css

import DemoMapComponent from './DemoMapComponent';

// Images/icons

const AnimationSection = (props) => {
	return (
		<section className="demo-map-section">
			<div className="demo-map-container">
				<DemoMapComponent />
			</div>
			<div className="copy-content">
				<a className="content-title">WAYGO</a>
				<a className="content-desc">Visualize the world and navigate it with ease.</a>
				<a className="content-desc" style={{fontSize: 11+'pt'}}> Whether you're on a road trip or taking the bus to work - see it all in seconds. All in the palm of your hand.</a>
				<a className="create-account-button" href="/register">Create Account</a>
			</div>
		</section>
	);
}


export default AnimationSection;