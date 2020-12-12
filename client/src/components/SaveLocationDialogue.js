import React from "react";

import { Card } from 'reactstrap';

import * as mapApi from '../mapApi';

import waygoLogo from '../resources/logo/waygo-logo.png';
import locationIcon from '../resources/save-location-dialogue/map-marked-alt-solid.svg';
import addressIcon from '../resources/save-location-dialogue/at-solid.svg';
import citySearchIcon from "../resources/maki-icons/building-alt1-15.svg";


import '../App.css'
import './components-styles/SaveLocationDialogue.scss';



class SaveLocationDialogue extends React.Component {
	constructor(props) {
		super(props);
		this.mc = this.props.mapComponent;
	}

	state = {
		addressSearchResultItems: [],
		
		showAddressSearchResults: false,
		
		activeLocationToBeSaved: {},
	};

	hideAddressSearchResults = ({reset}) => {
		this.setState({ showAddressSearchResults: false, });
		if (reset) {
			this.setState({
				addressSearchResultItems: [],
			})
		}
	}

	showAddressSearchResults() {
		this.setState({
			showAddressSearchResults: true,
		});
	}

	updateActiveLocationToBeSaved(activeLocationData) {
		this.setState({ activeLocationToBeSaved: {
			title: activeLocationData.title,
			address: activeLocationData.full_place,
			lng: activeLocationData.lng,
			lat: activeLocationData.lat,
		} }, () => {
			// console.log(this.state);
		});
	}

	clearActiveLocationToBeSaved() {
		this.setState({ activeLocationData: {}})
	}

	render() {
		return(
			<div>
				<div className="save-location-dialogue-bg" id="save-location-dialogue-bg" onClick={() => {
					this.props.mapComponent.hideSaveLocationDialogue();
				}}></div>
				<Card body className="save-location-dialogue" id="save-location-dialogue-bg">
					<div className="title-section">
						<div className="title-image">
							<img src={ waygoLogo }></img>
						</div>
					</div>

					<div className="dialogue-text"><span>Save a location</span></div>

					<div className="center-container">

						<div className="input-container">
							<a className="fa fa-user icon">
								<img src={locationIcon}></img>
							</a>
							<input className="location-input-bar"
								type="text"
								id="title-input-bar"
								placeholder="name your location."
							/>
						</div>

						<div className="input-container">
							<a className="fa fa-user icon">
								<img src={addressIcon}></img>
							</a>
							<input
								className="location-input-bar"
								id="address-input-bar"
								placeholder="location address."
								autoComplete="off"
								onFocus={() => {
									this.showAddressSearchResults();
								}}
								onBlur={() => {
									// this.hideAddressSearchResults({reset: false});
								}}
								onChange={(e) => {
									const addressInputBar = document.getElementById('address-input-bar');
									if (e.target.value.length > 2) {
										// fetch search result items
										var searchResults = this.props.mapComponent.forwardGeocode({
											endpoint: "mapbox.places", 
											query: e.target.value, 
											autocomplete: true, 
										})
										.then(searchResults => {
											var compiledSearchResults = mapApi.compileLocationData(searchResults);
											this.setState({
												addressSearchResultItems: compiledSearchResults
											});

											var bestLocation = compiledSearchResults[0]
											bestLocation.title = document.getElementById('title-input-bar').value;
											this.updateActiveLocationToBeSaved(bestLocation);

											// Set placeholder with autocomplete location
											// addressInputBar.placeholder = bestLocation.full_place
										});
									} else if (e.target.value.length < 1) {
										// search bar is emptied, erase search results.
										this.hideAddressSearchResults({reset: true});
									}

									// SET ACTIVE USER LOCATION TO BE SAVED
									// EVERY ONCHANGE, AND ON PRESSING THE SAVE BUTTON
									// USE THE TOP RELAVENT SEARCH RESULT RETURNED
									// ONLY ALLOW TO SAVE IF ACTIVE TOBESAVED HAS A VALID
									// LNGLAT.
								}}
							>
							</input>
							{ this.state.showAddressSearchResults && this.state.addressSearchResultItems.length > 0 &&
								<Card className="search-results-bg-card search-results-bg-card-saveloc-dialogue dirs-from-search-results">
									{ this.state.addressSearchResultItems.map(searchResult =>

										<div 
											className="search-result-div"
											onClick={ (e) => {
												const addressInputBar = document.getElementById('address-input-bar')
												addressInputBar.value = searchResult.full_place
												this.hideAddressSearchResults({reset: false });
											}}
											key={Math.random()}
											title={searchResult.place_name}
										>
											<div>
												<img src={ citySearchIcon } className="search-result-icon"></img>
											</div>
											{ searchResult.address &&
												<span className="search-result-place">
													{searchResult.address}
												</span>
											}
											{ searchResult.place &&
												<span className="search-result-place" title={searchResult.place}>
													{searchResult.place}
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
						</div>
						
					</div>
					<button className="save-location-button" onClick={ () => {	
						const titleInputBar = document.getElementById('title-input-bar')
						const addressInputBar = document.getElementById('address-input-bar')

						// ADD NULL CHECK.

						if (titleInputBar.value.length > 0 && addressInputBar.value.length > 0) {
							// Add title to saving location.
							this.setState({
								activeLocationToBeSaved: {
									...this.state.activeLocationToBeSaved,
									title: titleInputBar.value
								},
							});
							
							// Ensure lng/lat.
							if (this.state.activeLocationToBeSaved.lng == null || this.state.activeLocationToBeSaved.lat == null) {
								alert('Failed to save location: invalid location.');
								return;
							}

							// Save final location to database.
							this.props.mapComponent.saveLocation(this.state.activeLocationToBeSaved);

							titleInputBar.value = ""
							addressInputBar.value = ""
						} else {
							// Fields were empty, show error and don't save.
							if (titleInputBar.value.length < 1)
								titleInputBar.classList.add('outline-error');
							if (addressInputBar.value.length < 1)
								addressInputBar.classList.add('outline-error');

							setTimeout(() => {
								titleInputBar.classList.remove('outline-error');
								addressInputBar.classList.remove('outline-error');
							}, 2000);
						}

						


					} }>Save</button>
				</Card>
			</div>
		);
	}
}

export default SaveLocationDialogue;