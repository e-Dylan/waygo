import React from 'react';
import { Map, TileLayer, Marker, Popup } from "react-leaflet";
import { Card, Button, CardTitle, CardText, Row, Col, Form, FormGroup, Label, Input, ButtonDropdown } from "reactstrap";


import '../App.css'; // change to components css

class MapHomeDock extends React.Component {

    render() {
        return (
            <Card body className = "map-home-dock">
                <section>
                    <CardText>Enter a location to find the best route.</CardText>
                </section>
                <section>
                    <CardText>Post a Waymessage</CardText>
                    <Button type="submit" className="map-home-dock-button" onClick={() => {
                        this.setState({
                            showWayMessageForm: true,
                        })
                    }}>
                    Post a Waymessage
                    </Button>
                </section>
            </Card>
        );
    }

}

export default MapHomeDock