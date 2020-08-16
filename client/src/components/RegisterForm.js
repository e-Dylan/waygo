import React from 'react';
import InputField from './InputField'
import SubmitButton from './SubmitButton'
import UserStore from '../stores/UserStore'

const login_form_image = require('../resources/images/login-form-image.png');

class RegisterForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            
            username: '',
            password: '',
            email: '',

            // disable button when login request is loading
            buttonDisabled: false,
        }
    }

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
            email: '',

            buttonDisabled: false,
        })
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
                    email: this.state.email,
                    password: this.state.password,
                })
            });
            
            // backend will respond success if the user matches any, not if no user.
            let result = await res.json();
            if (result && result.success) {
                UserStore.isLoggedIn = true;
                UserStore.username = result.username;
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

    render() {
        return (
            <div className="base-container">
                <div className="header">Register</div>
                <div className="content">
                    <div className="login-form-image">
                        <img src={login_form_image} />
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
                        <div className="form-group">
                            <label htmlFor="email">email</label>
                            <InputField
                                type='email'
                                placeholder='email'
                                value={this.state.email ? this.state.email : ''}
                                onChange={ (val) => this.setStateFromInputValue('email', val) }
                            />
                        </div>
                        <div className="form-group">
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
                <div className="footer">
                    <SubmitButton
                        text='Register'
                        disabled={this.state.buttonDisabled}
                        onClick={ () => this.doLogin() }
                    />
                </div>
            </div>
        )
    }
}

export default RegisterForm;
