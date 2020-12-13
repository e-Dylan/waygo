import React from 'react';

import '../components-styles/HomePage.scss'; // change to components css

// Images/icons

class AnalyticsSection extends React.Component {

    render() {

		return (
			<section className="analytics-section">
				<div className="container-center">
					<div className="section-header">Waygo Analytics</div>
					<div className="analytics-content">
						<div className="page-views">
							<span classname="ana-title">Page Views</span>
							<p className="ana-content">394,239 views</p>
						</div>
						<div className="registered-users">
							<span classname="ana-title">Registered Users</span>
							<p className="ana-content">20,010 users</p>
						</div>
						<div className="routes-calculated">
							<span classname="ana-title">Calculated Routes</span>
							<p className="ana-content">495,032 routes calculated.</p>
						</div>
					</div>
				</div>
			</section>
		)
	}
}


export default AnalyticsSection;