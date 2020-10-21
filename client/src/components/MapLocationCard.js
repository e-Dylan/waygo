import React from "react";

import { Card } from 'reactstrap';

import '../App.css'
import './components-styles/MapComponent.css';

class MapLocationCard extends React.Component {
	constructor(props) {
		super(props);
		this.mc = this.props.mapComponent;
	}

	state = {

	};

	
	setRouteProperties = () => {
		const actLocation = this.mc.state.activeLocationData;

		// No origin, no destination set. Only active marker shows location data.
		if (!this.mc.state.hasOrigin && !this.mc.state.hasDest) {
			this.mc.placeDestMarker(actLocation.lng, actLocation.lat);
			this.mc.setActiveDest(actLocation);

			// prompt to insert a 'from' location.
			this.mc.setToValue(actLocation.full_place);
			this.mc.highlightFromToBars(true);
		}

		// No origin set, has a destination.
		// Can calculate a final route.
		if (!this.mc.state.hasOrigin && this.mc.state.hasDest) {
			// prompt to set their origin in directions card.
			this.mc.setFromValue(actLocation.full_place);
			this.mc.highlightFromToBars(false);
		}

		// Origin set, set the destination and find the route.
		if (this.mc.state.hasOrigin && !this.mc.state.hasDest) {
			this.mc.setToValue(actLocation.full_place);
			this.mc.highlightFromToBars(false);
		}

		if (this.mc.state.hasActiveMarker)
			this.mc.removeActiveMarker();

		this.mc.showDirections();
	}

	render() {
		return(
			<div>
				<Card body className="map-hud-card location-card"> 

				{/* <img src={torontoImage} className="location-data-image"></img> */}

				<div className="location-data-title">
					
				</div>
				<div className="location-data">
					<div className="location-place">{this.mc.state.activeLocationData.place}</div>
					<div className="location-address">{this.mc.state.activeLocationData.address}</div>
					<div className="location-subtitle">{this.mc.state.activeLocationData.city} {this.mc.state.activeLocationData.region}</div>
					<button className="get-dirs-button" onClick={ () => {
						if (this.mc.state.activeLocationData != null) {
						
							// state doesn't get updated before other calls are made,
							// setTimeout(0) acts to delay until state can be updated with
							// new destination information that was just set.
							this.setRouteProperties();
							
							// Calculate the route.
							if (this.mc.state.hasOrigin && this.mc.state.hasDest) {
								
							}
							
							// this.mc.getDirections({lat: this.mc.state.originMarkerPosition})
						}
						
					}}>
						directions
					</button>
				</div>

				</Card>
			</div>
		);
	}
}

export default MapLocationCard;