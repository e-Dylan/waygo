import React from 'react';
import InputField from './InputField'
import SubmitButton from './SubmitButton'
import UserStore from './stores/userstore'

class LoginForm extends React.Component {

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
            <div className="login-form">
                Log in.
                <InputField
                    type='text'
                    placeholder='username'
                    value={this.state.username ? this.state.username : ''}
                    onChange={ (val) => this.setStateFromInputValue('username', val) }
                />
                {/* <InputField
                    type='email'
                    placeholder='email'
                    value={this.state.email ? this.state.email : ''}
                    onChange={ (val) => this.setStateFromInputValue('email', val) }
                /> */}
                <InputField
                    type='text'
                    placeholder='password'  
                    value={this.state.password ? this.state.password : ''}
                    onChange={ (val) => this.setStateFromInputValue('password', val) }
                />
                <SubmitButton
                    text='Login'
                    disabled={this.state.buttonDisabled}
                    onClick={ () => this.doLogin() }
                />
            </div>
        )
    }
}

export default LoginForm;
