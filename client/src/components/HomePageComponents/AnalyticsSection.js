import React, { useEffect } from 'react';

import '../components-styles/HomePage.scss'; // change to components css

// Images/icons
import analyticsIcon from '../../resources/front-page/analytics-section/analytics-icon.png';
import pageViewsIcon from '../../resources/front-page/analytics-section/page-views-icon.svg';
import registeredUsersIcon from '../../resources/front-page/analytics-section/registered-users-icon.svg';
import calculatedRoutesIcon from '../../resources/front-page/analytics-section/calculated-routes.svg';

const AnalyticsSection = (props) => {

	var pageViews = 0;
	var registedUsers = 0;
	var calculatedRoutes = 0; 

	// Fetch analytics data from db
	useEffect(() => {
		pageViews = 10;
	})

	return (
		<section className="analytics-section">
			<div className="container-center">
				<div className="section-header">
					<div className="section-title">
						<img src={analyticsIcon} className="analytics-icon" />
						<span>Waygo Analytics</span>
					</div>
					<span className="title-desc">See what users are doing now.</span>
				</div>
				<div className="analytics-content">
					<div className="analytics-item">
						<img src={pageViewsIcon} className="ana-item-icon"></img>
						<span className="ana-title">Page Views</span>
						<p className="ana-content">{pageViews} views</p>
					</div>
					<div className="analytics-item">
						<img src={registeredUsersIcon} className="ana-item-icon"></img>
						<span className="ana-title">Registered Users</span>
						<p className="ana-content">{registedUsers} users</p>
					</div>
					<div className="analytics-item">
						<img src={calculatedRoutesIcon} className="ana-item-icon"></img>
						<span className="ana-title">Calculated Routes</span>
						<p className="ana-content">{calculatedRoutes} routes calculated.</p>
					</div>
				</div>
			</div>
		</section>
	)
}

export default AnalyticsSection;