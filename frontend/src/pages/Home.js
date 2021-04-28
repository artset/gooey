import React from 'react';
import './Home.scss';
import Button from '../components/Button.js';
import GooeyBlob from '../components/GooeyBlob.js';

/**
 * Component that represents the home/landing page of our application.
 */
class Home extends React.Component {

    /**
     * Function that navigates to the login page.
     */
    goLogin = () => {
        this.props.history.push("/login");
    }

    /**
     * Function that navigates to the about page.
     */
    goAbout = () => {
        this.props.history.push("/about");
    }


    render() {
        return (
            <div>
                <div className="content">

                    <div className="home__container">
                        <div className="home__background">
                            <GooeyBlob/>
                        </div>

                        <div className="home__labels">
                            <div className="home__title">gooey</div>
                            <Button onClick={this.goLogin} text="Login" color="#62DDEE" background="white"/>

                            </div>
                    </div>
                </div>

                <div class="home__about-button">
                    <Button onClick={this.goAbout} text="About"/>
                </div>


            </div>
        );
    }
}

export default Home;
