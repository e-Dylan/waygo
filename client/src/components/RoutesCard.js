import React from 'react';
import { Button, Card } from 'reactstrap';

import './components-styles/RoutesCard.scss';

// Icons
import walkIcon from '../resources/maki-icons/pitch-15.svg'
import carIcon from '../resources/maki-icons/car-15.svg';
import busIcon from '../resources/maki-icons/bus-15.svg';
import cycleIcon from '../resources/maki-icons/bicycle-share-15.svg';

class RoutesCard extends React.Component {
	constructor(props) {
		super(props);
		this.mc = this.props.mapComponent;
	}

	state = {

	}

	setProfileButtonActive(clickedButton) {

		console.log(clickedButton);

		const profileButtons = document.querySelectorAll('.travel-profile-button');

		for (var button of profileButtons) {
			if (button.classList.contains('button-active'))
				button.classList.remove('button-active');
		}

		if (!clickedButton.classList.contains('button-active')) 
			clickedButton.classList.add('button-active');
	}

	render() {
		return (
			<div>
				<div className="routes-card-bg">
					<div className="travel-profiles-bar">
						<div className="travel-profile-button" onClick={(e) => { this.setProfileButtonActive(e.target || e.srcElement) }}>
							<img src={walkIcon}></img>
						</div>
						<div className="travel-profile-button" onClick={(e) => { this.setProfileButtonActive(e.target || e.srcElement) }}>
							<img src={carIcon}></img>
						</div>
						<div className="travel-profile-button" onClick={(e) => { this.setProfileButtonActive(e.target || e.srcElement) }}>
							<img src={busIcon}></img>
						</div>
						<div className="travel-profile-button" onClick={(e) => { this.setProfileButtonActive(e.target || e.srcElement) }}>
							<img src={cycleIcon}></img>
						</div>
					</div>

					<div className="routes-title">
						optimal routes
					</div>
					<div className="routes-container">
						<div className="route-option">
							
						</div>
					</div>
				</div>
			</div>
		)
	}

}

export default RoutesCard