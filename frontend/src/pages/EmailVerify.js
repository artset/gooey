import React from 'react';
import PropTypes from 'prop-types';
import './Login.scss';
import Button from '../components/Button.js';
import Header from '../components/Header.js';
import Banner from '../components/Banner';
import '../pages/EmailVerify.scss';

/**
 * Component representing email verification page. Will return to login if user tries to go to /verify.
 */
class EmailVerify extends React.Component {
    constructor(props) {
        super(props);
        this.state = { success: null}
        this.sendEmail = this.sendEmail.bind(this);
        this.goLogin = this.goLogin.bind(this);
   }

    sendEmail() {
        let curr = this;
        this.props.location.data.user.sendEmailVerification().then(function() {
            curr.setState({success: true});
        }).catch(function(error) {
            curr.setState({success: false});
        });
    }

    goLogin = () => {
        this.props.history.push("/login");
    }

    render() {
        let email = "";
        if (this.props.location.data != null) {
            email = this.props.location.data.email;
        } else {
            this.goLogin();
        }
        let content ="";

        if (this.state.success == null) {
            content =  <div> 
                            <div className="overlay"></div>
                            <div className="verification__content">
                                    <div id = "verification">
                                        <Header id="verification" text="home" type="generic" />
                                    </div>

                                    <div className="verification">
                                        <div className="verification__header"> <span role="img" aria-label="stop emoji">✋</span>  Stop right there!</div>
                                        <hr/>

                                        <div className="verification__description">
                                            You’ll need to <span style={{ fontWeight: "bold", color: "#4BD20B" }}>verify</span> your account before you can login.

                                        </div>
                                        <div className="verification__button">
                                            <Button onClick={(e) => this.sendEmail()} text="Verify account" />
                                        </div>
                                    </div>
                                </div>
                            </div>;
        } else if (!this.state.success) {
            content= <Banner text={`Aww shucks, something happened. Try again!`} type="error" />;
        } else if (this.state.success) {
            content = <div>
                            <div className="overlay"></div>
                            <div className="verification__content">
                                    <div id = "verification">
                                        <Header id="verification" text="home" type="generic" />
                                    </div>

                                    <div className="verification">
                                        <div className="verification__header">  <span role="img" aria-label="stop emoji">✋</span> Stop right there!</div>
                                        <hr/>

                                        <div className="verification__description">
                                            You’ll need to <span style={{ fontWeight: "bold", color: "#4BD20B" }}>verify</span> your account before you can login.
                                        </div>

                                        <div className="verification__banner">
                                            <Banner text={`Email verification sent to ${email}`} type="success" />
                                        </div>

                                        <div className="verification__button">
                                            <Button onClick={this.goLogin} text="Go back to login" />
                                        </div>
                                    </div>
                                   
                            </div>
                      </div>;
        }

        return (
            <div>
                {content}
            </div>
        );
  }
}

EmailVerify.propTypes = {
    // object containing the following
    // data.email = email of user
    // data.password = password of user
    location: PropTypes.object
};

export default EmailVerify;
