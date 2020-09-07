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
					<a>Set Origin</a>
                </div>
				<div className="context-menu-div">
					<a>Set Destination</a>
				</div>
				<div className="context-menu-div">
					<a>Clear</a>
				</div>
            </Card>
        )
    }

}

export default MapContextMenu