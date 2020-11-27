import React from "react";

import { Card } from 'reactstrap';

import directionsCarIcon from "../resources/maki-icons/car-15.svg";
import citySearchIcon from "../resources/maki-icons/building-alt1-15.svg";

import '../App.css'
import './components-styles/MapComponent.css';

class MapSearchBar extends React.Component {
	constructor(props) {
		super(props);
	}

	state = {

	};

	render() {
		return(
			<div>
				<Card body className="map-search-bar-card">
					<div className="search-bar-button"
						onClick={this.props.mapComponent.moveHomeDock}>
						<div className="search-bar-button__burger"></div>
					</div>
					
					<input 
						className="map-search-bar-search input-search-bar"
						placeholder="where to?"	
						onFocus={(e) => {
							this.props.mapComponent.showLocationSearchResults();
						}}
						onChange={(e) => {
							// make api call to get best 5 results using search text,
							// set search result text to response data.
							
							if (e.target.value.length > 2) {
								// only send api request if query is >= 3 chars.
								var tempSearchResults = this.props.mapComponent.forwardGeocode({
									endpoint: "mapbox.places", 
									query: e.target.value, 
									autocomplete: true, 
									displayActiveMarker: false
								})
								.then(tempSearchResults => {
									this.props.mapComponent.saveSearchResultsToMapState(tempSearchResults)
								});
							}

							if (e.target.value.length < 1) {
								// If clearing search bar, hide and empty search results.
								this.props.mapComponent.hideLocationSearchResults({reset: true});
							} else {
								this.props.mapComponent.showLocationSearchResults();
							}
							
						}}
						>
					</input>
					
					<div 
						className="show-dirs-searchbar-button"
						onClick={() => {
							this.props.mapComponent.hideLocation();
							this.props.mapComponent.showDirections();
						}}
					>
						<img src={directionsCarIcon}></img>
					</div>
				</Card>

				{ this.props.mapComponent.state.showLocationSearchResults && this.props.mapComponent.state.showLocation &&

					<Card body className="search-results-bg-card">

						{ this.props.mapComponent.state.searchResultItems.map(searchResult =>
							// scrape api data and fill the state search results array
							// display state search results in jsx
								<div 
								className="search-result-div"
								onClick={ () => {						
									// stop showing search results when location is clicked.
									this.props.mapComponent.hideLocationSearchResults({reset: false});
									// call flyTo method to move to this position.
									if (searchResult != null) {
										const lng = searchResult.lng;
										const lat = searchResult.lat;
										this.props.mapComponent._flyTo({ lng: lng, lat: lat, zoom: 12, displayActiveMarker: true });
										// scrape location data
										this.props.mapComponent.compileActiveLocationData(searchResult);
										this.props.mapComponent.showLocationCard(this.props.mapComponent.state.activeLocationData);
									}
									
									// MAKE FUNCTION: DISPLAY LOCATION CARD
									// used for reverse geocoding AND flyTo search clicks
									// displays location in a card with image and data using lngLat
									// can call in both clicking on map, and from here with its lngLat
									// also displays location marker, instead of _flyTo().
								}} 
								key={Math.random()}
								title={searchResult.place}
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
							)
						}
					</Card>
				}
			</div>
			

			
		)
	}



}

export default MapSearchBar;
