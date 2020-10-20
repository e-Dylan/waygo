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
							var actLocation = this.mc.state.activeLocationData

							this.mc.placeDestMarker(actLocation.lng, actLocation.lat);
							this.mc.setActiveDest(actLocation);
							if (this.mc.state.hasActiveMarker)
								this.mc.removeActiveMarker();
						
							// state doesn't get updated before other calls are made,
							// setTimeout(0) acts to delay until state can be updated with
							// new destination information that was just set.
							setTimeout(() => {
								if (!this.mc.state.hasOrigin && this.mc.state.hasDest) {
									// user doesn't have an origin, has already set their destination through search.
									// prompt to set their origin in directions card.
									this.mc.showDirections();
									this.mc.setToValue(actLocation.full_place);
								}
							}, 0);
							
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