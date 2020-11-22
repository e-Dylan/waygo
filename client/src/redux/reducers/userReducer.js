
/**
 * Reducer that updates the global redux store with user session state data.
 * Called whenever the user logs in or logs out with the setUserState action.
 * 
 * @param { state } Default state object
 * @param { action } Action that alerts this reducer to update the store, called when user logs in. 
 */

var stateInit = {

};

const userReducer = (state = stateInit, action) => {
	switch (action.type) {
		case "SET_USER_STATE":
			state.userState = action.payload;
			return state.userState;
		default: 
			return state;
	}
}

export default userReducer;