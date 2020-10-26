import React from 'react';
// import { Card, Button, CardTitle, CardText, Row, Col, Form, FormGroup, Label, Input, ButtonDropdown } from "reactstrap";
import { Card } from 'reactstrap';

// import $ from 'jquery';

import SubmitButton from './SubmitButton';
import leftArrow from '../resources/map-home-dock/left-arrow-close.png';
import rightArrow from '../resources/map-home-dock/right-arrow-open.png';


import './components-styles/MapHomeDock.css'; // change to components css

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
									<text>show traffic</text>
									<input className="dock-switch" type="checkbox" />
								</div>
							</li>
							<li>
								<div className="dock-toggle-label">
									<text>show issues</text>
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
									<text>show waymessages</text>
									<span className="dock-switch">
										<input type="checkbox" />
										<span className="dock-slider"></span>
									</span>
								</div>
							</li>
							<li>
								<div className="dock-toggle-label">
									<text>show other</text>
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
									<text>Dislay my Location</text>
									<span className="dock-switch">
										<input type="checkbox" />
										<span className="dock-slider"></span>
									</span>
								</div>
							</li>
							<div className="display-my-location-li-div">
								<li>
									<div className="dock-toggle-label">
										<text>to all friends</text>
										<span className="dock-switch">
											<input type="checkbox" />
											<span className="dock-slider"></span>
										</span>
									</div>
								</li>
								<li>
									<div className="dock-toggle-label">
										<text>to certain people</text>
										<span className="dock-switch">
											<input type="checkbox" />
											<span className="dock-slider"></span>
										</span>
									</div>
								</li>
							</div>
							
							<li>
								<div className="dock-toggle-label">
										<text>show visable friends</text>
										<span className="dock-switch">
											<input type="checkbox" />
											<span className="dock-slider"></span>
										</span>
									</div>
								</li>
							<li>
								<div className="dock-toggle-label">
									<text>show friend waymessages</text>
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
							<li>
								<div className="dock-toggle-label" id="places-tab">
									<text>Home</text>
									<span className="dock-switch">
										<input type="checkbox" />
										<span className="dock-slider"></span>
									</span>
								</div>
							</li>
							<li>
								<div className="dock-toggle-label">
									<text>Work</text>
									<span className="dock-switch">
										<input type="checkbox" />
										<span className="dock-slider"></span>
									</span>
								</div>
							</li>
						</div>
					</ul>

				</div>
				<div className="full-width-div">
					<text>Post a Waymessage</text>
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

export default MapHomeDock

/*

<div className="dock-tab-bar">
					<button className="dock-tab-button"
						onClick={() => {
							this.showTab("map");
						}}
					>
					Map
					</button>
					<button className="dock-tab-button"
						onClick={() => {
							this.showTab("saved");
						}}
					>
					Saved
					</button>
				</div>

<Card body className = "map-home-dock" id={this.props.id}>
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

				<ul className="full-width-div">
					<text className="dock-section-title">Map</text>
					<li>
						<div className="dock-toggle-label">
							<text>show traffic</text>
							<span className="dock-switch">
								<input type="checkbox" />
								<span className="dock-slider"></span>
							</span>
						</div>
					</li>
					<li>
					<div className="dock-toggle-label">
							<text>show issues</text>
							<span className="dock-switch">
								<input type="checkbox" />
								<span className="dock-slider"></span>
							</span>
						</div>
					</li>
				</ul>
				<ul className="full-width-div">
					<text className="dock-section-title">Public</text>
					<li>
						<div className="dock-toggle-label">
							<text>show waymessages</text>
							<span className="dock-switch">
								<input type="checkbox" />
								<span className="dock-slider"></span>
							</span>
						</div>
					</li>
					<li>
						<div className="dock-toggle-label">
							<text>show other</text>
							<span className="dock-switch">
								<input type="checkbox" />
								<span className="dock-slider"></span>
							</span>
						</div>
					</li>
				</ul>
				<ul className="full-width-div">
					<text className="dock-section-title">Friends</text>
					<li>
						<div className="dock-toggle-label">
							<text>Dislay my Location</text>
							<span className="dock-switch">
								<input type="checkbox" />
								<span className="dock-slider"></span>
							</span>
						</div>
					</li>
					<div className="display-my-location-li-div">
						<li>
							<div className="dock-toggle-label">
								<text>to all friends</text>
								<span className="dock-switch">
									<input type="checkbox" />
									<span className="dock-slider"></span>
								</span>
							</div>
						</li>
						<li>
							<div className="dock-toggle-label">
								<text>to certain people</text>
								<span className="dock-switch">
									<input type="checkbox" />
									<span className="dock-slider"></span>
								</span>
							</div>
						</li>
					</div>
					
					<li>
						<div className="dock-toggle-label">
								<text>show visable friends</text>
								<span className="dock-switch">
									<input type="checkbox" />
									<span className="dock-slider"></span>
								</span>
							</div>
						</li>
					<li>
						<div className="dock-toggle-label">
							<text>show friend waymessages</text>
							<span className="dock-switch">
								<input type="checkbox" />
								<span className="dock-slider"></span>
							</span>
						</div>
					</li>
				</ul>
				<div className="full-width-div">
					<text>Post a Waymessage</text>
					<SubmitButton 
						text="Post a Waymessage"
						className="btn dock-waymessage-button"
						onClick={this.props.toggleWaymessageMenu}
					>
					</SubmitButton>
				</div>
			</Card>
*/