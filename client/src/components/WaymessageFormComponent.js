import React from 'react';
// import { Map, TileLayer, Marker, Popup } from "react-leaflet";
import { Card, CardTitle, Form, FormGroup, Input } from "reactstrap";

class WaymessageFormComponent extends React.Component {
	
	render() {
		return(
			<Card body className = "waymessage-form">
				<CardTitle>Post a Waymessage</CardTitle>
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
						className="waymessage-form-button" 
						disabled={!this.props.waymessageFormIsValid}>
						Send
					</button>
				</Form>
			</Card> 
		)
	}
}

export default WaymessageFormComponent