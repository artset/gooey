import React from 'react';
import Header from '../components/Header.js';
import Button from '../components/Button.js';
import Wave from 'react-wavify'
import './Error404.scss';

/**
 * Component representing error page.
 */
class Error404 extends React.Component {

    goHome = () => {
        this.props.history.push("/dashboard");
    }

    render() {
        return (
            <div>
            <div className="overlay"></div>
            <div className="overlay__content">
                    <div id = "404">
                        <Header id="404" text="home" type="generic" />
                    </div>

                    <div className="error404">
                        <div className="error404__top">

                            <div className="error404__header">  <span role="img" aria-label="scared emoji">😱</span> Oh no!</div>
                            <hr/>

                            <div className="error404__description">
                                We can't find the page you're looking for. Try again?
                            </div>

                        </div>
                    
                        <div className="wave">
                            <Wave fill='#62DDEE'
                                    paused={false}
                                    options={{ height: 20,
                                                amplitude: 30,
                                                speed: 0.15,
                                                points: 3 }}/>
                         </div>

                         <div className="error404__button">
                             <Button text="take me home" color={'#62DDEE'} background={"white"} onClick={this.goHome}/>
                         </div>

                        
                    </div>

                    
                
                </div>
            </div>
        );
    }
}

export default Error404;
