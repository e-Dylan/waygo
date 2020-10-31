
/**
 * 
 * @param { userData } Active user session data being set in the store state. 
 */
export const setUserState = (userState) => {
	return {
		type: "SET_USER_STATE",
		payload: userState
	}
}