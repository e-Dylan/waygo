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
import activeMarkerIcon from '../resources/map/activeMarkerIcon.svg';
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
	}

	state = {
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

		lastClickedMap: {
			lng: 0,
			lat: 0,
		},
		lastClickedWin: {
			x: 0,
			y: 0,
		},

		userWayMessage: {
			message: ""
		},

		showLocation: true,
		showDirections: false,

		showMapSearchBar: true,
		showLocationCard: false,
		showDirectionsCard: false,

		showLocationSearchResults: false,
		showDirsFromSearchResults: false,
		showDirsToSearchResults: false,

		showHomeDock: true,
		showContextMenu: false,
		showWaymessageMenu: false,

		waymessages: [],
		searchResultItems: [],
		activeLocationData: {
			postal_code: "",
			address: "",
			city: "",
			region: "",
			country: ""
		},
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
			lastClickedMap: {
				lng: event.lngLat.lng,
				lat: event.lngLat.lat,
			}
		});
		if (!this.state.showWaymessageMenu)
			this.updateWaymessageMenuPosition();

		this.hideContextMenu();

		this.hideLocationSearchResults({reset: false});
		this.hideDirsSearchResults({reset: false});
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

		if (lng === 0 && lat === 0) {
			lng = this.state.lastClickedMap.lng;
			lat = this.state.lastClickedMap.lat;
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
			activeMarkerSvg.setAttribute('src', activeMarkerIcon);
			
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

		this.showLocation();
	}

	placeDestMarker(lng, lat) {

		if (lng === 0 && lat === 0) {
			lng = this.state.lastClickedMap.lng;
			lat = this.state.lastClickedMap.lat;
		}

		if (!this.state.hasDest) {
			// doesn't have marker yet, create one and add it.
			this.setState({
				hasDest: true,
				destMarkerPosition: {
					lat: lat,
					lng: lng,
				},
			});

			const destMarkerSvg = document.createElement('img')
			destMarkerSvg.setAttribute('class', 'map-marker');
			destMarkerSvg.setAttribute('src', destIcon);
			
			this.destMarker = new mapboxgl.Marker(destMarkerSvg)
			.setLngLat([lng, lat])
			.addTo(this.map);	
		} else {
			// user has dest marker, just move it.
			this.setState({
				destMarkerPosition: {
					lat: lat,
					lng: lng,
				},
			});

			this.destMarker.setLngLat([lng, lat]);
		}
	}

	placeOriginMarker(lng, lat) {

		// if clicking context menu (or non-map area), set waypoint
		// at previously clicked position on the map.
		if (lng === 0 && lat === 0 && this.state.lastClickedMap.lng != undefined && this.state.lastClickedMap.lat != undefined) {
			lng = this.state.lastClickedMap.lng;
			lat = this.state.lastClickedMap.lat;
		}

		if (!this.state.hasOrigin) {
			// doesn't have marker yet, create one and add it.
			this.setState({
				hasOrigin: true,
				originMarkerPosition: {
					lat: lat,
					lng: lng,
				},
			});

			const originMarkerSvg = document.createElement('img')
			originMarkerSvg.setAttribute('class', 'map-marker');
			originMarkerSvg.setAttribute('src', originIcon);
			
			this.originMarker = new mapboxgl.Marker(originMarkerSvg)
			.setLngLat([lng, lat])
			.addTo(this.map);
		} else {
			// user has dest marker, just move it.
			this.setState({
				originMarkerPosition: {
					lat: lat,
					lng: lng,
				},
			});

			this.originMarker.setLngLat([lng, lat]);
		}
		
		this.showDirectionsCard();
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
		const x = this.state.lastClickedWin.x;
		const y = this.state.lastClickedWin.y;

		waymessageDiv.style.top = `${y}px`;
		waymessageDiv.style.left = `${x}px`;
	}

	toggleContextMenu = (event) => {
		// console.log(event);
		event.preventDefault();

		const menu = document.getElementById('map-context-menu');

		const winX = event.point.x;
		const winY = event.point.y;

		const lng = event.lngLat.lng;
		const lat = event.lngLat.lat;

		this.setState({
			// store window click position (for menus)
			lastClickedMap: {
				lng: lng,
				lat: lat,
			},
			// store map click position (for markers)
			lastClickedWin: {
				x: winX,
				y: winY,
			},
		});

		menu.style.top = `${winY}px`;
		menu.style.left = `${winX}px`;

		if (!this.state.showContextMenu) {
			// make visible
			menu.classList.remove('hidden');
		} else {
			menu.classList.add('hidden');
		}

		this.setState({ showContextMenu: !this.state.showContextMenu });
	}

	showLocation = () => {
		this.setState({
			showLocation: true,
			showDirections: false
		});
	}

	hideLocation = () => {
		this.setState({ showLocation: false, })
	}

	showDirections = () => {
		this.setState({ 
			showDirections: true,
			showDirectionsCard: true
		});
	}

	hideDirections = () => {
		this.setState({ showDirections: false });
		this.hideDirsSearchResults({reset: false});
	}

	showDirectionsCard = () => {
		this.setState({
			showDirectionsCard: true
		});
	}

	showLocationCard = () => {
		if (!this.state.showLocationCard) {
			this.setState({
				showLocationCard: true,
			});

			this.hideLocationSearchResults({reset: false});
		}
	}

	hideLocationaCard() {
		this.setState({
			showLocationCard: false
		});
	}

	showDirectionsCard = () => {
		this.setState({ 
			showDirectionsCard: true,
		 });
	}

	hideDirectionsCard = () => {
		this.setState({
			showDirectionsCard: false
		});
	}

	hideContextMenu = () => {
		this.setState({ showContextMenu: false });
	}

	showContextMenu = () => {
		this.setState({ showContextMenu: true });
	}

	toggleLocationSearchResults = () => {
		this.setState({ showLocationSearchResults: !this.state.showLocationSearchResults });
	}

	hideLocationSearchResults = ({ reset }) => {
		this.setState({ showLocationSearchResults: false });
		if (reset) {
			this.setState({ searchResultItems: [] });
		}
	}

	showLocationSearchResults = () => {
		this.setState({ showLocationSearchResults: true });
	}

	showDirsSearchResults = (args) => {
		if (args.dir === "from") {
			this.setState({ 
				showDirsFromSearchResults: true,
				showDirsToSearchResults: false 
			});
		} else if (args.dir === "to") {
			this.setState({ 
				showDirsFromSearchResults: false,
				showDirsToSearchResults: true,
			 });
		}
	}

	hideDirsSearchResults = ({ reset }) => {
		this.setState({ showDirsFromSearchResults: false });
		this.setState({ showDirsToSearchResults: false });
		if (reset) {
			this.setState({ searchResultItems: [] });
		}
	}

	removeDestMarker() {
		if (this.state.hasDest) {
			this.destMarker.remove();
		}
	}

	hideMapSearchBar() {
		this.setState({ showMapSearchBar: false });
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
				this.showLocationCard(this.state.activeLocationData);
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
				const tempsearchResultItems = [];
				// console.log(data);

				for (let i = 0; i < 5; i++) {
					tempsearchResultItems[i] = data.features[i];
				}
				
				this.setState({
					searchResultItems: tempsearchResultItems,
				});
				// console.log(this.state.searchResultItems);
			});
		}

		getDirections(profile, coords) {
		
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

	_flyTo = ({lat, lng, zoom, displayActiveMarker}) => {
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

		if (displayActiveMarker) {
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
					{ this.state.showContextMenu &&
						<MapContextMenu 
							hideContextMenu={this.hideContextMenu}
							showWaymessageMenu={this.showWaymessageMenu}
							placeOriginMarker={this.placeOriginMarker.bind(this)}
							placeDestMarker={this.placeDestMarker.bind(this)}
							placeActiveMarker={this.placeActiveMarker.bind(this)}
							lastClickedMap={this.state.lastClickedMap}
						/>
					}
				</div>

				<div className="map-hud-cards-col">

					{ this.state.showMapSearchBar && this.state.showLocation &&
						<Card body className="map-search-bar-card">
							<div className="search-bar-button"
								onClick={this.moveHomeDock}>
								<div className="search-bar-button__burger"></div>
							</div>
							
							<input 
								className="map-search-bar-search input-search-bar"
								placeholder="where to?"	
								onFocus={(e) => {
									this.showLocationSearchResults();
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
										this.hideLocationSearchResults({reset: true});
									} else {
										this.showLocationSearchResults();
									}
									
								}}
								>
							</input>
							
							{/* SHOW DIRECTIONS SEARCH-BAR BUTTON */}
							<div 
								className="show-dirs-searchbar-button"
								onClick={() => {
									this.hideLocation();
									this.showDirections();
								}}
							>
								<img src={directionsCarIcon}></img>
							</div>
						</Card>
					}

					{ this.state.showDirectionsCard && this.state.showDirections &&
						<Card body className="map-hud-card directions-card">
							<div className="dirs-title">
								<div className="dirs-burger"
									onClick={this.moveHomeDock}>
									<div className="search-bar-button__burger"></div>
								</div>

								<div 
									className="show-loc-searchbar-button"
									onClick={() => {
										this.hideDirections();
										this.showLocation();
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
										placeholder="from"
										onFocus={(e) => {
											this.showDirsSearchResults({dir: "from"});
										}}
										onChange={(e) => {
											if (e.target.value.length > 2) {
												// make request for locations only if 3+ chars
												this.forwardGeocode({
													endpoint: "mapbox.places", 
													query: e.target.value, 
													autocomplete: true, 
													displayActiveMarker: false
												});

												if (e.target.value.length < 1) {
													// If clearing search bar, hide and empty search results.
													this.hideDirsSearchResults({dir: "from", reset: true });
												} else {
													this.showDirsSearchResults({dir: "from"});
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
										placeholder="to"
										onFocus={(e) => {
											this.showDirsSearchResults({dir: "to"});
										}}
										onChange={(e) => {
											if (e.target.value.length > 2) {
												// make request for locations only if 3+ chars
												this.forwardGeocode({
													endpoint: "mapbox.places", 
													query: e.target.value, 
													autocomplete: true, 
													displayActiveMarker: false
												});

												if (e.target.value.length < 1) {
													// If clearing search bar, hide and empty search results.
													this.hideDirsSearchResults({dir: "to", reset: true });
												} else {
													this.showDirsSearchResults({dir: "to"});
												}
											}
										}}
									>
									{/* <img src={directionsCarIcon}></img> */}
										
									</input>
								</div>
							</div>

							{ this.state.showDirsFromSearchResults && this.state.searchResultItems.length > 0 &&
											
								<Card className="search-results-bg-card dirs-from-search-results">
									{ this.state.searchResultItems.map(item =>

										<div 
										className="search-result-div"
										onClick={ () => {
											this.hideDirsSearchResults({dir: "to", reset: false });
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

							{ this.state.showDirsToSearchResults && this.state.searchResultItems.length > 0 &&

								<Card className="search-results-bg-card dirs-to-search-results">
									{ this.state.searchResultItems.map(item =>

										<div 
										className="search-result-div"
										onClick={ () => {
											this.hideDirsSearchResults({ reset: false });
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
					}

					{ this.state.showLocationSearchResults && this.state.showLocation &&

						<Card body className="search-results-bg-card">
							{ this.state.searchResultItems.map(item => 
								<div 
								className="search-result-div"
								onClick={ () => {						
									// stop showing search results when location is clicked.
									this.hideLocationSearchResults({reset: false});
									// call flyTo method to move to this position.
									if (item != null) {
										// console.log(item);
										const lng = item.center[0];
										const lat = item.center[1];
										this._flyTo({ lng: lng, lat: lat, zoom: 12, displayActiveMarker: true });
										// ITEM IS FEATURES[i]
										// scrape location data
										this.compileActiveLocationData(item);
										this.showLocationCard(this.state.activeLocationData);
									}
									
									// MAKE FUNCTION: DISPLAY LOCATION CARD
									// used for reverse geocoding AND flyTo search clicks
									// displays location in a card with image and data using lngLat
									// can call in both clicking on map, and from here with its lngLat
									// also displays location marker, instead of _flyTo().
								}} 
								key={Math.random()}
								title={item.place_name}
								>

									<div>
										<img src={ citySearchIcon } className="search-result-icon"></img>
									</div>
									<span className="search-result-title" title={item.place_name}>
										<span className="bold">{item.place_name}</span>
										{/* SCRAPE DATA PROPERLY FROM RETRIEVED PLACE AND
										DISPLAY IN PROPER FONTS IN SEARCH RESULTS */}
										{item.place_name}
									</span>
									<span className="item-description">
										{item.place_name}
										<span className="mark bold">Toronto</span>
										HBD 24R
									</span>

								</div>
							)}
						</Card>

					}

					{ this.state.showLocationCard && this.state.activeLocationData != null && this.state.showLocation &&
						<Card body className="map-hud-card location-card"> 

							{/* <img src={torontoImage} className="location-data-image"></img> */}
							
							<div className="location-title">
								{this.state.activeLocationData.place_type === "place" ?
								/* MAKE CARD DESIGN HERE USING SCRAPED DATA (Toronto, ON, CANADA) */
									this.state.activeLocationData.city
								: this.state.activeLocationData.place_type === "poi" ?
									this.state.activeLocationData.address
								: this.state.activeLocationData.place_type === "country" ?
									this.state.activeLocationData.country
								:
									''
								}
							</div>
							<div className="location-data">
								<div className="location-title">Toronto</div>
								<div className="location-subtitle">Ontario, CA</div>
								<button className="get-dirs-button">
									directions
								</button>
							</div>
							
						</Card>
					}
					
				</div>

                { this.state.showHomeDock &&
                    <MapHomeDock
						id="map-home-dock"
						moveHomeDock={this.moveHomeDock}
						homeDockOpen={this.state.homeDockOpen}
						toggleWaymessageMenu={this.toggleWaymessageMenu} 
						waymessageFormSubmit={this.waymessageFormSubmit} 
						waymessageValueChanged={this.waymessageValueChanged} 
						waymessageFormIsValid={this.waymessageFormIsValid}
					/>
                }
                
				<div className="waymessage-menu-div waymessage-menu-hidden" id="waymessage-menu-div">
					<WaymessageMenuComponent 
						waymessageValueChanged={this.waymessageValueChanged} 
						waymessageFormIsValid={this.waymessageFormIsValid} 
						waymessageFormSubmit={this.waymessageFormSubmit}
						toggleWaymessageMenu={this.toggleWaymessageMenu} 
					/>
					{ this.state.showWaymessageMenu  &&
						''
					}
				</div>
        	</div>
        )
    }
}

export default MapComponent