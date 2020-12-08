const WAYMESSAGE_API_URL = window.location.hostname === "localhost" ? "http://localhost:1337/api/waymessages" : `${process.env.REACT_APP_PRODUCTION_API_URL}/waymessages`;
const SAVE_LOCATION_API_URL = window.location.hostname === "localhost" ? "http://localhost:1337/api/saveLocation" : `${process.env.REACT_APP_PRODUCTION_API_URL}/saveLocation`;
const GET_SAVED_LOCATIONS_API_URL = window.location.hostname === "localhost" ? "http://localhost:1337/api/reqSavedLocations" : `${process.env.REACT_APP_PRODUCTION_API_URL}/reqSavedLocations`;
const DELETE_SAVED_LOCATION_API_URL = window.location.hostname === "localhost" ? "http://localhost:1337/api/deleteSavedLocation" : `${process.env.REACT_APP_PRODUCTION_API_URL}/deleteSavedLocation}`;

export function saveLocationToApi(locationData) {
	// CURRENT LOCATION OBJECT FORMAT:
	// {title: "", place_name: "", lat: , lng: }

	return fetch(SAVE_LOCATION_API_URL, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		body: locationData,
	})
	.then(res => res.json())
	.then(result => {
		// console.log(result);

		// UPDATE REDUX STORE WITH UPDATED SAVED LOCATIONS.
		// console.log(result)

		/* respond to map component with:
			added location
			all location data in db.
		*/
		return {
			addedLocation: JSON.parse(locationData),
			locationData: result.savedLocations,
		};;
	})
}

	
export function getSavedLocationsFromApi() {	
	return fetch(GET_SAVED_LOCATIONS_API_URL, {
		method: 'GET',
		credentials: 'include',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
	})
	.then(res => res.json())
	.then(result => {
		// Saved locations are stored in mysql db as an array of json objects for each location.
		// parse them back into an array.
		return(JSON.parse(result.savedLocations));
		// console.log(JSON.parse(result.savedLocations));
	})
}

export function deleteSavedLocationFromApi(index) {
	return fetch(DELETE_SAVED_LOCATION_API_URL, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		body: index
	})
	.then(res => res.json())
	.then(result => {
		// console.log(result);
		// return new saved locations array.
		return(result.savedLocations);
	})
}

export function fetchWayMessages() {
    // Get user's location, load waymessages from db into user's state
    // only get messages within certain lng/lat of user?
    return fetch(WAYMESSAGE_API_URL)
      .then(res => res.json())
      .then(waymessages => {
        // Every message will be taken from db, put into an array at the index of their
        // lat + lng. 
        // When messages are displayed, we display one popup for every lat+lng key,
        // and all the different messages at that same lat+lng key are put into the same object.
        const haveSeenLocation = {};
        return waymessages = waymessages.reduce((all, waymessage) => {
          const key = `${waymessage.latitude.toFixed(3 )}${waymessage.longitude.toFixed(3)}`;
          if (haveSeenLocation[key]) {
            // Waymessage object already exists at this key (lat+lng), append to the object
            haveSeenLocation[key].otherWayMessages = haveSeenLocation[key].otherWayMessages || [];
            haveSeenLocation[key].otherWayMessages.push(waymessage);
          } else {
            // No waymessage already exists at this key (lat+lng), create first object
            haveSeenLocation[key] = waymessage; 
            all.push(waymessage);
          }
          return all;
        }, []);
      });
}

export function getUserLocation() {
    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition((userPosition) => {
        // setState refreshes the react app when called
        resolve({
            lat: userPosition.coords.latitude,
            lng: userPosition.coords.longitude,
        });
        console.log("User location received... positioning map. " + userPosition.coords.latitude + ", " + userPosition.coords.longitude);
      }, () => {
        console.log("User location request denied... locating general location from ip adress.")
        fetch("https://ipapi.co/json")
          .then(res => res.json())
          .then(userPosition => {
            //console.log(userPosition);
            resolve({
                lat: userPosition.latitude,
                lng: userPosition.longitude,
            });
          });
      });
    });
}

export function sendWayMessage(message) {
	return fetch(WAYMESSAGE_API_URL, {
		method: "POST",
		credentials: 'include',
		headers: {
			'Accept': "application/json",
			'Content-Type': "application/json",
		},
		body: JSON.stringify(message),
	})
	.then(res => res.json())
}