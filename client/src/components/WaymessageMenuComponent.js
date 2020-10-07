import React from 'react';
// import { Map, TileLayer, Marker, Popup } from "react-leaflet";
import { Card, CardTitle, Form, FormGroup, Input } from "reactstrap";

import './components-styles/WaymessageMenu.css';

import closeButtonArrow from '../resources/waymessage-form/down-arrow-close.svg'

class WaymessageMenuComponent extends React.Component {

	render() {
		return(
			<Card body className = "waymessage-menu" id="waymessage-menu">
				<div className="waymessage-form-title">
					<CardTitle>Post a Waymessage</CardTitle>
				</div>
				<div className="waymessage-menu-close-button">
					<img 
						src={closeButtonArrow}
						onClick={this.props.toggleWaymessageMenu}
					/>
					
				</div>
				<div className="waymessage-menu-form">
					<Form onSubmit={this.props.waymessageFormSubmit}>
						<FormGroup>
							<Input 
								onChange={this.props.waymessageValueChanged}
								type="textarea" 
								style={{maxHeight: 70 + 'px', minHeight: 40 + 'px'}} 
								name="message" 
								id="message" 
								placeholder="Enter a message." 
							/>
						</FormGroup>
						<button 
							type="submit" 
							className="waymessage-menu-button" 
							disabled={!this.props.waymessageFormIsValid}>
							Send
						</button>
					</Form>
				</div>
				
			</Card> 
		)
	}
}

export default WaymessageMenuComponent