import React, { Component } from 'react';
import { observer } from 'mobx-react';

import '../App.css';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import UserStore from '../stores/UserStore';

import InputField from './InputField'
import SubmitButton from './SubmitButton'

const register_form_image = require('../resources/images/register-form-image.png');
const login_form_image = require('../resources/images/login-form-image.png');

const WEBSITE_URL = window.location.hostname === "localhost" ? "http://localhost:3000" : "production-url-here";


class LoginRegisterComponent extends Component {
  // every component has a state object, can be set with setState()
    state = {
        username: '',
        email: '',
        password: '',

        current: "s",
        opposite: "s",

        // disable button when login request is loading
        buttonDisabled: false,

        loginActive: true,
    };

    setStateFromInputValue(property, val) {
        val = val.trim();
        if (val.length > 30) {
            return;
        }
        this.setState({
            [property]: val
        })
    }

    resetForm() {
        this.setState({
            username: '',
            password: '',

            buttonDisabled: false,
        });
    }

    async doRegister() {
        const REGISTER_API_URL = window.location.hostname === "localhost" ? "http://localhost:1337/api/register" : "production-url-here";

        if (!this.state.username || !this.state.email || !this.state.password) {
            return;
        }

        this.setState({
            buttonDisabled: true,
        });

        try {   
            // make a request to the backend /login to try to login.
            let res = await fetch(REGISTER_API_URL, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: this.state.username,
                    email: this.state.email,
                    password: this.state.password,
                }),
            });
            
            // backend will respond success if the user matches any, not if no user.
            let result = await res.json();
            if (result && result.success) {
                alert(result.msg + "\nUsername: " + result.username);
                this.resetForm();
            } else if (result && result.success === false) {
                // User tried to log in, no account match found, login failed.
                this.resetForm();
                alert(result.msg); // change alert
            }
        }
        catch(e) {
            // error requesting to api
            console.log(e);
            this.resetForm();
        }
    }

    async doLogin() {
        const LOGIN_API_URL = window.location.hostname === "localhost" ? "http://localhost:1337/api/login" : "production-url-here";

        if (!this.state.username || !this.state.password) {
            return;
        }

        this.setState({
            buttonDisabled: true,
        });

        try {   
            // make a request to the backend /login to try to login.
            let res = await fetch(LOGIN_API_URL, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: this.state.username,
                    password: this.state.password,
                })
            });
            
            // backend will respond success if the user matches any, not if no user.
            let result = await res.json();
            if (result && result.success) {
                UserStore.isLoggedIn = true;
                UserStore.username = result.username;
                window.location.replace(WEBSITE_URL);
            } else if (result && result.success === false) {
                // User tried to log in, no account match found, login failed.
                this.resetForm();
                alert(result.msg); // change alert
            }
        }
        catch(e) {
            // error requesting to api
            console.log(e);
            this.resetForm();
        }
    }

    changeState() {
        const { loginActive } = this.state;
        const email_div = document.getElementById("email-div");
        const email_inputfield = document.getElementById("email-inputfield");
        const password_div = document.getElementById("password-div");

        console.log(email_inputfield);
        
        if (loginActive) {
            // move left (to register)
            this.sideButton.classList.remove("side-button-right");
            this.sideButton.classList.add("side-button-left");

            email_div.classList.remove("form-group-moveup");
            email_div.classList.remove("form-group-transparent");
            email_div.classList.remove("form-group-behind");
            email_inputfield.disabled = false;
            password_div.classList.remove("form-group-moveup");
        } else {
            // move right (to login)
            this.sideButton.classList.remove("side-button-left");
            this.sideButton.classList.add("side-button-right");

            email_div.classList.add("form-group-moveup");
            email_div.classList.add("form-group-transparent");
            email_div.classList.add("form-group-behind");
            email_inputfield.disabled = true;
            password_div.classList.add("form-group-moveup");
        }

        this.setState( (prevState) => ({
            loginActive: !prevState.loginActive,
        }));
    }

    render() {

        const { loginActive } = this.state;
        const current = loginActive ? "login" : "register";
        const opposite = loginActive ? "register" : "login";
        var currentTitle = current.charAt(0).toUpperCase() + current.slice(1)

        return(
            <div className="login-form">
                <div className="login-form-container">
                    <div className="base-container" ref={opposite}>
                        <div className="header" id="loginform-title">{currentTitle}</div>
                        <div className="content">
                            <div className="login-form-image">
                                <img src={loginActive ? login_form_image : register_form_image} />
                            </div>
                            <div className="form">
                                <div className="form-group">
                                    <label htmlFor="username">username</label>
                                    <InputField
                                        type='text'
                                        placeholder='username'
                                        name='username'
                                        value={this.state.username ? this.state.username : ''}
                                        onChange={ (val) => this.setStateFromInputValue('username', val) }
                                    />
                                </div>
                                <div className="form-group form-group-moveup form-group-transparent" id="email-div">
                                    <label htmlFor="email">email</label>
                                    <InputField
                                        id='email-inputfield'
                                        type='email'
                                        placeholder='email'
                                        value={this.state.email ? this.state.email : ''}
                                        onChange={ (val) => this.setStateFromInputValue('email', val) }
                                    />
                                </div>
                                <div className="form-group form-group-moveup" id="password-div">
                                    <label htmlFor="password">password</label>
                                    <InputField
                                        type='password'
                                        placeholder='password'  
                                        value={this.state.password ? this.state.password : ''}
                                        onChange={ (val) => this.setStateFromInputValue('password', val) }
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="login-form-button login-form-button-login">
                            <SubmitButton
                                text={currentTitle}
                                id="loginform-submit-button"
                                disabled={this.state.buttonDisabled}
                                onClick={ () => loginActive ? this.doLogin() : this.doRegister() }
                            />
                        </div>
                    </div>
                </div>
                <SideButton current={opposite} containerRef={ref => this.sideButton = ref} onClick={this.changeState.bind(this)} />
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
