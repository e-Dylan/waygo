import React from 'react';
import { Card, Button, CardTitle, CardText, Row, Col, Form, FormGroup, Label, Input, ButtonDropdown } from "reactstrap";

import $ from 'jquery';

import SubmitButton from './SubmitButton';
import leftArrowCloseButton from '../resources/map-home-dock/left-arrow-close.png';

import '../App.css'; // change to components css

class MapHomeDock extends React.Component {

    render() {
        return (
			<Card body className = "map-home-dock" id={this.props.id}>
				<div className="full-width-div text-center">
					<CardText>WAYGO</CardText>
					<button
						type="button"
						id="map-home-dock-close-button"
						className="map-home-dock-close-button" 
						onClick={this.props.moveHomeDock}>
						<div>
							{/* PUT CLOSE ARROW HERE */}
						</div>
					</button>
					
					
				</div>
				<div className="full-width-div">
					<CardText>sample div</CardText>
				</div>
				<div className="full-width-div">
					<CardText>Post a Waymessage</CardText>
					<SubmitButton 
						text="Post a Waymessage"
						className="btn map-home-dock-post-waymessage-button"
						onClick={this.props.showWayMessageForm}
					>
					</SubmitButton>
				</div>
			</Card>	
        );
    }

}

export default MapHomeDock