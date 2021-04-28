import React from 'react';
import './Login.scss';
import Button from '../components/Button.js';
import Banner from '../components/Banner.js';
import Header from '../components/Header.js';
import Loader from '../components/Loader.js';

import firebase from '../config.js';
import API from '../constants.js';

/**
 * The Login page handles sign up and login.
 */
class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isSignup: false, 
            username:"", 
            email:"", 
            password:"", 
            confirmPassword:"", 
            error: "",
            isLoading: false
        };
        this.handleToggle = this.handleToggle.bind(this);
        this.signUp = this.signUp.bind(this);
        this.logIn = this.logIn.bind(this);
        this.handlePassword = this.handlePassword.bind(this);
        this.handleEmail = this.handleEmail.bind(this);
        this.goHome = this.goHome.bind(this);
   }

    goHome = () => {
        this.props.history.push("/");
    }

    signUp () {
        let email = this.state.email;
        let pw = this.state.password;
        let confirmpw = this.state.confirmPassword;
        if (this.state.email.length < 6 ) {
            this.setState({error: <Banner type="error" text="Please enter a valid email." />})
        } else if (pw.length <= 5) {
            this.setState({error: <Banner type="error" text="Password must be at least 6 characters." />})
        } else if (pw === confirmpw && pw.length > 6){
            let currCom = this;
            this.setState({ifLoading: true});
            firebase.auth().createUserWithEmailAndPassword(email, pw)
                .then(function(user) {
                    const fetchData = {email: email, uid: firebase.auth().currentUser.uid};
                    fetch(API + "/auth/signin", {
                        method: "POST",
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(fetchData),
                    })
                        .then(response=> response.json())
                        .then(result => {
                            if (result.success) {
                                currCom.props.history.push({
                                    pathname: '/verify',
                                    data: {"email": currCom.state.email, "user": firebase.auth().currentUser}
                                });
                            } else {
                                throw "db error";
                            }
                        });
                }).catch(function (error) {
                    this.setState({ifLoading: false});
                    if (error.code === "auth/email-already-in-use") {
                        currCom.setState({error: <Banner type="error" text="This email address is already registered." />});
                    } else if (error.code === "auth/invalid-email") {
                        currCom.setState({error: <Banner type="error" text="Please enter a valid email." />})
                    } else {
                        currCom.setState({error: <Banner type="error" text="An error occured, please try again!" />})
                    }
            });
        } else{
            this.setState({error: <Banner type="error" text="Passwords do not match" />})
        }
    }

    logIn () {
        let email = this.state.email;
        let password = this.state.password;
        let currentComponent = this;
        firebase.auth().signInWithEmailAndPassword(email, password).then(e=> {
            let user = firebase.auth().currentUser;
            if (user.emailVerified) {
                currentComponent.goDashboard();
            } else {
                currentComponent.setState({error: <Banner type="error" text="Please verify your email first." />})
            }
        }).catch(function(error) {
            if (error.code === "auth/wrong-password" || error.code === "auth/user-not-found" || error.code === "auth/invalid-email") {
                currentComponent.setState({error: <Banner type="error" text="The username or password is incorrect." />})
            } else {
                currentComponent.setState({error: <Banner type="error" text="The username or password is incorrect."/>})
            }
        });
    }

    handleToggle() {
        this.setState(prevState => ({isSignup: !prevState.isSignup}));
    }

    goDashboard = () => {
        this.props.history.push({
            pathname: '/dashboard',
            data: {"email": this.state.email} // your data array of objects
        })
    }

    handleEmail(e) {
        this.setState({email: e.target.value});
    }

    handlePassword(e) {
        this.setState({password: e.target.value});
    }

    handleConfirmPassword(e) {
        this.setState({confirmPassword: e.target.value});
    }

    render() {
        let header = "";
        let rec ="";
        let capt = "";
        let button = "";
        let confirmPassword ="";
        let loader = "";

        if (this.state.isLoading) {
            loader = <Loader message={false} />
        }
        if (this.state.isSignup){
            header = "Sign up";
            rec = "Login";
            capt = "Have an account? ";
            confirmPassword =
            <div>
                <label>Confirm Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" required minLength="7"
                onChange= { e => {this.handleConfirmPassword(e) }}></input>
            </div>;
            button = <Button onClick={this.signUp} text={header} />;
        } else {
            header = "Log in";
            rec = "Sign up";
            capt = "Don't have an account? ";
            button = <Button onClick={this.logIn} text={header} />;
        }
        return (
        <div className="content">
            <Header text="home" type="generic" rerouteDashboard={this.goHome} nightModeButton={this.props.nightModeButton}/>
            <div className="login">
                <h3>{header}</h3>

                {this.state.error}


                <label>Email</label>
                <input type="text" id="email" name="email" required minLength="4"
                    onChange= { e => {this.handleEmail(e) }}></input>

                <label>Password</label>
                <input type="password" id="password" name="password" required minLength="7"
                    onChange= { e => {this.handlePassword(e) }}></input>

                {confirmPassword}

                {button}

                <br /> < br />
                <div className="caption">{capt}
                    <a href="/login#" onClick={this.handleToggle}> {rec}!</a>
                </div>

                <br /> <br />
                {loader}
            </div>
        </div>
        );
  }
}

export default Login;
