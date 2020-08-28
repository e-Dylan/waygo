<Map className="map" center={userPosition} zoom={this.state.zoom}>
                    <TileLayer
						attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors: Location Icon by Aina, ID thenounproject.com'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
					
                    {/* User's position marker */}
                    { this.state.hasUserPosition ? 
                        <Marker
                            position={userPosition} 
                            icon={userLocationIcon}>
                        </Marker> : ''
                    }

                    {/* User placed marker for destination location */}
                    { this.state.activeMarker ? 
                        <Marker
                            position={this.state.markerPosition} 
                            icon={userLocationIcon}>
                            <Popup>
                            Marker position. <br /> Working.
                            </Popup>
                        </Marker> : ''
                    }

                    {/* Loop over all waymessage markers to load into user's map */}
                    {this.state.waymessages.map(waymessage => (
                        <Marker
                            key={waymessage._id}
                            position={[waymessage.latitude, waymessage.longitude]} 
                            icon={waymessageIcon}>
							<Popup>
								<p><em>{waymessage.username}:</em> {waymessage.message}</p>

								{ waymessage.otherWayMessages ? waymessage.otherWayMessages.map(waymessage => 
									<p key={waymessage._id}><em>{waymessage.username}:</em> {waymessage.message}</p>
									) : ''
								}
							</Popup>
                        </Marker>
                    ))}
                </Map>