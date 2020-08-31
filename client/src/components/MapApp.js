import React, { useState } from 'react';

import { Card, Button, CardTitle, CardText, Row, Col, Form, FormGroup, Label, Input, ButtonDropdown } from "reactstrap";

// Css
import '../App.css';

import userLocationIcon from "../resources/map/userlocation_icon.svg";
import activeMarkerIcon from "../resources/map/activeMarkerIcon.svg";
import waymessageIcon from "../resources/map/waymessage_icon.svg";

// Dependencies
import mapboxgl from 'mapbox-gl';
import ReactMapGL, { GeolocateControl, Marker, Layer } from 'react-map-gl';
import Joi from "joi";

// backend api functions
import * as api from '../api';

import UserStore from '../stores/UserStore';

// Component Dependencies
import MapComponent from './MapComponent';
import MapHomeDock from './MapHomeDock';
import WaymessageFormComponent from './WaymessageFormComponent';

import leftArrow from '../resources/map-home-dock/left-arrow-close.png';
import rightArrow from '../resources/map-home-dock/right-arrow-open.svg';

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

class MapApp extends React.Component {

	constructor(props) {
		super(props);
		const activeMarker = null;
		this.state = {
			map: null,
			viewport: {
				width: '100vw',
				height: '100vh',
				latitude: 0,
				longitude: 0,
				zoom: 12,
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

			zoom: 2,

			userWayMessage: {
				message: ""
			},

			showHomeDock: true,

			showWayMessageForm: false,

			waymessages: []
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
		
		// initialize mapbox map 

		// map.on('click', (e) => {
		// 		this.placeActiveMarker(e.lngLat);		REPLACE THIS METHOD
		// })

		// // Set state's map once finished initializing.
		// this.setState({ map });
	}

	placeActiveMarker = (event) => {
		console.log(event);
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

	removeActiveMarker() {
		if (this.state.hasActiveMarker) {
			this.activeMarker.remove();
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
		&apiKey={HERE_KEY}`)
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
				// this.initializeMap()
				// this.initializeMapMarkers();
			}, 0)
		  });
		  
	}

	// componentWillUnmount() {
	// 	// destructor
	// 	this.state.map.dispose();
	// }
	
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

        const userPosition = [this.state.userPosition.lat, this.state.userPosition.lng]
		
		const { viewport, data } = this.state;

        return (
			
            <div className="map" id="map-div">

				{this.state.hasUserPosition ?
					<ReactMapGL
						{...viewport}
						mapStyle="mapbox://styles/mapbox/streets-v11"
						mapboxApiAccessToken={MAPBOX_TOKEN}
						onViewportChange={viewport => this.setState({viewport})}
						onMouseDown={ this.placeActiveMarker }
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

						<Marker latitude={ this.state.activeMarkerPosition.lat } longitude={ this.state.activeMarkerPosition.lng } offsetLeft={-21} offsetTop={-40}>
							<div>
								<img src={activeMarkerIcon} />
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

export default MapApp