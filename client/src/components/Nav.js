import React from 'react';
import '../App.css';
import './components-styles/Nav.scss'

import waygoLogo from '../resources/logo/waygo-logo.png'

class Nav extends React.Component {

    render() {
       // console.log(UserStore.isLoggedIn); // calling before isLoggedIn UserStore is set.
        return (
            <div>
                <nav>
                    <div className="nav-container">
                        <div className="nav-left">
                            <a className="nav-link" href="/">
								<img src={waygoLogo} className="nav-logo"></img>
								<b>Waygo</b>
							</a>
                            <a className="nav-link" href="/live-map">live maps</a>
                        </div>
                        

                        <div className="nav-right">  
                            <a className="nav-link" href="/login">login</a>
                            <a className="nav-link" href="/" onClick={this.props.doLogout}>logout</a>
                        </div>

                    </div>
                </nav>
            </div>
            
        );
    }

}

export default Nav;