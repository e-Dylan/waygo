import React from 'react';

import $ from 'jquery';

import '../components-styles/HomePage.scss'; // change to components css

import DemoMapComponent from './DemoMapComponent';

// Images/icons

class AnimationSection extends React.Component {

    render() {

        return (
			<section className="demo-map">
				<div className="demo-map-container">
					<DemoMapComponent />
				</div>
				<div className="anim-div-copy">
					<a className="content-title">Waygo</a>
					<a className="content-desc">Visualize the world and navigate it with ease. Whether you're on a road trip or taking the bus to work - see it all in seconds. All in the palm of your hand.</a>
					<a className="create-account-button" href="/register">Create Account</a>
				</div>
			</section>
        );
    }
}


export default AnimationSection;