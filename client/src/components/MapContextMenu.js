import React from 'react';

import { Card } from 'reactstrap';

// Styles css
import './components-styles/MapContextMenu.css';

class MapContextMenu extends React.Component {

	constructor(props) {
		super(props);

	}
	
	render() {
		return (
			<Card className="map-context-menu-bg-card" onClick={this.props.hideContextMenu}>
				<div className="context-menu-div" 
					onClick={ () => {
						this.props.placeOriginMarker(this.props.lastClickedMap.lng, this.props.lastClickedMap.lat);
					}}>
					<h1>Set Origin</h1>
				</div>
				<div className="context-menu-div" 
					onClick={ () => {
						this.props.placeDestMarker(this.props.lastClickedMap.lng, this.props.lastClickedMap.lat); 
						console.log(this.props);
					}}>
					<h1>Set Destination</h1>
				</div>
				<div className="context-menu-div" onClick={this.props.showWaymessageMenu}>
					<h1>Waymessage</h1>
				</div>
				<div className="context-menu-div">
					<h1>Clear</h1>
				</div>
			</Card>
		);
	}

}

export default MapContextMenu