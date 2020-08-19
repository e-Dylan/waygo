import React, { Component } from 'react';
import { observer } from 'mobx-react';

import '../App.css';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import UserStore from '../stores/UserStore';

import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

class LoginRegisterComponent extends Component {
  // every component has a state object, can be set with setState()
  state = {
    loginActive: true,
  };

  changeState() {
    const { loginActive } = this.state;
    if (loginActive) {
        // move left (to register)
        this.sideButton.classList.remove("side-button-right");
        this.sideButton.classList.add("side-button-left");
    } else {
        // move right (to login)
        this.sideButton.classList.remove("side-button-left");
        this.sideButton.classList.add("side-button-right");
    }

    this.setState( (prevState) => ({
        loginActive: !prevState.loginActive,
    }));
  }

  render() {

    const { loginActive } = this.state;
    const current = loginActive ? "register" : "login";
    const currentActive = loginActive ? "login" : "register";

    return(
        <div className="login-form">
            <div className="login-form-container">
                {loginActive && (
                    <LoginForm containerRef={(ref) => this.current = ref}/>
                )}
                {!loginActive && (
                    <RegisterForm containerRef={(ref) => this.current = ref}/> 
                )}
            </div>
            <SideButton current={current} containerRef={ref => this.sideButton = ref} onClick={this.changeState.bind(this)} />
        </div> 
        
    )
  }
  
}

const SideButton = props => {
    return (
        <div className="side-button side-button-right" ref={props.containerRef} onClick={props.onClick}>
            <div className="inner-container">
                <div className="side-button-text">{props.current}</div>
            </div>
        </div>
    );
}

export default LoginRegisterComponent;
