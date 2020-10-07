import React, { useState } from 'react';

// import { Card, Button, CardTitle, CardText, Row, Col, Form, FormGroup, Label, Input, ButtonDropdown } from "reactstrap";
import { Card } from 'reactstrap';

// Css
import '../App.css';
import './components-styles/WaymessageMenu.css';

// Dependencies
import mapboxgl from 'mapbox-gl';
import ReactMapGL, { GeolocateControl, Marker, Layer, FlyToInterpolator, MapController } from 'react-map-gl';
import Joi from "joi";

// backend api functions
import * as api from '../api'; 

import UserStore from '../stores/UserStore';

// Component Dependencies
import MapHomeDock from './MapHomeDock';
import WaymessageMenuComponent from './WaymessageMenuComponent';
import MapContextMenu from './MapContextMenu';

// Icons
import userLocationIcon from "../resources/map/userlocation_icon.svg";
import userActiveMarkerIcon from "../resources/map/activeMarkerIcon.svg";
import locationMarkerIcon from '../resources/map/locationMarkerIcon.svg';
import waymessageIcon from "../resources/map/waymessage_icon.svg";

import torontoImage from '../resources/map/toronto-image.jpg';

import citySearchIcon from "../resources/maki-icons/building-alt1-15.svg";

const MAPBOX_TOKEN = "pk.eyJ1Ijoic2VsZmRyaXZpbmdkcml2ZXIiLCJhIjoiY2tlZGhwd28wMDE0aDJ5b3pic2d5Mm55YSJ9.zKnna2oVzmFrkXCjdEVsuA";
mapboxgl.accessToken = MAPBOX_TOKEN;

const waymessage_schema = Joi.object({
    // waymessage schema for client-side frontend as well as backend db insertion
    // only validates username + message instead, lat/lng comes from map, no need

    username: Joi.string()
        .regex(/^[a-zA-ZÀ-ÿ0-9-_]{1,30}$/)
        .required(),

    message: Joi.string()
        .min(1)
        .max(300)
        .required(),
})

const ISLOGGEDIN_API_URL = window.location.hostname === "localhost" ? "http://localhost:1337/api/isLoggedIn" : "production-url-here";

class MapComponent extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			map: null,
			viewport: {
				width: '100vw',
				height: '100vh',
				latitude: 0,
				longitude: 0,
				zoom: 12,
				pitch: 0,
			},
			activeMarker: null,

			homeDockOpen: false,

			userPosition: {
				lat: 0,
				lng: 0,
			},
			hasUserPosition: false,

			hasActiveMarker: false,
			activeMarkerPosition: {
				lat: 0,
				lng: 0
			},

			hasActiveStart: false,
			startPosition: {
				lat: 0,
				lng: 0
			},
			hasActiveDestination: false,
			destinationPosition: {
				lat: 0,
				lng: 0
			},

			lastClicked: {
				x: 0,
				y: 0,
			},

			userWayMessage: {
				message: ""
			},

			showHomeDock: true,
			showLocationDataCard: false,
			showContextMenu: false,
			showSearchResults: false,
			showWaymessageMenu: false,

			waymessages: [],
			searchResultLocations: [],
			activeLocationData: [],
		}
	}
	
	moveHomeDock = () => {
		const homeDock = document.getElementById("map-home-dock");
		const dockCloseButton = document.getElementById("map-home-dock-close-button");

		this.setState( (prevState) => ({
				homeDockOpen: !prevState.homeDockOpen,
		}));

		if (this.state.homeDockOpen) {
			// close home dock

			homeDock.classList.remove("map-home-dock-open");

			// move close button
			dockCloseButton.classList.remove("map-home-dock-close-button-open");
		}
		else
		{
			// open home dock

			homeDock.classList.add("map-home-dock-open");

			// move close button
			dockCloseButton.classList.add("map-home-dock-close-button-open");
		}
	}

	initializeMapMarkers() {
		// add user's marker to location
		// var userMarker = new mapboxgl.Marker({
		// 	// marker options
		// })
		// 	.setLngLat([this.state.userPosition.lng, this.state.userPosition.lat])
		// 	.addTo(this.state.map);

		var userMarkerPopup = new mapboxgl.Popup().setText("user location");

		var userMarker = new mapboxgl.Marker()
			.setLngLat([this.state.userPosition.lng, this.state.userPosition.lat])
			.setPopup(userMarkerPopup)
			.addTo(this.state.map);
	}

	initializeMap() {
		const map = document.getElementById('map-div');
	}

	clickMap = (event) => {
		this.setState({
			lastClicked: {
				x: event.center.x,
				y: event.center.y,
			}
		});
		if (!this.state.showWaymessageMenu)
			this.updateWaymessageMenuPosition();

		if (event.leftButton) {
			if (this.state.showContextMenu) {
				this.hideContextMenu();
			}
			if (this.state.showSearchResults) {
				this.hideSearchResults({reset: false});
			}
		}
		
	}

	dblClickMap = (event) => {
		if (event.leftButton) {
			this.placeActiveMarker(event);	
			this.reverseGeocode(event);
		}
		
	}

	placeActiveMarker = (event) => {
		// console.log(event);
		const coords = {
			lng: event.lngLat[0],
			lat: event.lngLat[1]
		};
	
		if (!this.state.hasActiveMarker) {
			// doesn't have marker yet, create one and add it.
			this.setState({
				hasActiveMarker: true,
				activeMarkerPosition: {
					lat: coords.lat,
					lng: coords.lng,
				},
			});
	
		} else {
			// user has active marker, just move it.
			this.setState({
				activeMarkerPosition: {
					lat: coords.lat,
					lng: coords.lng,
				},
			});
		}
	}

	toggleWaymessageMenu = () => {

		if (!this.state.showWaymessageMenu) {
			// show form
			this.showWaymessageMenu();
		} else {
			// fade form
			this.hideWaymessageMenu();
		}
	}

	hideWaymessageMenu = () => {
		const waymessageDiv = document.getElementById("waymessage-menu-div");
		const waymessageMenu = document.getElementById("waymessage-menu");

		waymessageDiv.classList.add("waymessage-menu-hidden");
		waymessageDiv.style.width = '0px';
		waymessageMenu.style.width = '0px';
		
		this.setState({ showWaymessageMenu: false });
	}

	showWaymessageMenu = () => {
		const waymessageDiv = document.getElementById("waymessage-menu-div");
		const waymessageMenu = document.getElementById("waymessage-menu");

		waymessageDiv.classList.remove("waymessage-menu-hidden");
		waymessageDiv.style.width = '30%';
		waymessageMenu.style.width = '100%';

		this.updateWaymessageMenuPosition();

		this.setState({ showWaymessageMenu: true });
	}

	updateWaymessageMenuPosition = () => {
		const waymessageDiv = document.getElementById("waymessage-menu-div");
		const x = this.state.lastClicked.x;
		const y = this.state.lastClicked.y;

		waymessageDiv.style.top = `${y}px`;
		waymessageDiv.style.left = `${x}px`;
	}

	toggleContextMenu = (event) => {
		// console.log(event);
		event.preventDefault();

		const menu = document.getElementById('map-context-menu');

		const x = event.center.x;
		const y = event.center.y;

		menu.style.top = `${y}px`;
		menu.style.left = `${x}px`;
		
		if (!this.state.showContextMenu) {
			// make visible
			menu.classList.remove('hidden');
		} else {
			menu.classList.add('hidden');
		}

		this.setState({ showContextMenu: !this.state.showContextMenu });
	}

	hideContextMenu = () => {
		this.setState({ showContextMenu: false });
	}

	showContextMenu = () => {
		this.setState({ showContextMenu: true });
	}

	toggleShowSearchResults = () => {
		this.setState({ showSearchResults: !this.state.showSearchResults });
	}

	hideSearchResults = ({ reset }) => {
		this.setState({ showSearchResults: false });
		if (reset) {
			this.setState({ searchResultLocations: [] });
		}
	}

	showSearchResults = () => {
		this.setState({ showSearchResults: true });
	}

	removeActiveMarker() {
		if (this.state.hasActiveMarker) {
			this.activeMarker.remove();
		}
	}

	reverseGeocode(event) {
		// get the location/city data using lng/lat to display in a card or popup
		const lng = event.lngLat[0];
		const lat = event.lngLat[1];

		let res = fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?
		access_token=${MAPBOX_TOKEN}`)
			.then(res => res.json())
			.then(data => {
				// console.log(data.features[0]);
				this.showLocationData(data.features[0]);
			});
	}

	showLocationData(loc) {
		// best or most fitting location given the query.
		this.setState({
			activeLocationData: loc,
			showLocationDataCard: true,
		});
		this.hideSearchResults({reset: false});
	}

	hideLocationData() {
		this.setState({
			showLocationDataCard: false
		});
	}

	forwardGeocode = ({ endpoint, query, autocomplete }) => {
		fetch(
			`https://api.mapbox.com/geocoding/v5/${endpoint}/${query}.json?
			access_token=${MAPBOX_TOKEN}&autocomplete=${autocomplete}`
		)
			.then(res => res.json())
			.then(data => { 

				// fill search results array with this api call on every geocode api request.
				const tempsearchResultLocations = [];
				// console.log(data);

				for (let i = 0; i < 5; i++) {
					tempsearchResultLocations[i] = data.features[i];
				}
				
				this.setState({
					searchResultLocations: tempsearchResultLocations,
				});
				// console.log(this.state.searchResultLocations);
			});
	}

    async componentDidMount() {

        // isLoggedIn check on Map load	
        try {
          // fetch isLoggedIn api

          let res = await fetch(ISLOGGEDIN_API_URL, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
		  });
    
          let result = await res.json();
          if (result && result.success) {
            // user is logged in
            UserStore.loading = false;
            UserStore.isLoggedIn = true;
            UserStore.username = result.username;
          } else { 
            // user isn't logged in on the page
            UserStore.loading = false;
            UserStore.isLoggedIn = false;
            UserStore.username = '';
          }
        } 
        catch(e) {
          UserStore.loading = false;
          UserStore.isLoggedIn = false;
		}
    
        // Fetch all waymessages from backend db
        api.fetchWayMessages()
          .then(waymessages => {
            this.setState({
              waymessages
            })
          });
    
        // Grab user's location with geolocator/ip api.
        api.getUserLocation()
          .then(userPosition => {
			setTimeout(() => {
				this.setState({
					userPosition,
					hasUserPosition: true,
					zoom: 13,
				});
				this.initializeMap()
				// this.initializeMapMarkers();
			}, 0)
		  });
	}

	componentWillUnmount() {
		// destructor
	}
      
    // Callback whenever user waymessage form values change.
    waymessageValueChanged = (event) => {
		const { name, value } = event.target;
		this.setState((prevState) => ({
			userWayMessage: {
			...prevState.userWayMessage, // keep same previous object
			[name]: value // update a single property (name)
			}
		}))
	}
	
	waymessageFormIsValid = () => {
        const userMessage = {
            username: UserStore.username,
            message: this.state.userWayMessage.message,
        };
        const result = waymessage_schema.validate(userMessage)

        return !result.error ? true : false
    }

    // Onclick "Send" method user waymessage form.
    waymessageFormSubmit = (event) => {
        event.preventDefault();

        if (this.waymessageFormIsValid()) {
            // Request backend API to insert user WayMessage into database.
            this.hideWaymessageMenu();

            const waymessage = {
				username: UserStore.username,
				message: this.state.userWayMessage.message,
				latitude: this.state.userPosition.lat,
				longitude: this.state.userPosition.lng,
			};

			api.sendWayMessage(waymessage)
			 .then((message) => {
				console.log(message);
			});
		}
	}

	_onViewportChange = viewport => this.setState({
		viewport: { ...this.state.viewport, ...viewport }
	});

	_flyTo = ({lat, lng, zoom, displayActiveMarker}) => {
		this._onViewportChange({
			latitude: lat,
			longitude: lng,
			zoom: zoom,
			pitch: 0,
			transitionInterpolator: new FlyToInterpolator(),
			transitionDuration: 0
		});

		if (displayActiveMarker) {
			this.setState({
				displayActiveMarker: true,
				activeMarkerPosition: {
					lat: lat,
					lng: lng
				},
			});
			
		}
	}

    render() {
		const { viewport } = this.state;

		const mapController = new MapController();

		const settings = {
			doubleClickZoom: false
		};

        return (
            <div className="map" id="map-div">

				{this.state.hasUserPosition ?
					<ReactMapGL
						{...viewport}
						{...settings}
						width="100vw"
						height="100vh"
						controller={ mapController }
						mapStyle="mapbox://styles/mapbox/streets-v11"
						mapboxApiAccessToken={MAPBOX_TOKEN}
						onViewportChange={ this._onViewportChange }
						onMouseDown={ this.clickMap }
						onDblClick={ this.dblClickMap }
						onContextMenu={ this.toggleContextMenu }
					>
						
						{/* Add 3d buildings layer to map */}
						<Layer
							id='3d-buildings'
							source= 'composite'
							source-layer= 'building'
							filter={['==', 'extrude', 'true']}
							type= 'fill-extrusion'
							minzoom={15}
							paint={{
								'fill-extrusion-color': '#aaa',
										
								// use an 'interpolate' expression to add a smooth transition effect to the
								// buildings as the user zooms in
								'fill-extrusion-height': [
									'interpolate',
									['linear'],
									['zoom'],
									15,
									0,
									15.05,
									['get', 'height']
								],
								'fill-extrusion-base': [
									'interpolate',
									['linear'],
									['zoom'],
									15,
									0,
									15.05,
									['get', 'min_height']
								],
								'fill-extrusion-opacity': 0.6,
							}}>	
						</Layer>

						<Marker className="map-marker" latitude={ this.state.activeMarkerPosition.lat } longitude={ this.state.activeMarkerPosition.lng } offsetLeft={-21} offsetTop={-40}>
							<div>
								<img src={userActiveMarkerIcon} alt="img" />
							</div>
						</Marker>

						<GeolocateControl
							style={{display: 'none', float: 'right', margin: 10 + 'px', padding: 5 + 'px'}}
							positionOptions={{enableHighAccuracy: true}}
							trackUserLocation={true}
							auto={true}
						/>

					</ReactMapGL>
				:
					''	
				}
				
				{/* REGULAR MAPBOX <div ref={el => this.mapContainer = el} className="map"></div> */}

				<div className="map-context-menu" id="map-context-menu">
					{ this.state.showContextMenu ?
						<MapContextMenu 
							hideContextMenu={this.hideContextMenu}
							showWaymessageMenu={this.showWaymessageMenu} />
					:
						''
					}
				</div>

				<div className="map-hud-cards">

					<Card body className="map-search-bar-card">
						<div className="search-bar-button"
							onClick={this.moveHomeDock}>
							<div className="search-bar-button__burger"></div>
						</div>
						
						<input 
							className="map-search-bar-search"
							onFocus={(e) => {
								this.showSearchResults();
								// this.hideLocationData();
							}}
							onChange={(e) => {
								// make api call to get best 5 results using search text,
								// set search result text to response data.
								
								if (e.target.value.length > 2) {
									// only send api request if query is >= 3 chars.
									this.forwardGeocode({
										endpoint: "mapbox.places", 
										query: e.target.value, 
										autocomplete: true, 
										displayActiveMarker: false
									});
								}

								if (e.target.value.length < 1) {
									// If clearing search bar, hide and empty search results.
									this.hideSearchResults({reset: true});
								} else {
									this.showSearchResults();
									// this.hideLocationData();
								}
								
							}}
							>
							
						</input>
					</Card>

					{ this.state.showLocationDataCard && this.state.activeLocationData != null ?
						<Card body className="map-location-data-bg-card"> 

							<img src={torontoImage} className="location-data-image"></img>
							<div>
								{this.state.activeLocationData.place_name}
							</div>
						
						</Card>
					:
						''
					}

					{ this.state.showSearchResults ?

						<Card body className="map-search-results-bg-card">
							{ this.state.searchResultLocations.map(item => 
								<div 
								className="map-search-result-div"
								onClick={ () => {						
									// stop showing search results when location is clicked.
									this.hideSearchResults({reset: false});
									// call flyTo method to move to this position.
									if (item != null) {
										const lng = item.center[0];
										const lat = item.center[1];
										this._flyTo({ lng: lng, lat: lat, zoom: 12, displayActiveMarker: true });
										// ITEM IS FEATURES[i]
										this.showLocationData(item);
									}
									
									// MAKE FUNCTION: DISPLAY LOCATION CARD
									// used for reverse geocoding AND flyTo search clicks
									// displays location in a card with image and data using lngLat
									// can call in both clicking on map, and from here with its lngLat
									// also displays location marker, instead of _flyTo().
								}} 
								key={Math.random()}
								>
									<img src={ citySearchIcon } className="map-search-result-icon"></img>
									<h1>{ item.place_name }</h1>
								</div>
							)}
						</Card>
					:
						''
					}
					
				</div>

                { this.state.showHomeDock ?
                    <MapHomeDock
						id="map-home-dock"
						moveHomeDock={this.moveHomeDock}
						homeDockOpen={this.state.homeDockOpen}
						toggleWaymessageMenu={this.toggleWaymessageMenu} 
						waymessageFormSubmit={this.waymessageFormSubmit} 
						waymessageValueChanged={this.waymessageValueChanged} 
						waymessageFormIsValid={this.waymessageFormIsValid}
					/>
                :
                    ''
                }
                
				<div className="waymessage-menu-div waymessage-menu-hidden" id="waymessage-menu-div">
					<WaymessageMenuComponent 
						waymessageValueChanged={this.waymessageValueChanged} 
						waymessageFormIsValid={this.waymessageFormIsValid} 
						waymessageFormSubmit={this.waymessageFormSubmit}
						toggleWaymessageMenu={this.toggleWaymessageMenu} 
					/>
					{ this.state.showWaymessageMenu  ?
						''
					: 
						''
					}
				</div>
        	</div>
        )
    }
}

export default MapComponent