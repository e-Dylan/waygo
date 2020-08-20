import React from 'react';
import '../App.css';

import UserStore from '../stores/UserStore';

const waygo_nav_logo = require('../resources/waygo-logo2.png');

class Nav extends React.Component {

    render() {
        console.log(this.props.isLoggedIn);
        return (
            <div>
                { UserStore.isLoggedIn ?
                
                <nav>
                    <div className="nav-container">
                        <div className="nav-left">
                            <a className="nav-link" href="/"><b>Waygo</b></a>
                            <a className="nav-link" href="/live-map">live maps</a>
                        </div>
                        

                        <div className="nav-right">
                            <a className="nav-link" href="/account/login">login</a>
                            <a className="nav-link" onClick={this.props.doLogout}>logout</a>
                        </div>

                    </div>
                </nav>
                :
                // User is not logged in, display login/register links in nav.
                <nav>
                    <div className="nav-container">
                        <div className="nav-left">
                            <a className="nav-link" href="/"><b>Waygo</b></a>
                            <a className="nav-link" href="/live-map">live maps</a>
                        </div>
                        

                        <div className="nav-right">  
                            <a className="nav-link" href="/account/login">login</a>
                            <a className="nav-link" href="" onClick={this.props.doLogout}>logout</a>
                        </div>

                    </div>
                </nav>
                }
            </div>
            
        );
    }

}

export default Nav;