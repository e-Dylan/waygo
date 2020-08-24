import React from 'react';

import L from "leaflet";
import { Map, TileLayer, Marker, Popup } from "react-leaflet"
import { Card, Button, CardTitle, CardText, Row, Col, Form, FormGroup, Label, Input, ButtonDropdown } from "reactstrap";

// Css
import '../App.css';

import userLocationIconUrl from "../resources/map/userlocation_icon.svg"
import waymessageIconUrl from "../resources/map/waymessage_icon.svg"

// Dependencies
import Joi from "joi";

// backend api functions
import * as api from '../api';

import UserStore from '../stores/UserStore';

// Component Dependencies
import MapHomeDock from './MapHomeDock';
import WaymessageFormComponent from './WaymessageFormComponent';

// made by Aina, ID thenounproject.com
const userLocationIcon = L.icon({
    iconUrl: userLocationIconUrl,
    iconSize: [50, 82],
    popupAnchor: [0, -72],
    shadowUrl: 'my-icon-shadow.png',
    shadowSize: [68, 95],
    shadowAnchor: [22, 94]
});
  
  // made by 
const waymessageIcon = L.icon({
    iconUrl: waymessageIconUrl,
    iconSize: [50, 82],
    popupAnchor: [0, -32],
    shadowUrl: 'my-icon-shadow.png',
    shadowSize: [68, 95],
	shadowAnchor: [22, 94],
});
  
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

    state = {
		homeDockOpen: false,

        userPosition: {
            lat: 0,
            lng: 0,
        },
        hasUserPosition: false,

        markerPosition: {
            lat: 0,
            lng: 0,
        },
        activeMarker: false,

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

		const searchBarBurgerButton = document.querySelector('.search-bar-button');

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
			}, 1000)
            
          })
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

    render() {

        // Map -> Put into separate MapComponent
        const userPosition = [this.state.userPosition.lat, this.state.userPosition.lng]
        const markerPostion = [this.state.markerPosition.lat, this.state.markerPosition.lng]

        return (
            <div className = "map">
                <Map className="map" center={userPosition} zoom={this.state.zoom}>
                    <TileLayer
						attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors: Location Icon by Aina, ID thenounproject.com'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

					<div className="search-hud-cards">
						<Card body className="map-search-bar-card">
							<div className="search-bar-button"
								onClick={this.moveHomeDock}>
								<div className="search-bar-button__burger"></div>
							</div>
							
							<input className="map-search-bar-search"></input>
						</Card>
					</div>
					

                    {/* User's position marker */}
                    { this.state.hasUserPosition ? 
                        <Marker
                            position={userPosition} 
                            icon={userLocationIcon}>
                        </Marker> : ''
                    }

                    {/* User placed marker for destination location */}
                    { this.state.activeMarker ? 
                        <Marker
                            position={this.state.markerPosition} 
                            icon={userLocationIcon}>
                            <Popup>
                            Marker position. <br /> Working.
                            </Popup>
                        </Marker> : ''
                    }
                    
                    {/* Loop over all waymessage markers to load into user's map */}
                    {this.state.waymessages.map(waymessage => (
                        <Marker
                            key={waymessage._id}
                            position={[waymessage.latitude, waymessage.longitude]} 
                            icon={waymessageIcon}>
							<Popup>
								<p><em>{waymessage.username}:</em> {waymessage.message}</p>

								{ waymessage.otherWayMessages ? waymessage.otherWayMessages.map(waymessage => 
									<p key={waymessage._id}><em>{waymessage.username}:</em> {waymessage.message}</p>
									) : ''
								}
							</Popup>
                        </Marker>
                    ))}
                </Map>

                { this.state.showHomeDock ?
                    <MapHomeDock
						id="map-home-dock"
						moveHomeDock={this.moveHomeDock}
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