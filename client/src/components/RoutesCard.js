import React from 'react';
import { Button, Card } from 'reactstrap';

import mapboxgl from 'mapbox-gl';

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
		}, () => {
			// MC's active profile state has been updated.

			// Recalculate any showing routes using the new profile.
			this.props.mapComponent.checkCalculateRoutes();
		});

		
		
	}

	showHoveringRoute(route) {
		var travelColour = this.props.mapComponent.getTravelColour(this.props.mapComponent.state.activeProfile)
		this.props.mapComponent.drawHoveringRoute(route, travelColour);
	}

	hideHoveringRoute() {
		this.props.mapComponent.removeHoveringRoute();
	}

	setActiveRoute(route) {
		this.props.mapComponent.setState({
			activeRoute: route,
		}, () => {
			// Route has been set, zoom map to show it.
			const coords = this.props.mapComponent.state.activeRoute.geometry.coordinates;
			var bounds = coords.reduce((bounds, coord) => {
				return bounds.extend(coord);
			}, new mapboxgl.LngLatBounds(coords[0], coords[0]));

			this.props.mapComponent.map.fitBounds(bounds, {
				padding: 50,
			}, () => {
				console.log('done')
			});
		});

		var travelColour = this.props.mapComponent.getTravelColour(this.props.mapComponent.state.activeProfile)
		this.props.mapComponent.drawActiveRoute(route, travelColour);
		console.log(travelColour);
	}

	render() {
		return (
			<div className="routes-card-bg">
				<div className="travel-profiles-bar">
					<div className="travel-profile-button" id="recommended" onClick={(e) => { this.setProfileButtonActive(e.target || e.srcElement) }}>
						<img src={recommendedIcon}></img>
					</div>
					<div className="travel-profile-button" id="driving" onClick={(e) => { this.setProfileButtonActive(e.target || e.srcElement) }}>
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

				<div className="routes-title" onClick={() => console.log(this.props.mapComponent.state.activeRouteOptions)}>
					optimal routes
				</div>

				{this.props.mapComponent.state.activeRouteOptions != null && this.props.mapComponent.state.activeRouteOptions.length > 0 &&
					<div className="routes-container">
						{ this.props.mapComponent.state.activeRouteOptions.map((route, index) =>
								<div className="route-option" key={route.distance} 
									onMouseEnter={() => {
										this.showHoveringRoute(route);
									}}
									onMouseLeave={() => {
										this.hideHoveringRoute();
									}}
									onClick={() => {
										this.setActiveRoute(route);
									}}>
									<div className="route-icon">
										{(() => {
											{/* Return icon specific to route profile type */}
											switch (route.weight_name) {
												case "auto": return <img src={carIcon} />
												case "routability": return <img src={carIcon} />
												case "pedestrian": return <img src={walkIcon} />
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
		)
	}

}

export default RoutesCard