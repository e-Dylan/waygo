import React, { Component } from 'react';
import L from "leaflet";
import Joi from "joi";
import { Map, TileLayer, Marker, Popup } from "react-leaflet"
import { Card, Button, CardTitle, CardText, Row, Col, Form, FormGroup, Label, Input, ButtonDropdown } from "reactstrap";

import userLocationIconUrl from "./resources/userlocation_icon.svg"
import waymessageIconUrl from "./resources/waymessage_icon.svg"

import './App.css';
import { render } from 'react-dom';

// made by Aina, ID thenounproject.com
const userLocationIcon = L.icon({
  iconUrl: userLocationIconUrl,
  iconSize: [50, 82],
  iconAnchor: [25, 82],
  popupAnchor: [0, -72],
  shadowUrl: 'my-icon-shadow.png',
  shadowSize: [68, 95],
  shadowAnchor: [22, 94]
});

// made by 
const waymessageIcon = L.icon({
  iconUrl: waymessageIconUrl,
  iconSize: [50, 82],
  iconAnchor: [25, 82],
  popupAnchor: [0, -72],
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

const API_URL = window.location.hostname == "localhost" ? "http://localhost:5000/api/waymessages" : "production-url-here";

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

  componentDidMount() {
    // Get user's location, load waymessages from db into user's state
    // only get messages within certain lng/lat of user?
    fetch(API_URL)
      .then(res => res.json())
      .then(waymessages => {
        // Every message will be taken from db, put into an array at the index of their
        // lat + lng. 
        // When messages are displayed, we display one popup for every lat+lng key,
        // and all the different messages at that same lat+lng key are put into the same object.
        const haveSeenLocation = {};
        waymessages = waymessages.reduce((all, waymessage) => {
          const key = `${waymessage.latitude}${waymessage.longitude}`;
          if (haveSeenLocation[key]) {
            // Waymessage object already exists at this key (lat+lng), append to the object
            haveSeenLocation[key].otherWayMessages = haveSeenLocation[key].otherWayMessages || [];
            haveSeenLocation[key].otherWayMessages.push(waymessage);
          } else {
            // No waymessage already exists at this key (lat+lng), create first object
            haveSeenLocation[key] = waymessage; 
            all.push(waymessage);
          }
          return all;
        }, []);

        this.setState({
          waymessages
        });
      });

    navigator.geolocation.getCurrentPosition((userPosition) => {
      // setState refreshes the react app when called
      this.setState({
        userPosition: {
          lat: userPosition.coords.latitude,
          lng: userPosition.coords.longitude
        },
        hasUserPosition: true,
        zoom: 13,
      });

      console.log("User location received... positioning map. " + userPosition.coords.latitude + ", " + userPosition.coords.latitude);
    }, () => {
      console.log("User location request denied... locating general location from ip adress.")
      fetch("https://ipapi.co/json")
        .then(res => res.json())
        .then(location => {
          console.log(location);
          this.setState({
            userPosition: {
              lat: location.latitude,
              lng: location.longitude,
            },
            hasUserPosition: true,
            zoom: 13,
          });
        })
    });
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

      fetch(API_URL, {
        method: "POST",
        headers: {
          'content-type': "application/json",
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
    const userPosition = [this.state.userPosition.lat, this.state.userPosition.lng]
    const markerPostion = [this.state.markerPosition.lat, this.state.markerPosition.lng]
    return (
      <div className = "map">
        <Map className="map" center={userPosition} zoom={this.state.zoom}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
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
                    <p key="waymessage._id"><em>{waymessage.username}:</em> {waymessage.message}</p>
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

export default App;
