import React, { Component } from 'react';
import { observer } from 'mobx-react';

import L from "leaflet";
import { Map, TileLayer, Marker, Popup } from "react-leaflet"
import { Card, Button, CardTitle, CardText, Row, Col, Form, FormGroup, Label, Input, ButtonDropdown } from "reactstrap";

import userLocationIconUrl from "./resources/userlocation_icon.svg"
import waymessageIconUrl from "./resources/waymessage_icon.svg"

import './App.css';
import { render } from 'react-dom';

// Dependencies
import Joi from "joi";

// backend api functions
import * as api from './api';

// Map Component
import MapComponent from './MapComponent';

// User login
import UserStore from './stores/userstore';
import LoginForm from './LoginForm';
import SubmitButton from './SubmitButton';

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
  shadowAnchor: [22, 94]
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

const WAYMESSAGE_API_URL = window.location.hostname === "localhost" ? "http://localhost:1337/api/waymessages" : "production-url-here";
const LOGOUT_API_URL = window.location.hostname === "localhost" ? "http://localhost:1337/api/logout" : "production-url-here";
const ISLOGGEDIN_API_URL = window.location.hostname === "localhost" ? "http://localhost:1337/api/isLoggedIn" : "production-url-here";

class App extends Component {
  // every component has a state object, can be set with setState()
  state = {
    userPosition: {
      lat: 51.505,
      lng: -0.09,
    },
    hasUserPosition: false,

    markerPosition: {
      lat: 0,
      lng: 0,
    },
    activeMarker: false,

    zoom: 2,

    userWayMessage: {
      name: "",
      message: ""
    },

    showWayMessageForm: false,
    sendingWayMessage: false,
    sentWayMessage: false,

    waymessages: []
  }

  async componentDidMount() {

    // Check if user is logged in on application load
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
        this.setState({
          userPosition,
          hasUserPosition: true,
          zoom: 13,
        });
      })
  }

  async doLogout() {
    // Check if user is logged in on application load
    try {
      // fetch logout api
      let res = await fetch(LOGOUT_API_URL, {
        method: 'post',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      let result = await res.json();
      if (result && result.success) {
        UserStore.isLoggedIn = false;
        UserStore.username = '';
      }
    }
    catch(e) {
      console.log(e);
    }
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
      username: this.state.userWayMessage.name,
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
        sendingWayMessage: true,
      });

      fetch(WAYMESSAGE_API_URL, {
        method: "POST",
        credentials: 'include',
        headers: {
          'Accept': "application/json",
          'Content-Type': "application/json",
        },
        body: JSON.stringify({
          username: this.state.userWayMessage.name,
          message: this.state.userWayMessage.message,
          latitude: this.state.userPosition.lat,
          longitude: this.state.userPosition.lng,
        })
      }).then(res => res.json())
      .then(message => {
        console.log(message);
        setTimeout(() => {
          this.setState({
            sendingWayMessage: false,
            sentWayMessage: true,
          });
        }, 0);
      });

    }
  }

  render() {

    /**
     * User Auth 
     */
    if (UserStore.loading) {
      // If user is loading to login, display loading screen.
      return (
        <div className="app">
          <div className="container">
            Loading, please wait...
          </div>
        </div>
      );
    } else {
      // User has finished loading in, check if logged in or not, display correct app screen.
      if (UserStore.isLoggedIn) {
        return (
          <div className="app">
            <div className="container">
              Welcome {UserStore.username}

              <SubmitButton
                text={ 'Logout' }
                disabled={ false }
                onClick={ () => this.doLogout() }
              />
            </div>
          </div>
        );
      }

      // User is not logged in, display landing page
      return (
        <div className="app">
            <div className="container">
              <LoginForm />
            </div>
          </div>
      );

    }

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

          // User's position marker
          { this.state.hasUserPosition ? 
            <Marker
              position={userPosition} 
              icon={userLocationIcon}>
            </Marker> : ''
          }

          // User placed marker for destination location
          { this.state.activeMarker ? 
            <Marker
              position={this.state.markerPosition} 
              icon={userLocationIcon}>
              <Popup>
                Marker position. <br /> Working.
              </Popup>
            </Marker> : ''
          }
          
          // Loop over all waymessage markers to load into user's map
          {this.state.waymessages.map(waymessage => (
            <Marker
              key={waymessage._id}
              position={[waymessage.latitude, waymessage.longitude]} 
              icon={waymessageIcon}>
              <Popup>
                <p><em>{waymessage.username}:</em> {waymessage.message}</p>

                { waymessage.otherWayMessages ? waymessage.otherWayMessages.map(waymessage => 
                    <p key={waymessage._id}><em>{waymessage.username}:</em> {waymessage.message}</p>
                  ) : 
                    ''
                }

              </Popup>
            </Marker>
          ))}
        </Map>

        <Card body className = "home-dock">
          <section>
            <CardText>Enter a location to find the best route.</CardText>
          </section>
          <section>
            <CardText>Post a Waymessage</CardText>
            <Button type="submit" className="home-dock-button" onClick={() => {
              this.setState({
                showWayMessageForm: true,
              })
            }}>
            Post a Waymessage</Button>
          </section>
        </Card>
        
        { this.state.showWayMessageForm && !this.state.sendingWayMessage && !this.state.sentWayMessage ?
          <Card body className = "waymessage-form">
            <CardTitle>Post a Waymessage</CardTitle>
            <Form onSubmit={this.waymessageFormSubmit}>
              <FormGroup> 
                <Input 
                  onChange={this.waymessageValueChanged}
                  type="text" 
                  style={{width: 75 + '%'}}  
                  name="name" 
                  id="name" 
                  placeholder="Enter your name." 
                />
              </FormGroup>
              <FormGroup>
                <Input 
                  onChange={this.waymessageValueChanged}
                  type="textarea" 
                  style={{maxHeight: 70 + 'px', minHeight: 40 + 'px'}} 
                  name="message" 
                  id="message" 
                  placeholder="Enter a message." 
                />
              </FormGroup>
              <Button type="submit" className="waymessage-form-button" disabled={!this.waymessageFormIsValid()}>Send</Button>
            </Form>
          </Card> 
          : 
          this.sendingWayMessage ?
            <img src="https://i.giphy.com/media/BCIRKxED2Y2JO/200w_d.gif"/> 
            :
            <CardText>Waymessage has been posted.</CardText>
        }
      </div>
    )
  }
  
}

export default observer(App);
