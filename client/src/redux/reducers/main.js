import { combineReducers } from 'redux';
import { addUserSavedLocation } from '../actions/addUserSavedLocation';
import UserReducer from './userReducer';
import UserSavedLocationsReducer from './userSavedLocationsReducer';

// Combine all reducers into single reducer object
// Export all modules from this directory.


/* OVERALL GLOBAL STATE OBJECT CONTAINING ALL STATE REDUCERS. */


const allReducers = combineReducers({
	userState: UserReducer,
	userSavedLocationsState: UserSavedLocationsReducer,
	addUserSavedLocation: addUserSavedLocation,
});

export default allReducers;