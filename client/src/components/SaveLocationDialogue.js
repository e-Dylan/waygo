import React from "react";
import $ from 'jquery';

import { Card } from 'reactstrap';

import waygoLogo from '../resources/logo/waygo.png';
import locationIcon from '../resources/save-location-dialogue/map-marked-alt-solid.svg';
import addressIcon from '../resources/save-location-dialogue/at-solid.svg';

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
					<div className="title-section">
						<div className="title-image">
							<img src={ waygoLogo }></img>
						</div>
					</div>

					<div className="dialogue-text"><span>Save a location</span></div>

					<div className="center-container">

						<div className="input-container">
							<a className="fa fa-user icon">
								<img src={locationIcon}></img>
							</a>
							<input className="location-input-bar"
								type="text"
								id="title-input-bar"
								placeholder="name your location."
							/>
						</div>

						<div className="input-container">
							<a className="fa fa-user icon">
								<img src={addressIcon}></img>
							</a>
							<input 
								className="location-input-bar"
								id="address-input-bar"
								placeholder="location address."	
							>
							</input>
						</div>
						
					</div>
					<button className="save-location-button" onClick={ () => {
						const titleInput = document.getElementById("title-input-bar").value;
						const addressInput = document.getElementById("address-input-bar").value;
						this.props.mapComponent.saveLocation({
							title: titleInput,
							address: addressInput,
						});

					} }>Save</button>
				</Card>
			</div>
		);
	}
}

export default SaveLocationDialogue;