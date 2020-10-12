import React from 'react';

import { Card } from 'reactstrap';

// Styles css
import './components-styles/MapContextMenu.css';

const MapContextMenu = (props) => {

	return (
		<Card className="map-context-menu-bg-card" onClick={props.hideContextMenu}>
			<div className="context-menu-div" 
				onClick={ () => {
					props.placeOriginMarker(0, 0);
					console.log(props.lastClicked); 
				}}>
				<h1>Set Origin</h1>
			</div>
			<div className="context-menu-div" 
				onClick={ () => {
					props.placeDestMarker(props.lastClicked.lng, props.lastClicked.lat); 
				}}>
				<h1>Set Destination</h1>
			</div>
			<div className="context-menu-div" onClick={props.showWaymessageMenu}>
				<h1>Waymessage</h1>
			</div>
			<div className="context-menu-div">
				<h1>Clear</h1>
			</div>
		</Card>
	)

}

export default MapContextMenu