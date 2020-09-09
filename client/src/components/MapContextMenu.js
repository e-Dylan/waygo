import React from 'react';

import { Card } from 'reactstrap';

// Styles css
import './components-styles/MapContextMenu.css';

class MapContextMenu extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render() {
        return (
            <Card className="map-context-menu-bg-card">
                <div className="context-menu-div">
					<h1>Set Origin</h1>
                </div>
				<div className="context-menu-div">
					<h1>Set Destination</h1>
				</div>
				<div className="context-menu-div">
					<h1>Clear</h1>
				</div>
            </Card>
        )
    }

}

export default MapContextMenu