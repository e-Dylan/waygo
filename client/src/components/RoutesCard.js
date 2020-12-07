import React from 'react';
import { Button, Card } from 'reactstrap';

import './components-styles/RoutesCard.scss';

// Icons
import recommendedIcon from '../resources/maki-icons/entrance-alt1-15.svg'
import carIcon from '../resources/maki-icons/car-15.svg';
import walkIcon from '../resources/maki-icons/pitch-15.svg'
import busIcon from '../resources/maki-icons/bus-15.svg';
import cycleIcon from '../resources/maki-icons/bicycle-share-15.svg';

import trafficIcon from '../resources/maki-icons/icons8-traffic-light-26.png'

class RoutesCard extends React.Component {
	constructor(props) {
		super(props);
		this.mc = this.props.mapComponent;
	}

	state = {

	}

	getCurrentTimeAsString() {
		var d = new Date(),
		h = (d.getHours()<10?'0':'') + d.getHours(),
		m = (d.getMinutes()<10?'0':'') + d.getMinutes();
		
		return h + ":" + m;
	}

	getArrivalTime(routeDuration) {
		var d = new Date(),
		h = (d.getHours()<10?'0':'') + d.getHours(),
		m = (d.getMinutes()<10?'0':'') + d.getMinutes();

		var hoursDuration, minutesDuration;
		var secondsDuration = routeDuration;

		hoursDuration = Math.floor(secondsDuration / 3600);
		secondsDuration -= Math.floor(hoursDuration*3600);

		minutesDuration = Math.floor(secondsDuration / 60);
		secondsDuration -= Math.floor(minutesDuration*60);

		console.log(hoursDuration + ' ' + minutesDuration);

		// take new minutes, calculate again and increase hours for any 60+ minutes.

		var arrivalTime = (parseFloat(h)+parseFloat(hoursDuration)).toString()+':'+(parseFloat(m)+parseFloat(minutesDuration)).toString();
		return arrivalTime;
	}

	setProfileButtonActive(clickedButton) {

		const profileButtons = document.querySelectorAll('.travel-profile-button');

		for (var button of profileButtons) {
			if (button.classList.contains('button-active'))
				button.classList.remove('button-active');
		}

		if (!clickedButton.classList.contains('button-active')) 
			clickedButton.classList.add('button-active');

		this.props.mapComponent.setState({
			activeProfile: clickedButton.id,
		});
		
	}

	render() {
		return (
			<div>
				<div className="routes-card-bg">
					<div className="travel-profiles-bar">
						<div className="travel-profile-button" id="recommended" onClick={(e) => { this.setProfileButtonActive(e.target || e.srcElement) }}>
							<img src={recommendedIcon}></img>
						</div>
						<div className="travel-profile-button" id="driving-traffic" onClick={(e) => { this.setProfileButtonActive(e.target || e.srcElement) }}>
							<img src={carIcon}></img>
						</div>
						<div className="travel-profile-button" id="walking" onClick={(e) => { this.setProfileButtonActive(e.target || e.srcElement) }}>
							<img src={walkIcon}></img>
						</div>
						<div className="travel-profile-button" id="transit" onClick={(e) => { this.setProfileButtonActive(e.target || e.srcElement) }}>
							<img src={busIcon}></img>
						</div>
						<div className="travel-profile-button" id="cycling" onClick={(e) => { this.setProfileButtonActive(e.target || e.srcElement) }}>
							<img src={cycleIcon}></img>
						</div>
					</div>

					<div className="routes-title" onClick={() => console.log(this.props.mapComponent.state.activeDisplayingRoutes)}>
						optimal routes
					</div>

					{this.props.mapComponent.state.activeDisplayingRoutes != null && this.props.mapComponent.state.activeDisplayingRoutes.length > 0 &&
						<div className="routes-container">
							{ this.props.mapComponent.state.activeDisplayingRoutes.map(route =>
									<div className="route-option" key={route.distance}>
										<div className="route-icon">
											{(() => {
												{/* Return icon specific to route profile type */}
												switch (route.weight_name) {
													case "auto": return <img src={carIcon} />
													case "routability": return <img src={carIcon} />
													case "walkability": return <img src={walkIcon} />
													case "cyclability": return <img src={cycleIcon} />
												}
											})()}
										</div>
										<div className="route-data">
											<div className="route-top">
												{route.duration &&
													<div>{(route.duration/60).toFixed(1)} min</div>
												}
											</div>
											<div className="route-bottom">
												{route.distance &&
													<div className="highlight">{(route.distance/1000).toFixed(1)} km</div>
												}
												{route.legs[0].summary &&
													<div>via {route.legs[0].summary}</div>
												}
												{route.duration &&
													<div>@ {
														this.getArrivalTime(route.duration)
													}</div>
												}
											</div>
										</div>
										
									</div>
							) }
						</div>
					}
				</div>
			</div>
		)
	}

}

export default RoutesCard