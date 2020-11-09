import React from "react";

import { Card } from 'reactstrap';

import '../App.css'
import './components-styles/SaveLocationDialogue.scss';

class SaveLocationDialogue extends React.Component {
	constructor(props) {
		super(props);
		this.mc = this.props.mapComponent;
	}

	state = {

	};

	render() {
		return(
			<div className="save-location-dialogue-bg" id="save-location-dialogue-bg">
				<Card body className="save-location-dialogue" id="save-location-dialogue-bg">
					<div>
						<span>Save a destination.</span>
					</div>

					<div className="location-input-fields">
						<input 
							className="location-input-bar"
							id = "title-input-bar"
							placeholder="name your location."
						>
						</input>
						<input 
							className="location-input-bar"
							id="address-input-bar"
							placeholder="location address."	
						>
						</input>

						<button className="save-location-button" onClick={ () => {
							
							const titleInput = document.getElementById("title-input-bar").value;
							const addressInput = document.getElementById("address-input-bar").value;
							this.props.mapComponent.saveLocation({
								title: titleInput,
								address: addressInput,
							});

						} }>Save</button>
					</div>
				</Card>
			</div>
		);
	}
}

export default SaveLocationDialogue;