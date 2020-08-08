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

    // NO NEED TO VALIDATE USING SCHEMA FOR JUST USER LOGIN INPUT, DO ON SIGNUP.

    // userLoginFormIsValid(userNameField, passwordField, emailField) {
    //     // Validate user login input info with joi schema
    //     // DO: VALIDATE SIGNUP INFO ASWELL.

    //     var userInputInfo = {
    //         i_username: userNameField.value,
    //         i_password: passwordField.value,
    //         i_email: emailField.value
    //     };

    //     var result = user_login_schema.validate(userInputInfo);
    //     return result.error ? false : userInputInfo;
    // }

    // setStateUserInfo() {
    //     var userInputInfo = this.userLoginFormIsValid();
    //     if (userInputInfo) {
    //         // User successfully logged in with valid info
    //         this.setState({
    //             userInfo: userInputInfo
    //         });
    //         this.doLogin();
    //     } else {
    //         // User's data was invalid to the schema, login failed
    //         this.resetForm();
    //     }
    // }

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
        this.setState({
            buttonDisabled: true,
        });

        try {
            // make a request to the backend /login to try to login.
            let res = await fetch('/login', {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Title': 'application/json',
                },
                body: JSON.stringify({
                    username: this.state.username,
                    email: this.state.email,
                    password: this.state.password,
                }),
            });
            
            // backend will respond success if the user matches any, not if no user.
            let result = res.json();
            if (result && result.success) {
                UserStore.isLoggedIn = true;
                UserStore.username = result.username;
            } else if (result && !result.success) {
                // User tried to log in, no account match found, login failed.
                this.resetForm();
                
                // Change this
                alert(result.msg);
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
                <InputField
                    type='email'
                    placeholder='email'
                    value={this.state.email ? this.state.email : ''}
                    onChange={ (val) => this.setStateFromInputValue('email', val) }
                />
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
