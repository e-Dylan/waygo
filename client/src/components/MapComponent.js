import React, { useState, useContext } from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setUserState } from '../redux/actions/setUserState';
import { setUserSavedLocationsState } from '../redux/actions/setUserSavedLocationsState';
import { addUserSavedLocation } from '../redux/actions/addUserSavedLocation';

// import { Card, Button, CardTitle, CardText, Row, Col, Form, FormGroup, Label, Input, ButtonDropdown } from "reactstrap";

// Css
import '../App.css';
import './components-styles/MapComponent.scss';
import './components-styles/WaymessageMenu.css';
import './components-styles/SaveLocationDialogue.scss';

// Dependencies
import mapboxgl from 'mapbox-gl';
import Joi from "joi";
import { distance } from '@turf/turf';

// backend api functions
import * as api from '../api';
import * as mapApi from '../mapApi';

// Component Dependencies
import MapHomeDock from './MapHomeDock';
import WaymessageMenuComponent from './WaymessageMenuComponent';
import MapContextMenu from './MapContextMenu';
import MapSearchBar from './MapSearchBar';
import MapLocationCard from './MapLocationCard';
import DirectionsCard from './DirectionsCard';
import RoutesCard from './RoutesCard';
import SaveLocationDialogue from './SaveLocationDialogue';

// Icons
import activeMarkerIcon from '../resources/map/activeMarkerIcon.svg';
import destIcon from "../resources/map/destIcon.svg";
import originIcon from '../resources/map/originIcon.svg';

const PRODUCTION_API_URL = "https://waygo.vercel.app/api";

const MapboxTraffic = require('@mapbox/mapbox-gl-traffic');

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

const ISLOGGEDIN_API_URL = window.location.hostname === "localhost" ? `${process.env.REACT_APP_DEVELOPMENT_API_URL}/isLoggedIn` : `${process.env.REACT_APP_PRODUCTION_API_URL}/isLoggedIn`;

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
		userPosition: {
			lat: 0,
			lng: 0,
		},
		prevUserPosition: {
			lat: 0,
			lng: 0,
		},
		hasUserLocation: false,

		hasActiveMarker: false,
		activeMarkerPosition: {
			lat: 0,
			lng: 0
		},

		hasDest: false,
		activeDest: {},
		destMarkerPosition: {
			lat: -84.512023,
			lng: 39.102779,
		},
		hasOrigin: false,
		activeOrigin: {},
		originMarkerPosition: {
			lat: -84.518641,
			lng: 39.134270
		},
		
		activeProfile: "driving",

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
		showRoutesCard: false,
		showUseCurrentLocationButton: false,

		showLocationSearchResults: false,
		showDirsFromSearchResults: false,
		showDirsToSearchResults: false,

		showContextMenu: false,
		showWaymessageMenu: false,
		showSaveLocationDialogue: true,

		waymessages: [],
		searchResultItems: [],
		activeLocationData: {
			postal_code: "",
			address: "",
			city: "",
			region: "",
			country: ""
		},
		savingLocationData: {
			postal_code: "",
			address: "",
			city: "",
			region: "",
			country: ""
		},

		activeRouteOptions: [
		],
		activeRoute: {},
		hasSelectedRoute: false,

		originIsCurrentPosition: false,
		hasActiveUserRoute: false,
		centeringInProgess: false,
	}

	compileActiveLocationData(data) {
		// data coming in will be an api location item.
		// display: Place (Address) City, Province, Country
	
		// check if data is an array, if so, scrape it
		// console.log(data);
		if (data.length != null)
			data = mapApi.compileLocationData(data)[0];

		// if data sent is a pre-scraped json object, just set it.

		this.setState({
			activeLocationData: data,
		});
	}

	/**
	 * Takes an array of mapbox api results for a search query,
	 * extracts necessary data from them (mapApi.compileLocationData),
	 * saves this data to the map state as compiled search results.
	 * 
	 * @param { data } array (len 5) of mapbox api returned locations from search query. 
	 */
	saveSearchResultsToMapState(data) {
		// console.log(data);
		if (data != null) {
			var searchResults = mapApi.compileLocationData(data);

			this.setState({
				searchResultItems: searchResults,
			});
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
		} else {
			// open home dock
			homeDock.classList.add("map-home-dock-open");
			// move close button
			dockCloseButton.classList.add("map-home-dock-close-button-open");
		}
	}

	initializeMap() {
		this.map = new mapboxgl.Map({
			container: this.mapContainer,
			style: 'mapbox://styles/mapbox/traffic-day-v2',
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

		// geolocate.on('geolocate', (e) => {
		// 	this.setState({
		// 		userPosition: {
		// 			lng: e.coords.longitude,
		// 			lat: e.coords.latitude,
		// 		},
		// 	}, () => {
		// 		console.log('saving user coords ' + e.coords.longitude);
		// 	});
		// })

		this.map.addControl(geolocate);

		this.map.on("moveend", () => {
			this.setState({
				centeringInProgess: false
			});
		});

		this.map.on('load', () => {
			geolocate.trigger();

			this.map.addControl(new MapboxTraffic({
				showTraffic: true,
				showTrafficButton: true,
			}));

			// #region Set 3d map layer.

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
			// #endregion
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
			.setLngLat([lng, lat])
			.addTo(this.map);	
		} else {
			// user has dest marker, just move it.
			this.setState({
				activeMarkerPosition: {
					lat: lat,
					lng: lng,
				},
			});

			this.activeMarker.setLngLat([lng, lat]);
		}

		this.showLocation();
	}

	removeActiveMarker() {
		this.activeMarker.remove();
		this.setState({ hasActiveMarker: false, activeMarkerPosition: {lat: 0, lng: 0} });
	}

	setActiveDest(locationData) {
		// remove any active routes when setting new destination or origin.
		this.endRoute();

		this.setState({
			activeDest: locationData,
			hasDest: true,
		}, () => {
			// console.log(this.state.activeDest);
			this.checkCalculateRoutes(false);
		});

		// set active to-value in dirs card to active destination whenever set.
		this.setToValue(locationData.full_place);
	
		// display button to use your own location when a destination is set.
		if (this.state.hasUserLocation) {
			this.showUseCurrentLocationButton(true);
		}
	}

	placeDestMarker(lng, lat, isUserPos) {

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

		this.setState({
			hasSelectedRoute: false,
		});

		if (isUserPos)
			this.reverseGeocodeUserPos(lng, lat, "dest");
		else
			// Set state's active destination position data.
			this.reverseGeocodeLoc(lng, lat, "dest");
	}

	setActiveOrigin(locationData) {
		// remove any active routes when setting new destination or origin.
		this.endRoute();
		
		this.setState({
			activeOrigin: locationData,
			hasOrigin: true,
			// originIsCurrentPosition: false,
		}, () => {
			this.checkCalculateRoutes(false);
		});
		
		// Set current directions card to the active origin.
		this.setFromValue(locationData.full_place);

		// display button to use your own location when a destination is set.
		if (this.state.hasUserLocation) {
			this.showUseCurrentLocationButton(true);
		}
	}

	placeOriginMarker(lng, lat, isUserPos) {

		// TAKE IN ORIGIN LOCATION DATA TO SET STATE ACTIVEORIGIN POSITION INSTEAD OF JUST LNGLAT
		// set active origin position in directions card ALSO DO FOR DESTINATION<

		// if clicking context menu (or non-map area), set waypoint
		// at previously clicked position on the map.
		if (lng === 0 && lat === 0 && this.state.lastClickedMap.lng !== undefined && this.state.lastClickedMap.lat !== undefined) {
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

		this.setState({
			originIsCurrentPosition: false,
			hasSelectedRoute: false,
		});
		
		if (isUserPos)
			this.reverseGeocodeUserPos(lng, lat, "origin");
		else
			// Set state's active origin position data.
			this.reverseGeocodeLoc(lng, lat, "origin");
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

	//#region Map Helpers

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
			showDirectionsCard: true,
			showRoutesCard: true,
		});
		// this.hideMapSearchBar();
	}

	hideDirections = () => {
		this.setState({ 
			showDirections: false,
			showRoutesCard: false,
		 });
		this.hideDirsSearchResults({reset: false});
	}

	showDirectionsCard = () => {
		this.setState({
			showDirectionsCard: true
		});
	}

	setFromValue = (query) => {
		setTimeout(() => {
			const fromBar = document.getElementById('from-dirs-bar');
			fromBar.value = query;
		}, 0)
	}
	
	setToValue = (query) => {
		setTimeout(() => {
			const toBar = document.getElementById('to-dirs-bar');
			toBar.value = query;
		}, 0)
	}

	showLocationCard = () => {
		this.setState({
			showLocationCard: true,
		});

		this.hideLocationSearchResults({reset: false});
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

	highlightFromToBars = (toggle) => {
		const borderLine = document.querySelector(".to-bar");

		if (borderLine) {
			if (toggle)
			borderLine.style.borderTopColor = "rgba(47, 160, 212, 0.8)";
		else
			borderLine.style.borderTopColor = "rgba(30, 30, 30, 0.3)";
		}
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

	showUseCurrentLocationButton(bool) {
		this.setState({
			showUseCurrentLocationButton: bool
		});
	}

	/**
	 * Called from RoutesCard using "GO" button when a route is selected.
	 * Can only be clicked if user's origin is their position, meaning assumes starting point is user position.
	 */
	startRoute() {
		this.setState({
			showRoutesCard: false,
			showUseCurrentLocationButton: false,
			hasSelectedRoute: false,
		});

		try {
			var zoomDuration = 1500; // milliseconds
			// Build functionality to zoom in on user and track them during their route.
			this.map.flyTo({
				center: [this.state.userPosition.lng, this.state.userPosition.lat],
				essential: true,
				speed: 1,
				maxDuration: 1,
			});
	
			this.map.zoomTo(18, {
				duration: zoomDuration,
			});

			// Keep the map centered as user moves.
			this.setState({
				hasActiveUserRoute: true
			}, () => {
				setTimeout(() => {
					// Both of these loops work with recursive timers to repeat during an active route.
					// They terminate when this.state.stayCentered == false.
					this.centerUserLoop();
					this.recalculateRouteLoop();
				}, zoomDuration)
				
			});
				
			// 	// Check if the user has passed any coordinates in their route, if so, remove them from the linestring
				
			// 	// Rotate the map to the direction the user is currently facing.
				
			// 	navigator.geolocation.getCurrentPosition((userPosition) => {
			// 		var coords = this.map.getSource('route')._data.geometry.coordinates;
			// 		console.log(coords);
			// 		console.log("positioning map. " + userPosition.coords.latitude + ", " + userPosition.coords.longitude);
			// 	});

			// 	for (var i = 0; i < coords.length; i++) {
					
			// 		var coordLng = coords[i][0];
			// 		var coordLat = coords[i][1];
			// 		var userLng = this.state.userPosition.lng;
			// 		var userLat = this.state.userPosition.lat;
			// 	}
			// 	break;
			// }
			
		} catch (e) {
			// avoid any null errors
		}
	}

	//#endregion

	// Fetches location data for lng,lat, compiles into scraped data to be stored in state.
	reverseGeocodeLoc(lng, lat, loc) {
		let res = fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?
		access_token=${MAPBOX_TOKEN}`)
			.then(res => res.json())
			.then(data => {
				var location = [data.features[0]]
				var locData = mapApi.compileLocationData(location)[0];

				if (loc === "origin") {
					this.setActiveOrigin(locData);
				} else if (loc === "dest") {
					this.setActiveDest(locData);
				}
				// console.log(locData);
				if (!this.state.showDirections) this.showDirections();
				this.hideLocation();
				this.showDirectionsCard();
			});
	}

	// Fetches user position and sets their location at this position to calculate their route,
	// Rather than finding the nearest address (inaccurate).
	reverseGeocodeUserPos(lng, lat, loc) {
		var locData = {
			lng: lng,
			lat: lat,
			full_place: "My Position",
		};

		if (loc === "origin") {
			this.setActiveOrigin(locData);
		} else if (loc === "dest") {
			this.setActiveDest(locData);
		}
	}

	// Recalculate a current route from user's current position, instantly
	// set it as their new active route.
	recalculateCurrentRoute(lng, lat) {
		if (!this.state.hasDest)
			return;

		// this.setFromValue(locData.full_place);
		// this.checkCalculateRoutes(true);

		console.log('recalculating');
		// Don't change any of active origin - still wants to be coming from the start point.
		// Recalculate on the fly, don't change any data.
		const locData = {
			lng: lng,
			lat: lat,
		}
		this.setState({
			activeOrigin: locData,
		}, () => {
			this.checkCalculateRoutes(true);
		});
	}

	reverseGeocode(event) {
		// get the location/city data using lng/lat to display in a card or popup
		const lng = event.lngLat.lng;
		const lat = event.lngLat.lat;

		let res = fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?
		access_token=${MAPBOX_TOKEN}`)
			.then(res => res.json())
			.then(data => {
				this.compileActiveLocationData(data.features);
				this.showLocationCard(this.state.activeLocationData);
			});
	}

	// @param ret: return compiled search results to caller. if false, results will only save to map component's state.
	// 					if true, results will not save to map component, only be returned.
	forwardGeocode = ({ endpoint, query, autocomplete }) => {
		return fetch(
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

			return tempsearchResultItems;
			// this.compileSearchResults(tempsearchResultItems);
		});
	}

	checkCalculateRoutes = (recalculation) => {
		if (this.state.activeOrigin.lat != null && this.state.activeDest.lat != null) {
			this.calculateRoutes(
				{
					lat: this.state.activeOrigin.lat, lng: this.state.activeOrigin.lng, 
				},
				{
					lat: this.state.activeDest.lat, lng: this.state.activeDest.lng
				},
				this.state.activeProfile || "driving",
				recalculation
			);
		}
	}

	getTravelColour = (profile) => {
		var travelColour;
		switch (profile) {
			case "driving": travelColour = "#4b30c2"; break;
			case "walking": travelColour = "#2283bf"; break;
			case "cycling": travelColour = "#30c25a"; break;
			default: travelColour = "#333333"; break;
		}
		return travelColour;
	}

	calculateRoutes = (origin, destination, profile, recalculation) => {

		if (origin === null || destination === null) 
			return;

		if (profile === null)
			profile = this.state.activeProfile;
			
		var travelColour = this.getTravelColour(profile);

		// https://api.mapbox.com/directions/v5/mapbox/cycling/-84.518641,39.134270;-84.512023,39.102779?
		

		// ADD PROMISE.ALL TO FETCH MULTIPLE DIFFERENT PROFILES AT ONCE FOR ALL RECC ROUTES.
		//https://stackoverflow.com/questions/59037553/fetch-multiple-urls-at-the-same-time

		fetch(
			`https://api.mapbox.com/directions/v5/mapbox/${profile}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?steps=true&overview=full&alternatives=true&geometries=geojson&access_token=${MAPBOX_TOKEN}`
		)
		.then(res => res.json())
		.then(data => {
			// console.log(data.routes);

			// Recalculating a route mid-route needs to be automatically set and displayed.
			// Doesn't need to go through route selection gui.
			if (recalculation) {
				var route = data.routes[0];
				this.drawActiveRoute(route, this.getTravelColour(this.state.activeProfile));
			} else {
				if (data.routes != null) {
					this.setState({
						showRoutesCard: true,
						activeRouteOptions: data.routes,
					});
				}
			}
		});
	}

	/**
	 * 
	 * @param route: obj{, , ,} -> a mapbox route object containing route metadata.
	 * @param travelColour: Colour of route path depending on profile.
	 */
	drawActiveRoute = (route, travelColour) => {
		var geojson = {
			type: 'Feature',
			properties: {},
			geometry: {
				type: 'LineString',
				coordinates: route.geometry.coordinates
			}
		};

		// if the route already exists on the map, reset it using setData
		// this.map.getSource('route').setData(geojson);
		// remove the layer, re-add with new data. cannot change data to just update it.
		this.removeDrawingRoute();
			
		this.map.addLayer({
			id: 'route',
			type: 'line',
			source: {
				type: 'geojson',
				data: {
					type: 'Feature',
					properties: {},
					geometry: {
						type: 'LineString',
						coordinates: geojson
					}
				}
			},
			layout: {
				'line-join': 'round',
				'line-cap': 'round'
			},
			paint: {
				'line-color': travelColour,
				'line-width': 7,
				'line-opacity': 0.8,
			}
		});	
		
		// Set layer data to geojson line once added.
		this.map.getSource('route').setData(geojson);
		// add turn instructions here at the end
	}

	drawHoveringRoute = (route, travelColour) => {
		var geojson = {
			type: 'Feature',
			properties: {},
			geometry: {
				type: 'LineString',
				coordinates: route.geometry.coordinates
			}
		};

		if (this.map.getSource('hovering-route')) {
			// if the route already exists on the map, reset it using setData
			this.map.getSource('hovering-route').setData(geojson);
		} else { // otherwise, make a new request
			
			this.map.addLayer({
				id: 'hovering-route',
				type: 'line',
				source: {
					type: 'geojson',
					data: {
					type: 'Feature',
					properties: {},
					geometry: {
						type: 'LineString',
						coordinates: geojson
					}
					}
				},
				layout: {
					'line-join': 'round',
					'line-cap': 'round'
				},
				paint: {
					'line-color': travelColour,
					'line-width': 5,
					'line-opacity': 0.4
				}
			});	
			
			// Set layer data to geojson line once added.
			this.map.getSource('hovering-route').setData(geojson);
		}
		// add turn instructions here at the end
	}

	removeHoveringRoute = () => {
		if (this.map.getSource('hovering-route')) {
			this.map.removeLayer('hovering-route');
			this.map.removeSource('hovering-route');
		}
		
	}

	removeDrawingRoute = () => {
		if (this.map.getSource('route')) { 
			this.map.removeLayer('route');
			this.map.removeSource('route');
		}
	}

	endRoute = () => {
		this.removeDrawingRoute();

		// Stop centering loop on the user.
		this.setState({
			hasActiveUserRoute: false,
		});

		// Clear state active route?
		// Keeping cached for now, maybe used to re-instate for user quality of life feature.
	}


	/**
	 * Prompts the user with a dialogue to fill in a user-defined title for the location.
	 * Can be called with locationData (from a map location), which will auto-fill the form,
	 * or just by adding a user-input place, in which locationData should be passed as null.
	 */
	promptSaveLocationDialogue = (locationData) => {

		if (locationData)
			this.setState({ savingLocationData: locationData });
		else
			this.setState({ savingLocationData: {} });
		
		// show the saveLocation dialogue component
		this.setState({ showSaveLocationDialogue: true }, () => {
			// set classes on dialogue after they're rendered
			const dialogue = document.querySelector(".save-location-dialogue-div");
			dialogue.classList.remove("div-hidden");

			// fill location dialogue with any information passed.
			const dialogueTitleInput = document.getElementById("title-input-bar");
			const dialogueAddressInput = document.getElementById("address-input-bar");
			if (locationData) {
				dialogueAddressInput.value = locationData.full_place;
			}
		});
	}
	
	hideSaveLocationDialogue = () => {
		this.setState({ savingLocationData: {}, showSaveLocationDialogue: false }, () => {
			const dialogue = document.querySelector(".save-location-dialogue-div");
			dialogue.classList.add("div-hidden");
		});
	}

	/**
	 * User function to save specific destinations to the user's profile.
	 * 
	 * @param { locationData } Data object containing address, lng,lat. 
	 */
	saveLocation = (locationData) => {
		/*
		savedLocationData (FORMAT):
		JSON.stringify({
				title: "Home",
				place_name: "101 Brant Street, Burlington, Ontario",
				lat: 43.3220767,
				lng: -79.8013343
		})
		*/

		locationData = JSON.stringify(locationData);

		if (locationData === null) return;
		// console.log(locationData);
		var response = api.saveLocationToApi(locationData)
			.then(res => {
				// console.log(res);
				var addedLocation = res.addedLocation;
				this.props.addUserSavedLocation(addedLocation);
			});

		this.hideSaveLocationDialogue();
	}

    componentDidMount() {
		try {
			// Check if the user is logged in on map load, if so, fetch their map data.
			api.checkIsLoggedIn()
			.then(userState => {
				this.props.setUserState(userState);

				if (userState.isLoggedIn) {
					api.getSavedLocationsFromApi()
					.then(result => {
						// If user is logged in, fetch their saved locations and store
						// in redux state.
						var savedLocationsState = result;
						if (savedLocationsState != null) {
							// saved locations state in DB will initialize as null, 
							// until first loc is added.
							// reducer of global state will stay default init as [] until non-null is returned.
							this.setState({
								savedLocations: savedLocationsState
							})
							this.props.setUserSavedLocationsState(savedLocationsState)
						}
					});
				}
			});
		} catch (e) {

		}

        // Fetch all waymessages from backend db
        // api.fetchWayMessages()
        //   .then(waymessages => {
        //     this.setState({
        //       waymessages
        //     })
        //   });
    
        // Grab user's location with geolocator/ip api.
        api.getUserLocation()
          .then(userPosition => {
			setTimeout(() => {
				this.setState({
					userPosition,
					hasUserLocation: true,
					zoom: 13,
				});
				this.initializeMap();
			}, 0)
		  });

		// Begin updating user's position every x seconds.
		this.updateUserLocationLoop();
	}

	componentWillUnmount() {
		// destructor
		clearInterval(this.updateUserLocationTimer);
		clearInterval(this.centerUserLoopTimer);
		clearInterval(this.recalculateRouteLoopTimer);
	}

	updateUserLocationLoop() {
		this.updateUserLocationTimer = setInterval(() => {
			navigator.geolocation.getCurrentPosition(pos => {
				this.setState({
					prevUserPosition: {
						lng: this.state.userPosition.lng,
						lat: this.state.userPosition.lat,
					},
				}, () => {
					this.setState({
						userPosition: {
							lng: pos.coords.longitude,
							lat: pos.coords.latitude,
						},	
					})
				});
			})
		}, 500);
	}

	/**
	 * #region Active personal user route loops to keep map:
	 * - centered
	 * - recalculating routes
	 */
	centerUserLoop() { 

		this.centerUserLoopTimer = setInterval(() => {
			// Stop centering loop, route has ended.
			if (!this.state.hasActiveUserRoute) {
				// console.log('Stopping centering.');
				clearInterval(this.centerUserLoopTimer);
				return;
			}

			this.centerMapOnUser();
		}, 500);
	}

	recalculateRouteLoop() {
		const reachedDestDistance = 50; // (metres)

		// Check if user has reached their destination - if within x metres. 
		var routeCoords = this.state.activeRoute.geometry.coordinates;
		var destCoords = routeCoords[routeCoords.length - 1];
		var userPos = [this.state.userPosition.lng, this.state.userPosition.lat]
		var distFromDest = (distance(userPos, destCoords, {units: "kilometres"})*1000); // metres.

		// console.log((distFromDest).toFixed(0) + " m");
		if (distFromDest.toFixed(0) < reachedDestDistance) {
			this.endRoute();
			console.log("Reached destination.")
			return;
		}

		this.recalculateRouteLoopTimer = setInterval(() => {
			// Stop recalculating loop, route has ended.
			if (!this.state.hasActiveUserRoute) {
				// console.log('Stopping recalculating route.');
				clearInterval(this.recalculateRouteLoopTimer);
				return;
			}
		
			// only recalculate route if position has changed.
			// if (this.state.prevUserPosition.lat != this.state.userPosition.lat || this.state.prevUserPosition.lng != this.state.userPosition.lng) {
				this.recalculateCurrentRoute(this.state.userPosition.lng, this.state.userPosition.lat);
				
			// }
		}, 5000)
	}

	centerMapOnUser() {
		// Don't recenter if it's already moving to recenter.
		// Smooth centering is slower, avoid jitters.
		if (!this.state.centeringInProgess) {
			// console.log(this.state.centeringInProgess);
			var pos = [this.state.userPosition.lng, this.state.userPosition.lat];
			this.map.flyTo({center: pos, speed: 0.20});
		}
		this.setState({
			centeringInProgess: true,
		});
	}

	// #endregion
      
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
            username: "fix with redux",
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
				username: this.props.userState.username,
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

	_flyTo = ({lat, lng, zoom, displayActiveMarker}) => {
		this.map.flyTo({
			center: [lng, lat],
			essential: true,
			speed: 1,
			maxDuration: 1,
		});

		this.map.zoomTo(zoom, {
			duration: 1500
		});

		if (displayActiveMarker) {
			this.placeActiveMarker(lng, lat);
		}
	}

	

    render() {
		
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
						// Search bar contains map searchbar and search results components.
						<MapSearchBar mapComponent={this} />
					}

					{ this.state.showDirectionsCard && this.state.showDirections &&
						<DirectionsCard mapComponent={this} />
					}

					{ this.state.showLocationCard && this.state.activeLocationData != null && this.state.showLocation &&
						<MapLocationCard mapComponent={this} />
					}

					{ this.state.showRoutesCard &&
						<RoutesCard mapComponent={this} />
					}
					
				</div>

				<MapHomeDock
					id="map-home-dock"
					moveHomeDock={this.moveHomeDock}
					homeDockOpen={this.state.homeDockOpen}
					toggleWaymessageMenu={this.toggleWaymessageMenu} 
					waymessageFormSubmit={this.waymessageFormSubmit} 
					waymessageValueChanged={this.waymessageValueChanged} 
					waymessageFormIsValid={this.waymessageFormIsValid}
					mapComponent={this}
				/>
                
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

				<div className="save-location-dialogue-div div-hidden">
					{/* { this.state.showSaveLocationDialogue && */}
						<SaveLocationDialogue mapComponent={this} />
					{/* } */}
				</div>
				
				

        	</div>
        )
    }
}

function mapStateToProps(globalState) {
	// Retrieve any data contained in redux global store.
	return {
		globalState
	};
}

function matchDispatchToProps(dispatch) {
	return bindActionCreators({ 
		setUserState: setUserState, 
		setUserSavedLocationsState: setUserSavedLocationsState,
		addUserSavedLocation: addUserSavedLocation,
	}, dispatch);
}

export default connect(mapStateToProps, matchDispatchToProps)(MapComponent)