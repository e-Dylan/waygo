import React, { useState } from 'react';

// import { Card, Button, CardTitle, CardText, Row, Col, Form, FormGroup, Label, Input, ButtonDropdown } from "reactstrap";
import { Card } from 'reactstrap';

// Css
import '../App.css';

// Dependencies
import mapboxgl from 'mapbox-gl';
import ReactMapGL, { GeolocateControl, Marker, Layer, FlyToInterpolator } from 'react-map-gl';
import Joi from "joi";

// backend api functions
import * as api from '../api';

import UserStore from '../stores/UserStore';

// Component Dependencies
import MapComponentOnly from './MapComponentOnly';
import MapHomeDock from './MapHomeDock';
import WaymessageFormComponent from './WaymessageFormComponent';

// Icons
import userLocationIcon from "../resources/map/userlocation_icon.svg";
import activeMarkerIcon from "../resources/map/activeMarkerIcon.svg";
import waymessageIcon from "../resources/map/waymessage_icon.svg";

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

			zoom: 2,

			userWayMessage: {
				message: ""
			},

			showHomeDock: true,
			showSearchResults: false,
			showWayMessageForm: false,

			waymessages: [],
			searchResultLocations: [],
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
		// console.log(event);
		if (event.leftButton) {
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
	}

	removeActiveMarker() {
		if (this.state.hasActiveMarker) {
			this.activeMarker.remove();
		}
	}

	reverseGeocode(coords) {
		// get the location/city data using lng/lat to display in a card or popup
	}

	forwardGeocode = ({ endpoint, query, autocomplete, flyTo }) => {
		var res = fetch(
			`https://api.mapbox.com/geocoding/v5/${endpoint}/${query}.json?
			access_token=${MAPBOX_TOKEN}&autocomplete=${autocomplete}`
		)
			.then(res => res.json())
			.then(data => { 
				if (flyTo) {
					const lng = data.features[0].center[0];
					const lat = data.features[0].center[1];
					this._flyTo({lat: lat, lng: lng, zoom: 12});
				}

				// fill search results array with this api call on every geocode api request.
				const tempsearchResultLocations = [];

				for (let i = 0; i < 5; i++) {

					var place_name = data.features[i].text;
					const context = data.features[i].context;

					// console.log(context[0].text);

					if (data.features[i].context != null) {
						for (let j = 0; j < data.features[i].context.length; j++) {
							// last place, concat without a comma
							place_name += ', ' + context[j].text;
						}	
					}
					const place_data = [
						place_name,
						data.features[i].center[1],
						data.features[i].center[0]
					];
					// console.log(place_data);
					tempsearchResultLocations[i] = place_data;
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

	_onViewportChange = viewport => this.setState({
		viewport: { ...this.state.viewport, ...viewport }
	});

	_flyTo = ({lat, lng, zoom}) => {
		this._onViewportChange({
			latitude: lat,
			longitude: lng,
			zoom: zoom,
			transitionInterpolator: new FlyToInterpolator(),
			transitionDuration: 0
		});
	}

    render() {
		const { viewport } = this.state;

        return (
            <div className="map" id="map-div">

				{this.state.hasUserPosition ?
					<ReactMapGL
						{...viewport}
						width="100vw"
						height="100vh"
						mapStyle="mapbox://styles/mapbox/streets-v11"
						mapboxApiAccessToken={MAPBOX_TOKEN}
						onViewportChange={ this._onViewportChange }
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

						<Marker className="map-marker" latitude={ this.state.activeMarkerPosition.lat } longitude={ this.state.activeMarkerPosition.lng } offsetLeft={-21} offsetTop={-40}>
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
							onFocus={(e) => {
								this.setState({ showSearchResults: true });
							}}
							onBlur={(e) => {
								// this.setState({ showSearchResults: false });
							}}
							onChange={(e) => {
								// make api call to get best 5 results using search text,
								// set search result text to response data.
								if (e.target.value.length > 2) {
									// only send api request if query is >= 3 chars.
									this.forwardGeocode({
										endpoint: "mapbox.places", query: e.target.value, autocomplete: true, flyTo: false
									});
								}

								if (e.target.value.length == 0) {
									// If clearing search bar, hide and empty search results.
									this.setState({
										showSearchResults: false,
										searchResultLocations: [],
									});
								} else {
									this.setState({ showSearchResults: true });
								}
								
							}}
							>
							
						</input>
					</Card>

					{ this.state.showSearchResults ?

						<Card body className="map-geocode-bg-card">
							{ this.state.searchResultLocations.map(item => 
								<div 
								className="map-search-result-div" 
								onClick={ () => {						
									// stop showing search results when location is clicked.
									this.setState({
										showSearchResults: false,
									});
									// call flyTo method to move to this position.
									this._flyTo({
										lat: item[1],
										lng: item[2],
										zoom: 12
									});
								}} 
								key={item[0]}>
									<img src={ citySearchIcon } className="map-search-result-icon"></img>
									<a>{ item[0] }</a>
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