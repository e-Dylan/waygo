
/**
 * 
 * @param { userData } Active user session data being set in the store state. 
 */
export const setUserSavedLocations = (userSavedLocations) => {
	return {
		type: "SET_USER_SAVED_LOCATIONS",
		payload: userSavedLocations
	}
}