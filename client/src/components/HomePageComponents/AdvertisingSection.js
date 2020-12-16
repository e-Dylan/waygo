import React from 'react';

import '../components-styles/HomePage.scss'; // change to components css

// Images/icons
import waygoLogo from '../../resources/logo/new/waygo-logo.png';
import optimizeTravelImage from '../../resources/front-page/adv-section/optimize-your-travel.svg';
import ownTrafficIcon from '../../resources/front-page/adv-section/own-traffic.svg';
import travelWithFriendsImage from '../../resources/front-page/adv-section/travel-with-friends.svg';

const AdvertisingSection = (props) => {

	return (
		<section className="advertising-section">
			<div className="adv-row">
				<div className="container-center">
					<div className="row-container">
						<div className="text-content">
							<span className="adv-title">optimize your travel</span>
							<p className="adv-para">Calculate your route in seconds and plan your arrival time.</p>
						</div>
						<div className="image-content">
							<img src={optimizeTravelImage}></img>
						</div>
					</div>
				</div>
			</div>
			<div className="adv-row">
				<div className="container-center">
					<div className="row-container">
						<div className="image-content">
							<img src={ownTrafficIcon}></img>
						</div>
						<div className="text-content">
							<span className="adv-title">own traffic</span>
							<p className="adv-para">Automatically account for live-traffic data when finding your best route.</p>
						</div>
					</div>
				</div>
			</div>
			<div className="adv-row">
				<div className="container-center">
					<div className="row-container">
						<div className="text-content">
							<span className="adv-title">travel with friends</span>
							<p className="adv-para">See your friends on your map and sync your trips with them on the road.</p>
						</div>
						<div className="image-content">
							<img src={travelWithFriendsImage}></img>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}

export default AdvertisingSection;