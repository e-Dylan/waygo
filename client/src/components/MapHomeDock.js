import React from 'react';
// import { Card, Button, CardTitle, CardText, Row, Col, Form, FormGroup, Label, Input, ButtonDropdown } from "reactstrap";
import { Card } from 'reactstrap';

// import $ from 'jquery';

import SubmitButton from './SubmitButton';
import leftArrow from '../resources/map-home-dock/left-arrow-close.png';
import rightArrow from '../resources/map-home-dock/right-arrow-open.png';


import './components-styles/MapHomeDock.css'; // change to components css

class MapHomeDock extends React.Component {

    render() {

		const homeDockArrow = this.props.homeDockOpen ? leftArrow : rightArrow

        return (
			<Card body className = "map-home-dock" id={this.props.id}>
				<div className="full-width-div text-center">
					<a className="home-dock-title" href="/">WAYGO</a>
					<button
						type="button"
						id="map-home-dock-close-button"
						className="map-home-dock-close-button" 
						onClick={this.props.moveHomeDock}>
						<img src={homeDockArrow} />
					</button>
				</div>

				<ul className="full-width-div">
					<text className="dock-section-title">Map</text>
					<li>
						<div className="dock-toggle-label">
							<text>show traffic</text>
							<span className="dock-switch">
								<input type="checkbox" />
								<span className="dock-slider"></span>
							</span>
						</div>
					</li>
					<li>
					<div className="dock-toggle-label">
							<text>show issues</text>
							<span className="dock-switch">
								<input type="checkbox" />
								<span className="dock-slider"></span>
							</span>
						</div>
					</li>
				</ul>
				<ul className="full-width-div">
					<text className="dock-section-title">Public</text>
					<li>
						<div className="dock-toggle-label">
							<text>show waymessages</text>
							<span className="dock-switch">
								<input type="checkbox" />
								<span className="dock-slider"></span>
							</span>
						</div>
					</li>
					<li>
						<div className="dock-toggle-label">
							<text>show other</text>
							<span className="dock-switch">
								<input type="checkbox" />
								<span className="dock-slider"></span>
							</span>
						</div>
					</li>
				</ul>
				<ul className="full-width-div">
					<text className="dock-section-title">Friends</text>
					<li>
						<div className="dock-toggle-label">
							<text>Dislay my Location</text>
							<span className="dock-switch">
								<input type="checkbox" />
								<span className="dock-slider"></span>
							</span>
						</div>
					</li>
					<div className="display-my-location-li-div">
						<li>
							<div className="dock-toggle-label">
								<text>to all friends</text>
								<span className="dock-switch">
									<input type="checkbox" />
									<span className="dock-slider"></span>
								</span>
							</div>
						</li>
						<li>
							<div className="dock-toggle-label">
								<text>to certain people</text>
								<span className="dock-switch">
									<input type="checkbox" />
									<span className="dock-slider"></span>
								</span>
							</div>
						</li>
					</div>
					
					<li>
						<div className="dock-toggle-label">
								<text>show visable friends</text>
								<span className="dock-switch">
									<input type="checkbox" />
									<span className="dock-slider"></span>
								</span>
							</div>
						</li>
					<li>
						<div className="dock-toggle-label">
							<text>show friend waymessages</text>
							<span className="dock-switch">
								<input type="checkbox" />
								<span className="dock-slider"></span>
							</span>
						</div>
					</li>
				</ul>
				<div className="full-width-div">
					<text>Post a Waymessage</text>
					<SubmitButton 
						text="Post a Waymessage"
						className="btn dock-waymessage-button"
						onClick={this.props.toggleWaymessageMenu}
					>
					</SubmitButton>
				</div>
			</Card>	
        );
    }

}

export default MapHomeDock