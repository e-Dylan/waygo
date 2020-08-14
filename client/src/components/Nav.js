import React from 'react';
import '../App.css';

const waygo_nav_logo = require('../resources/waygo-logo2.png');

class Nav extends React.Component {

    render() {
        return (
            <nav>
                <div className="nav-container">
                    <a className="nav-link" href="/">
                        <b>Waygo</b>
                    </a>

                    <a className="nav-link" href="/">live maps</a>

                    <div className="nav-right">
                        <a className="nav-link" href="/account/login">login</a>
                        <a className="nav-link" href="/">signup</a>
                    </div>

                </div>
            </nav>
        );
    }

}

export default Nav;