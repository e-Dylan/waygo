import React from 'react';
import $ from 'jquery';

import '../components-styles/HomePage.scss'; // change to components css

import mapboxgl from 'mapbox-gl';
const MAPBOX_TOKEN = "pk.eyJ1Ijoic2VsZmRyaXZpbmdkcml2ZXIiLCJhIjoiY2tlZGhwd28wMDE0aDJ5b3pic2d5Mm55YSJ9.zKnna2oVzmFrkXCjdEVsuA";
mapboxgl.accessToken = MAPBOX_TOKEN;

class DemoMapComponent extends React.Component {

	constructor(props) {
		super(props);
		this.map = null;
	}

	state = {	

	}

	initializeMap() {
		this.map = new mapboxgl.Map({
			container: this.mapContainer,
			style: 'mapbox://styles/mapbox/light-v10',
			center: [-79.384252, 43.653119],
			zoom: 16,
			pitch: 60,
			bearing: -30,
		});

		this.map.on('load', () => {
			// geolocate.trigger();

			// this.map.addControl(new MapboxTraffic({
			// 	showTraffic: true,
			// 	showTrafficButton: true,
			// }));

			// #region Set 3d map layer.

			this.map.style.stylesheet.layers.forEach((layer) => {
				if (layer.type === 'symbol') {
					this.map.removeLayer(layer.id);
				}
			});

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
				// 'filter': ['==', 'extrude', 'true'],
				'type': 'fill-extrusion',
				'minzoom': 14,
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

	componentDidMount() {
		this.initializeMap();
	}

    render() {

        return (
			<div className="demo-map" id="demo-map-div">
				<div 
					ref={el => this.mapContainer = el}
					className="demo-map-container">
				</div>
			</div>
        );
    }

}

function mapStateToProps(state) {
	return({
		userState: state.userState,
	})
}

export default DemoMapComponent;