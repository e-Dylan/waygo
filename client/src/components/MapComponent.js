import React, { useState } from 'react';

// import { Card, Button, CardTitle, CardText, Row, Col, Form, FormGroup, Label, Input, ButtonDropdown } from "reactstrap";
import { Card } from 'reactstrap';

// Css
import '../App.css';
import './components-styles/MapComponent.css';
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
import destIcon from "../resources/map/destIcon.svg";
import originIcon from '../resources/map/originIcon.svg';
import waymessageIcon from "../resources/map/waymessage_icon.svg";
import directionsCarIcon from "../resources/maki-icons/car-15.svg";
import directionsBuildingIcon from "../resources/maki-icons/building-alt1-15.svg";

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
		this.map = null;
		this.destMarker = null;
		this.originMarker = null;

		// binding this class's function allows it to be passed to child 
		// components while maintainings its state information
		this.placeOriginMarker = this.placeOriginMarker.bind(this);
		this.placeDestMarker = this.placeDestMarker.bind(this);
		this.placeActiveMarker = this.placeActiveMarker.bind(this);

		this.state = {
			viewport: {
				width: '100vw',
				height: '100vh',
				latitude: 0,
				longitude: 0,
				zoom: 12,
				pitch: 0,
			},

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

			hasDest: false,
			destMarkerPosition: {
				lat: 0,
				lng: 0
			},
			hasOrigin: false,
			originMarkerPosition: {
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
			showSearchBar: true,
			showLocationDataCard: false,
			showDirectionsCard: false,
			showContextMenu: false,
			showSearchResults: false,
			showWaymessageMenu: false,

			waymessages: [],
			searchResultLocations: [],
			activeLocationData: {
				postal_code: "",
				address: "",
				city: "",
				region: "",
				country: ""
			},
		}
	}

	compileActiveLocationData(data) {
		var place_type;
		var postal_code;
		var address;
		var city;
		var region;
		var country;
		
		// data coming in will be an individual location item.
		// possible place_types: ["poi"], ["place"] (city), ["country"]

		// if (data.place_type[0] == "place") {
		// 	place_type = "place";
		// 	for (var i = 0; i < data.context.length; i++) {
		// 		if (data.context[i].id.includes("country"))
		// 			country = data.context[i].text;
		// 		if (data.context[i].id.includes("region"))
		// 			region = data.context[i].text;
		// 		if (data.context[i].id.includes("postcode"))
		// 			postal_code = data.context[i].text;
		// 		if (data.context[i].id.includes("address"))
		// 			address = data.context[i].text;
		// 		if (data.id.includes("place"))
		// 			city = data.text;
		// 	}
		// } else if (data.place_type[0] == "country") {
		// 	place_type = "country";

		// } else if (data.place_type[0] == "poi") {
		// 	place_type = "poi";
		// }

		var activeLocationData = {
			place_type: place_type,
			postal_code: postal_code,
			address: address,
			city: city,
			region: region,
			country: country
		};
		this.setState({
			activeLocationData: activeLocationData
		});
		console.log(activeLocationData);
		
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

	}

	initializeMap() {
		this.map = new mapboxgl.Map({
			container: this.mapContainer,
			style: 'mapbox://styles/mapbox/streets-v11',
			center: this.state.userPosition,
			zoom: 12
		});

		this.map.on('click', (event) => {
			this.clickMap(event);
		})

		this.map.on('contextmenu', (event) => {
			this.toggleContextMenu(event);
		})

		this.map.on('dblclick', (event) => {
			this.dblClickMap(event);
		})

		// Position at user.
		const geolocate = new mapboxgl.GeolocateControl({
			container: this.geolocateContainer,
			positionOptions: {
				enableHighAccuracy: true,
			},
			showUserLocation: true,
			showAccuracyCircle: false,
			trackUserLocation: true,
			auto: true,
		});

		this.map.addControl(geolocate);

		this.map.on('load', () => {
			geolocate.trigger();

			// Insert the layer beneath any symbol layer.
			var layers = this.map.getStyle().layers;
			
			var labelLayerId;
			for (var i = 0; i < layers.length; i++) {
				if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
					labelLayerId = layers[i].id;
					break;
				}
			}
			
			this.map.addLayer({
				'id': '3d-buildings',
				'source': 'composite',
				'source-layer': 'building',
				'filter': ['==', 'extrude', 'true'],
				'type': 'fill-extrusion',
				'minzoom': 15,
				'paint': {
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
						'fill-extrusion-opacity': 0.6
					}
				},
				labelLayerId
			);
		});
	}

	clickMap = (event) => {
		this.setState({
			lastClicked: {
				x: event.point.x,
				y: event.point.y,
			}
		});
		if (!this.state.showWaymessageMenu)
			this.updateWaymessageMenuPosition();

		this.hideContextMenu();

		if (this.state.showSearchResults) {
			this.hideSearchResults({reset: false});
		}
	}

	dblClickMap = (event) => {
		const coords = {
			lng: event.lngLat.lng,
			lat: event.lngLat.lat
		};
		event.preventDefault();
		this.placeActiveMarker(coords.lng, coords.lat);	
		this.reverseGeocode(event);		
	}

	placeActiveMarker(lng, lat) {

		if (lng == 0 && lat == 0) {
			lng = this.state.lastClicked.lng;
			lat = this.state.lastClicked.lat;
		}

		if (!this.state.hasActiveMarker) {
			// doesn't have marker yet, create one and add it.
			this.setState({
				hasActiveMarker: true,
				activeMarkerPosition: {
					lat: lat,
					lng: lng,
				},
			});

			const activeMarkerSvg = document.createElement('img')
			activeMarkerSvg.setAttribute('class', 'map-marker');
			activeMarkerSvg.setAttribute('src', destIcon);
			
			this.activeMarker = new mapboxgl.Marker(activeMarkerSvg)
			.setLngLat([this.state.activeMarkerPosition.lng, this.state.activeMarkerPosition.lat])
			.addTo(this.map);	
		} else {
			// user has dest marker, just move it.
			this.setState({
				activeMarkerPosition: {
					lat: lat,
					lng: lng,
				},
			});

			this.activeMarker.setLngLat([this.state.activeMarkerPosition.lng, this.state.activeMarkerPosition.lat]);
		}
	}

	placeDestMarker(lng, lat) {

		if (lng == 0 && lat == 0) {
			lng = this.state.lastClicked.lng;
			lat = this.state.lastClicked.lat;
		}

		if (!this.state.hasDestMarker) {
			// doesn't have marker yet, create one and add it.
			this.setState({
				hasDestMarker: true,
				destMarkerPosition: {
					lat: lat,
					lng: lng,
				},
			});

			const destMarkerSvg = document.createElement('img')
			destMarkerSvg.setAttribute('class', 'map-marker');
			destMarkerSvg.setAttribute('src', destIcon);
			
			this.destMarker = new mapboxgl.Marker(destMarkerSvg)
			.setLngLat([this.state.destMarkerPosition.lng, this.state.destMarkerPosition.lat])
			.addTo(this.map);	
		} else {
			// user has dest marker, just move it.
			this.setState({
				destMarkerPosition: {
					lat: lat,
					lng: lng,
				},
			});

			this.destMarker.setLngLat([this.state.destMarkerPosition.lng, this.state.destMarkerPosition.lat]);
		}
	}

	placeOriginMarker(lng, lat) {

		// if clicking context menu (or non-map area), set waypoint
		// at previously clicked position on the map.
		if (lng == 0 && lat == 0) {
			lng = this.state.lastClicked.lng;
			lat = this.state.lastClicked.lat;
		}

		if (!this.state.hasOriginMarker) {
			// doesn't have marker yet, create one and add it.
			this.setState({
				hasOrigin: true,
				originMarkerPosition: {
					lat: lat,
					lng: lng,
				},
			});

			console.log(this.state);

			const originMarkerSvg = document.createElement('img')
			originMarkerSvg.setAttribute('class', 'map-marker');
			originMarkerSvg.setAttribute('src', originIcon);
			
			this.originMarker = new mapboxgl.Marker(originMarkerSvg)
			.setLngLat([this.state.originMarkerPosition.lng, this.state.originMarkerPosition.lat])
			.addTo(this.map);
			console.log(this.map);
		} else {
			// user has dest marker, just move it.
			this.setState({
				originMarkerPosition: {
					lat: lat,
					lng: lng,
				},
			});

			this.originMarker.setLngLat([this.state.originMarkerPosition.lng, this.state.originMarkerPosition.lat]);
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
		waymessageMenu.classList.add("waymessage-menu-hidden");
		
		this.setState({ showWaymessageMenu: false });
	}

	showWaymessageMenu = () => {
		const waymessageDiv = document.getElementById("waymessage-menu-div");
		const waymessageMenu = document.getElementById("waymessage-menu");

		waymessageDiv.classList.remove("waymessage-menu-hidden");
		waymessageMenu.classList.remove("waymessage-menu-hidden");

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

		const x = event.point.x;
		const y = event.point.y;

		menu.style.top = `${y}px`;
		menu.style.left = `${x}px`;

		this.setState({
			lastClicked: {
				x: event.point.x,
				y: event.point.y,
			}
		});

		if (!this.state.showContextMenu) {
			// make visible
			menu.classList.remove('hidden');
		} else {
			menu.classList.add('hidden');
		}

		this.setState({ showContextMenu: !this.state.showContextMenu });
	}

	showLocationDataCard = () => {
		this.setState({
			showDirectionsCard: false,
			showSearchBar: true,
			showSearchResults: false,
			showLocationDataCard: false,
		})
	}

	showDirectionsCard = () => {
		this.setState({ 
			showDirectionsCard: true,
			showSearchBar: false,
			showSearchResults: false,
			showLocationDataCard: false,
		 });

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

	removeDestMarker() {
		if (this.state.hasDestMarker) {
			this.destMarker.remove();
		}
	}

	reverseGeocode(event) {
		// get the location/city data using lng/lat to display in a card or popup
		const lng = event.lngLat.lng;
		const lat = event.lngLat.lat;

		let res = fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?
		access_token=${MAPBOX_TOKEN}`)
			.then(res => res.json())
			.then(data => {
				this.compileActiveLocationData(data);
				this.showLocationData(this.state.activeLocationData);
			});
	}

	showLocationData(loc) {
		// best or most fitting location given the query.
		this.setState({
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
				this.initializeMap();
				this.initializeMapMarkers();
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

	_flyTo = ({lat, lng, zoom, displayDestMarker}) => {
		this._onViewportChange({
			latitude: lat,
			longitude: lng,
			zoom: zoom,
			pitch: 0,
		});

		this.map.flyTo({
			center: [lng, lat],
			essential: true,
			speed: 1,
			maxDuration: 1,
		});

		if (displayDestMarker) {
			this.placeDestMarker(lng, lat);
		}
	}

    render() {
		const { viewport } = this.state;

		const mapController = new MapController();

        return (
            <div className="map" id="map-div">

					{/* {...viewport}
					{...settings}
					controller={ mapController }
					ref={ (map) => {} }
					onViewportChange={ this._onViewportChange } */}

				{/* REGULAR MAPBOX  */}
				<div 
					ref={el => this.mapContainer = el}  
					className="map-container"
				>
				</div>

				<div className="map-context-menu" id="map-context-menu">
					{ this.state.showContextMenu ?
						<MapContextMenu 
							hideContextMenu={this.hideContextMenu}
							showWaymessageMenu={this.showWaymessageMenu}
							placeOriginMarker={this.placeOriginMarker}
							placeDestMarker={this.placeDestMarker}
							placeActiveMarker={this.placeActiveMarker}
							lastClicked={this.state.lastClicked}
						/>
					:
						''
					}
				</div>

				<div className="map-hud-cards-col">

					{ this.state.showSearchBar ?
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
											displayDestMarker: false
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
							
							<div 
								className="dirs-button"
								onClick={this.showDirectionsCard}
							>
								<img src={directionsCarIcon}></img>
							</div>
						</Card>
					:
						''
					}

					{ this.state.showLocationDataCard && this.state.activeLocationData != null ?
						<div>
							<Card body className="map-hud-card"> 

								<img src={torontoImage} className="location-data-image"></img>
								<div className="location-title">
									{this.state.activeLocationData.place_type == "place" ?
									/* MAKE CARD DESIGN HERE USING SCRAPED DATA (Toronto, ON, CANADA) */
										this.state.activeLocationData.city
									: this.state.activeLocationData.place_type == "poi" ?
										this.state.activeLocationData.address
									: this.state.activeLocationData.place_type == "country" ?
										this.state.activeLocationData.country
									:
										''
									}
								</div>
								<div className="location-subtitle">
									
								</div>
								<div className="directions-buttons">
									<button className="hud-card-button">
										to here
									</button>
									<button className="hud-card-button">
										from here
									</button>
								</div>
							
							</Card>
						</div>
					:
						''
					}

					{ this.state.showDirectionsCard ?
						<div>
							<Card body className="map-hud-card">
								<div className="dirs-title">
									<div className="dirs-burger"
										onClick={this.moveHomeDock}>
										<div className="search-bar-button__burger"></div>
									</div>
									directions

									<div 
										className="dirs-button"
										onClick={this.showLocationDataCard}
									>
										<img src={directionsBuildingIcon}></img>
									</div>

								</div>
								<div className="dirs-fromto">
									<div className="from-bar">
										<a className="dirs-label"></a>
										<input 
											className="dirs-input-bar"
											placeholder="from"
										>

										</input>
										{/* <img src={directionsCarIcon}></img> */}
									</div>
									<div className="to-bar">
										<a className="dirs-label"></a>
										<input 
											className="dirs-input-bar"
											placeholder="to"
										>
										{/* <img src={directionsCarIcon}></img> */}
											

										</input>
									</div>
								</div>
							</Card>
						</div>
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
										// console.log(item);
										const lng = item.center[0];
										const lat = item.center[1];
										this._flyTo({ lng: lng, lat: lat, zoom: 12, displayDestMarker: true });
										// ITEM IS FEATURES[i]
										// scrape location data
										this.compileActiveLocationData(item);
										// display location card.
										this.showLocationData(this.state.activeLocationData);
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