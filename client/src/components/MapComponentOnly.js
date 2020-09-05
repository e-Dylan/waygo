import * as React from 'react';
import { useState } from 'react';
import ReactMapGL, { GeolocateControl, Marker, Layer } from 'react-map-gl';
// import userLocationIcon from "../resources/map/userlocation_icon.svg"

var state = {
	hasActiveMarker: false,
	activeMarkerPosition: {
	  lat: 0,
	  lng: 0,
	},
};

const geolocateStyle = {
	float: 'right',
	margin: '10px',
	padding: '5px'
};


const placeActiveMarker = (event) => {
	const coords = {
		lat: event.lngLat[0],
		lng: event.lngLat[1]
	};

	if (!state.hasActiveMarker) {
		// doesn't have marker yet, create one and add it.
		state = {
			hasActiveMarker: true,
			activeMarkerPosition: {
				lat: coords.lat,
				lng: coords.lng,
			},
		}

	} else {
		// user has active marker, just move it.
		state = {
			activeMarkerPosition: {
				lat: coords.lat,
				lng: coords.lng,
			},
		}
	}
	console.log(state);
}

const MapComponentOnly = (props) => {

  const MAPBOX_TOKEN = "pk.eyJ1Ijoic2VsZmRyaXZpbmdkcml2ZXIiLCJhIjoiY2tlZGhwd28wMDE0aDJ5b3pic2d5Mm55YSJ9.zKnna2oVzmFrkXCjdEVsuA";

  const [viewport, setViewport] = useState({
    width: '100vw',
    height: '100vh',
    latitude: props.lat,
    longitude: props.lng,
    zoom: props.zoom
  });

  return (
    <ReactMapGL
      {...viewport}
	  mapStyle="mapbox://styles/mapbox/streets-v11"
	  mapboxApiAccessToken={MAPBOX_TOKEN}
      onViewportChange={nextViewport => setViewport(nextViewport)}
	  onClick={ placeActiveMarker }
    >

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
	
		<Marker longitude={props.lng} latitude={props.lat} offsetLeft={-21} offsetTop={-29}>
			<div>
				<svg width="42" height="58" fill="#EC5D57" 
					xmlns="http://www.w3.org/2000/svg" 
					version="1.1" 
					viewBox="0 0 847 1058.75" x="0px" y="0px" 
					fillRule="evenodd" 
					clipRule="evenodd">
					<defs>
						<style type="text/css"></style>
					</defs>
					<g>
						<path className="fil0" d="M423 21c134,0 242,108 242,242 0,104 -189,451 -242,563 -53,-112 -241,-459 -241,-563 0,-134 108,-242 241,-242zm0 165c43,0 77,34 77,77 0,42 -34,77 -77,77 -42,0 -77,-35 -77,-77 0,-43 35,-77 77,-77z"/>
					</g>
				</svg>
			</div>
			
		</Marker>

		 
			<Marker latitude={ state.activeMarkerPosition.lat } longitude={ state.activeMarkerPosition.lng } offsetLeft={-21} offsetTop={-29}>
				<div>Marker</div>
			</Marker>


		<GeolocateControl
			style={geolocateStyle}
			positionOptions={{enableHighAccuracy: true}}
			trackUserLocation={true}
		/>

	</ReactMapGL>
  );
}

export default MapComponentOnly