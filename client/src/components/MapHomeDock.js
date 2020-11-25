import React from 'react';
// import { Card, Button, CardTitle, CardText, Row, Col, Form, FormGroup, Label, Input, ButtonDropdown } from "reactstrap";
import { Card } from 'reactstrap';

import { connect } from 'react-redux';

import * as api from '../api';

import $ from 'jquery';

import SubmitButton from './SubmitButton';
import leftArrow from '../resources/map-home-dock/left-arrow-close.png';
import rightArrow from '../resources/map-home-dock/right-arrow-open.png';


import './components-styles/MapHomeDock.scss'; // change to components css

class MapHomeDock extends React.Component {

	state = {	
		activeTab: "",
		savedLocations: {

		},
	}

	toggleTab(tab) {
		const mapTab = document.getElementById("map-tab");
		const publicTab = document.getElementById("public-tab");
		const friendsTab = document.getElementById("friends-tab");
		const placesTab = document.getElementById("places-tab");

		console.log(this.props.globalState);
		
		switch (tab) {
			case "map":
				if (mapTab != null) {
					if (!mapTab.classList.contains("dock-tab-section-open")) {
						mapTab.classList.add("dock-tab-section-open");
					} else { 
						mapTab.classList.remove("dock-tab-section-open");
					}
				}
				break;
			case "public":
				if (publicTab != null) {
					if (!publicTab.classList.contains("dock-tab-section-open")) {
						publicTab.classList.add("dock-tab-section-open");
					} else { 
						publicTab.classList.remove("dock-tab-section-open");
					}
				}
				break;

			case "friends":
				if (friendsTab != null) {
					if (!friendsTab.classList.contains("dock-tab-section-open")) {
						friendsTab.classList.add("dock-tab-section-open");
					} else { 
						friendsTab.classList.remove("dock-tab-section-open");
					}
				}
				break;
				
			case "places":
				if (placesTab != null) {
					if (!placesTab.classList.contains("dock-tab-section-open")) {
						placesTab.classList.add("dock-tab-section-open");
					} else { 
						placesTab.classList.remove("dock-tab-section-open");
					}
				}
				break;
		}
	}

    render() {

		const homeDockArrow = this.props.homeDockOpen ? leftArrow : rightArrow

        return (
			<Card body className="map-home-dock" id={this.props.id}>

				<div className="full-width-div text-center">
					<a className="home-dock-title" href="/">WAYGO</a>
					<button
						type="button"
						id="map-home-dock-close-button"
						className="map-home-dock-close-button" 
						onClick={this.props.moveHomeDock}>
						<img src={homeDockArrow} />
					</button>
				</div>

				<div className="dock-tabs">

					<ul className="full-width-div">
						<button className="dock-section-title" onClick={() => {
							this.toggleTab("map");
						}}
						>Map</button>
						<div className="dock-tab-section" id="map-tab">
							<li>
								<div className="dock-toggle-label">
									<a>show traffic</a>
									<input className="dock-switch" type="checkbox" />
								</div>
							</li>
							<li>
								<div className="dock-toggle-label">
									<a>show issues</a>
									<span className="dock-switch">
										<input type="checkbox" />
										<span className="dock-slider"></span>
									</span>
								</div>
							</li>
						</div>
						
					</ul>
					<ul className="full-width-div">
						<button className="dock-section-title" onClick={() => {
							this.toggleTab("public");
						}}
						>Public</button>
						<div className="dock-tab-section" id="public-tab">
							<li>
								<div className="dock-toggle-label" id="public-tab">
									<a>show waymessages</a>
									<span className="dock-switch">
										<input type="checkbox" />
										<span className="dock-slider"></span>
									</span>
								</div>
							</li>
							<li>
								<div className="dock-toggle-label">
									<a>show other</a>
									<span className="dock-switch">
										<input type="checkbox" />
										<span className="dock-slider"></span>
									</span>
								</div>
							</li>
						</div>
						
					</ul>
					<ul className="full-width-div">
						<button className="dock-section-title" onClick={() => {
							this.toggleTab("friends");
						}}
						>Friends</button>
						<div className="dock-tab-section" id="friends-tab">
							<li>
								<div className="dock-toggle-label">
									<a>Dislay my Location</a>
									<span className="dock-switch">
										<input type="checkbox" />
										<span className="dock-slider"></span>
									</span>
								</div>
							</li>
							<div className="display-my-location-li-div">
								<li>
									<div className="dock-toggle-label">
										<a>to all friends</a>
										<span className="dock-switch">
											<input type="checkbox" />
											<span className="dock-slider"></span>
										</span>
									</div>
								</li>
								<li>
									<div className="dock-toggle-label">
										<a>to certain people</a>
										<span className="dock-switch">
											<input type="checkbox" />
											<span className="dock-slider"></span>
										</span>
									</div>
								</li>
							</div>
							
							<li>
								<div className="dock-toggle-label">
										<a>show visable friends</a>
										<span className="dock-switch">
											<input type="checkbox" />
											<span className="dock-slider"></span>
										</span>
									</div>
								</li>
							<li>
								<div className="dock-toggle-label">
									<a>show friend waymessages</a>
									<span className="dock-switch">
										<input type="checkbox" />
										<span className="dock-slider"></span>
									</span>
								</div>
							</li>
						</div>
					</ul>

					<ul className="full-width-div">
						<button className="dock-section-title" onClick={() => {
							this.toggleTab("places");
						}}
						>Places</button>
						<div className="dock-tab-section" id="places-tab">
								{ this.props.globalState.userSavedLocationsState.map((place, index) =>
									<div className="saved-place-div" key={Math.random()} title={place.address || Math.random()}>
										<div className="location-data">
											{/* <div>
												<img className="saved-location-icon"></img>
											</div> */}

											{ place.title &&
												<span className="saved-location-title">
													{place.title}
												</span>
											}

											{ place.address &&
												<span className="saved-location-place">
													{place.address}
												</span>
											}
											
											
										</div>
										<div className="loc-remove-button-div">
											<button className="loc-remove-button" onClick={() => {
												index = JSON.stringify({
													index: index
												});
												api.deleteSavedLocationFromApi(index);
											}}>
												X
											</button>
										</div>

									</div>
								) }
							{ this.props.globalState.userState.isLoggedIn &&
								<div className="add-place-tab-button-div">
									<button className="add-place-tab-button" onClick={() => {
										console.log(this.props.mapComponent.state.savedLocations);
										this.props.mapComponent.promptSaveLocationDialogue();
										this.props.mapComponent.moveHomeDock();
									}}>
										<span>+ Add Place</span>

									</button>
								</div>
							}
						</div>
					</ul>

				</div>
				<div className="full-width-div">
					<a>Post a Waymessage</a>
					<SubmitButton 
						text="Post a Waymessage"
						className="btn dock-waymessage-button"
						onClick={this.props.toggleWaymessageMenu}
					>
					</SubmitButton>
				</div>
			</Card>
        );
    }

}

function mapStateToProps(globalState) {
	// Retrieve any data contained in redux global store.
	return {
		globalState
	};
}

export default connect(mapStateToProps)(MapHomeDock)