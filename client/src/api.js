const WAYMESSAGE_API_URL = window.location.hostname === "localhost" ? "http://localhost:1337/api/waymessages" : "production-url-here";


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
        console.log("User location received... positioning map. " + userPosition.coords.latitude + ", " + userPosition.coords.latitude);
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