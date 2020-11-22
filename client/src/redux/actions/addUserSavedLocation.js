
/**
 * 
 * @param { userSavedLocation } New user location being saved to current state.
 */
export const addUserSavedLocation = (userSavedLocation) => {
	return {
		type: "ADD_USER_SAVED_LOCATION",
		payload: userSavedLocation
	}
}