import { combineReducers } from 'redux';
import UserStateReducer from './userStateReducer';

// Combine all reducers into single reducer object
// Export all modules from this directory.


/* OVERALL GLOBAL STATE OBJECT CONTAINING ALL STATE REDUCERS. */


const allReducers = combineReducers({
	userState: UserStateReducer
});

export default allReducers;