import React from 'react';
import '../App.css';

class Nav extends React.Component {

    render() {
       // console.log(UserStore.isLoggedIn); // calling before isLoggedIn UserStore is set.
        return (
            <div>
                <nav>
                    <div className="nav-container">
                        <div className="nav-left">
                            <a className="nav-link" href="/"><b>Waygo</b></a>
                            <a className="nav-link" href="/live-map">live maps</a>
                        </div>
                        

                        <div className="nav-right">  
                            <a className="nav-link" href="/account/login">login</a>
                            <a className="nav-link" href="/" onClick={this.props.doLogout}>logout</a>
                        </div>

                    </div>
                </nav>
            </div>
            
        );
    }

}

export default Nav;