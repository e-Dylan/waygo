import React from "react";

import { Card } from 'reactstrap';

import directionsBuildingIcon from "../resources/maki-icons/building-alt1-15.svg";

import '../App.css'
import './components-styles/MapComponent.css';

class DirectionsCard extends React.Component {

	constructor(props) {
		super(props);
	}

	state = {

	}

	render() {
		return(
			<Card body className="map-hud-card directions-card">
				<div className="dirs-title">
					<div className="dirs-burger"
						onClick={this.props.mapComponent.moveHomeDock}>
						<div className="search-bar-button__burger"></div>
					</div>

					<div 
						className="show-loc-searchbar-button"
						onClick={() => {
							this.props.mapComponent.hideDirections();
							this.props.mapComponent.showLocation();
						}}
					>
						<img src={directionsBuildingIcon}></img>
					</div>

				</div>
				<div className="dirs-fromto">
					<div className="from-bar">
						<a className="dirs-label"></a>
						<input 
							className="dirs-input-bar"
							id="from-dirs-bar"
							placeholder="from"
							onFocus={(e) => {
								this.props.mapComponent.showDirsSearchResults({dir: "from"});
								this.props.mapComponent.highlightFromToBars(true);
							}}
							onBlur={(e) => {
								this.props.mapComponent.highlightFromToBars(false);
							}}
							onChange={(e) => {
								if (e.target.value.length > 2) {
									// make request for locations only if 3+ chars
									this.props.mapComponent.forwardGeocode({
										endpoint: "mapbox.places", 
										query: e.target.value, 
										autocomplete: true, 
										displayActiveMarker: false
									});

									if (e.target.value.length < 1) {
										// If clearing search bar, hide and empty search results.
										this.props.mapComponent.hideDirsSearchResults({dir: "from", reset: true });
									} else {
										this.props.mapComponent.showDirsSearchResults({dir: "from"});
									}
								}
							}}
						>

						</input>
						{/* <img src={directionsCarIcon}></img> */}
					</div>
					<div className="to-bar">
						<a className="dirs-label"></a>
						<input 
							className="dirs-input-bar"
							id = "to-dirs-bar"
							placeholder="to"
							onFocus={(e) => {
								this.props.mapComponent.showDirsSearchResults({dir: "to"});
								this.props.mapComponent.highlightFromToBars(true);
							}}
							onBlur={(e) => {
								this.props.mapComponent.highlightFromToBars(false);
							}}
							onChange={(e) => {
								if (e.target.value.length > 2) {
									// make request for locations only if 3+ chars
									this.props.mapComponent.forwardGeocode({
										endpoint: "mapbox.places", 
										query: e.target.value, 
										autocomplete: true, 
										displayActiveMarker: false
									});

									if (e.target.value.length < 1) {
										// If clearing search bar, hide and empty search results.
										this.props.mapComponent.hideDirsSearchResults({dir: "to", reset: true });
									} else {
										this.props.mapComponent.showDirsSearchResults({dir: "to"});
									}
								}
							}}
						>
						{/* <img src={directionsCarIcon}></img> */}
							
						</input>
					</div>
				</div>

				{ this.props.mapComponent.state.showDirsFromSearchResults && this.props.mapComponent.state.searchResultItems.length > 0 &&
								
					<Card className="search-results-bg-card dirs-from-search-results">
						{ this.props.mapComponent.state.searchResultItems.map(item =>

							<div 
							className="search-result-div"
							onClick={ () => {
								this.props.mapComponent.hideDirsSearchResults({dir: "to", reset: false });
								// set camera at location on origin marker placement, not item click
								
							}}
							key={Math.random()}
							title={item.place_name}
							>
							{item.place_name}
							</div>

						) }
					</Card>
				}

				{ this.props.mapComponent.state.showDirsToSearchResults && this.props.mapComponent.state.searchResultItems.length > 0 &&

					<Card className="search-results-bg-card dirs-to-search-results">
						{ this.props.mapComponent.state.searchResultItems.map(item =>

							<div 
							className="search-result-div"
							onClick={ () => {
								this.props.mapComponent.hideDirsSearchResults({ reset: false });
								// set camera at location on origin marker placement, not item click
								
							}}
							key={Math.random()}
							title={item.place_name}
							>
							
							</div>

						) }
					</Card>
					
				}
			</Card>
		);
	}
}

export default DirectionsCard;