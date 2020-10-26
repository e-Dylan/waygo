import React from "react";

import { Card } from 'reactstrap';

import directionsCarIcon from "../resources/maki-icons/car-15.svg";
import citySearchIcon from "../resources/maki-icons/building-alt1-15.svg";
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
						{ this.props.mapComponent.state.searchResultItems.map(searchResult =>

							<div 
							className="search-result-div"
							onClick={ () => {
								this.props.mapComponent.hideDirsSearchResults({dir: "to", reset: false });
								// set camera at location on origin marker placement, not item click
								
								if (searchResult != null) {
									const lng = searchResult.lng;
									const lat = searchResult.lat;
									this.props.mapComponent._flyTo({ lng: lng, lat: lat, zoom: 12, displayActiveMarker: false });
									this.props.mapComponent.placeOriginMarker(searchResult.lng, searchResult.lat);
								}
							}}
							key={Math.random()}
							title={searchResult.place_name}
							>
								<div>
									<img src={ citySearchIcon } className="search-result-icon"></img>
								</div>
								{ searchResult.place &&
									<span className="search-result-place" title={searchResult.place}>
										{searchResult.place}
									</span>
								}
								{ searchResult.address &&
									<span className="search-result-address">
										{searchResult.address}
									</span>
								}
								{ searchResult.city &&
									<span className="item-city">
										{searchResult.city}
									</span>
								}
								{ searchResult.country &&
									<span className="region-country"> 
											{searchResult.region}, {searchResult.country}
									</span>
								}
							</div>

						) }
					</Card>
				}

				{ this.props.mapComponent.state.showDirsToSearchResults && this.props.mapComponent.state.searchResultItems.length > 0 &&

					<Card className="search-results-bg-card dirs-to-search-results">
						{ this.props.mapComponent.state.searchResultItems.map(searchResult =>

							<div 
							className="search-result-div"
							onClick={ () => {
								this.props.mapComponent.hideDirsSearchResults({ reset: false });
								// set camera at location on origin marker placement, not item click
								
								if (searchResult != null) {
									const lng = searchResult.lng;
									const lat = searchResult.lat;
									this.props.mapComponent._flyTo({ lng: lng, lat: lat, zoom: 12, displayActiveMarker: false });
									this.props.mapComponent.placeDestMarker(searchResult.lng, searchResult.lat);
								}

							}}
							key={Math.random()}
							title={searchResult.place_name}
							>
								<div>
									<img src={ citySearchIcon } className="search-result-icon"></img>
								</div>
								{ searchResult.place &&
									<span className="search-result-place" title={searchResult.place}>
										{searchResult.place}
									</span>
								}
								{ searchResult.address &&
									<span className="search-result-address">
										{searchResult.address}
									</span>
								}
								{ searchResult.city &&
									<span className="item-city">
										{searchResult.city}
									</span>
								}
								{ searchResult.country &&
									<span className="region-country"> 
											{searchResult.region}, {searchResult.country}
									</span>
								}
							</div>

						) }
					</Card>
					
				}
			</Card>
		);
	}
}

export default DirectionsCard;