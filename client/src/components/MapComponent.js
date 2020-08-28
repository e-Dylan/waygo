import React from 'react';

import L, { map } from "leaflet";
import { Map, TileLayer, Marker, Popup } from "react-leaflet"
import { Card, Button, CardTitle, CardText, Row, Col, Form, FormGroup, Label, Input, ButtonDropdown } from "reactstrap";

// Css
import '../App.css';

import userLocationIcon from "../resources/map/userlocation_icon.svg"
import waymessageIcon from "../resources/map/waymessage_icon.svg"

// Dependencies
import Joi from "joi";

// backend api functions
import * as api from '../api';

import UserStore from '../stores/UserStore';

// Component Dependencies
import MapHomeDock from './MapHomeDock';
import WaymessageFormComponent from './WaymessageFormComponent';

import leftArrow from '../resources/map-home-dock/left-arrow-close.png';
import rightArrow from '../resources/map-home-dock/right-arrow-open.svg';

const H = window.H;
const HERE_KEY = "V-l1LgLrOPH3M3mzR9l6-gyEMyjD3_yRakz7o7pxjQs";
const APP_ID = "AP8r2fMp1pJE4CkH4rXT"
  
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

	mapRef = React.createRef();
	
	activeMarker = null;

    state = {
		map: null,

		homeDockOpen: false,

        userPosition: {
            lat: 0,
            lng: 0,
        },
        hasUserPosition: false,

		hasActiveMarker: false,
        markerPosition: {
            lat: 0,
            lng: 0,
        },

        zoom: 2,

        userWayMessage: {
            message: ""
        },

        showHomeDock: true,

        showWayMessageForm: false,

        waymessages: []
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

	initializeMapMarkers(map) {
		var userIcon = new H.map.Icon(userLocationIcon)
		var userMarker = new H.map.Marker(
				{ lat: this.state.userPosition.lat, lng: this.state.userPosition.lng },
				{  icon: userIcon  }
			);

		map.addObject(userMarker);
		map.setCenter({ lat: this.state.userPosition.lat, lng: this.state.userPosition.lng});
		map.setZoom(14);
	}

	initializeMap() {
		// HERE API
		const platform = new H.service.Platform({
			apikey: "V-l1LgLrOPH3M3mzR9l6-gyEMyjD3_yRakz7o7pxjQs"
		});

		const defaultLayers = platform.createDefaultLayers();

		const map = new H.Map(
			this.mapRef.current,
			defaultLayers.vector.normal.map,
			{
				center: this.state.userPosition,
				zoom: 4,
				pixelRatio: window.devicePixelRatio || 1
			}
		);

		window.addEventListener('resize', () => map.getViewPort().resize());

		// static map traffic lines
		map.addLayer(defaultLayers.vector.normal.traffic);
		// traffic incident icons
		map.addLayer(defaultLayers.vector.normal.trafficincidents);

		// Initialize map events
		// Click
		map.addEventListener('tap', (event) => {
			var coords = map.screenToGeo(event.currentPointer.viewportX, event.currentPointer.viewportY);
			this.placeActiveMarker(coords);
		})

		// Set state's map once finished initializing.
		this.setState({ map });

		const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
		const ui = H.ui.UI.createDefault(map, defaultLayers);
	}

	placeActiveMarker(coords) {
		if (!this.state.hasActiveMarker) {
			// doesn't have marker yet, create one and add it.
			this.activeMarker = new H.map.DomMarker({ lat: coords.lat, lng: coords.lng });
			this.state.map.addObject(this.activeMarker);
			this.setState({ hasActiveMarker: true });

		} else {
			// user has active marker, just move it.
			this.activeMarker.setGeometry({
				lat: coords.lat, lng: coords.lng
			});
		}
	}

	removeActiveMarker() {
		if (this.state.hasActiveMarker) {
			this.state.map.removeObject(this.activeMarker);
			this.setState({ hasActiveMarker: false });
		}
	}

	reversegeocode(coords) {
		// get the location/city data using lng/lat to display in a card or popup

	}

	geocode(query) {
		fetch(`https://geocoder.ls.hereapi.com/search/6.2/geocode.json
		?languages=en-US
		&maxresults=4
		&searchtext=${query}
		&apiKey=${HERE_KEY}`)
			.then(response => response.json())
			.then(data => {
				console.log(data);
			})
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

		// initialize HERE map api
		this.initializeMap();
    
        // Fetch all waymessages from backend db
        api.fetchWayMessages()
          .then(waymessages => {
            this.setState({
              waymessages
            })
          })
    
        // Grab user's location with geolocator/ip api.
        api.getUserLocation()
          .then(userPosition => {
			setTimeout(() => {
				this.setState({
					userPosition,
					hasUserPosition: true,
					zoom: 13,
				});
				this.initializeMapMarkers(this.state.map);
			}, 0)
		  })
	}

	componentWillUnmount() {
		// destructor
		this.state.map.dispose();
	}

    // DOESNT WORK, LATLNG DOESNT UPDATE.
    mapOnClick = (event) => {
        console.log(event);
        this.setState((prevState) => ({
        markerPosition: {
            ...prevState.markerPosition,
            lat: event.latlng.lat,
            lng: event.latlng.lng
        }
        }))
        console.log(this.state.markerPosition);
	}
	
	showWayMessageForm = () => {
		this.setState({
			showWayMessageForm: true,
		})
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
            this.setState({
                showWayMessageForm: false
            });

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

	updateSearch = (inputFieldValue) => {
		console.log(inputFieldValue);
	}

    render() {

        // Map -> Put into separate MapComponent
        const userPosition = [this.state.userPosition.lat, this.state.userPosition.lng]
        const markerPostion = [this.state.markerPosition.lat, this.state.markerPosition.lng]

        return (
            <div className="map" id="map-div">

				<div ref={this.mapRef} className="map" id="map">

				</div>

				<div className="search-hud-cards">
					<Card body className="map-search-bar-card">
						<div className="search-bar-button"
							onClick={this.moveHomeDock}>
							<div className="search-bar-button__burger"></div>
						</div>
						
						<input 
							className="map-search-bar-search"
							onChange={(e) => this.updateSearch(e.target.value)}
							>
							
						</input>
					</Card>

					{ this.state.hasActiveMarker ?
						<Card body className="map-location-card">
							
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
						showWayMessageForm={this.showWayMessageForm} 
						waymessageFormSubmit={this.waymessageFormSubmit} 
						waymessageValueChanged={this.waymessageValueChanged} 
						waymessageFormIsValid={this.waymessageFormIsValid}
					/>
                :
                    ''
                }
                
                { this.state.showWayMessageForm  ?
                    <WaymessageFormComponent waymessageValueChanged={this.waymessageValueChanged} waymessageFormIsValid={this.waymessageFormIsValid()} waymessageFormSubmit={this.waymessageFormSubmit} />
                : 
					''
                }
            </div>
        )
    }
}

export default MapComponent