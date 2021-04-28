import React from 'react';
import PropTypes from 'prop-types';
import '../pages/Home.scss';
import Button from './Button';
import Popup from "reactjs-popup";
import "./PopUp.scss"

/**
 * Wrapper component for a PopUp modal.
 */
class PopUp extends React.Component {

  render() {
    const contentStyle = {
        padding: "20px", 
        width: "700px", 
        border: "1px solid #ffffff"
    };
    
    return (
        <Popup
            trigger={<Button background={this.props.background} color={this.props.color} type={this.props.type} className="button" text={this.props.button} />}
            modal
            closeOnDocumentClick
            mouseEnterDelay={4}
            overlayStyle={{ background: "rgba(98, 221, 238, 0.2)", border: "1px solid transparent" }}
            contentStyle={contentStyle}
            open={this.props.open}
        >
            <div className="popup__content"> {this.props.children}</div>
        </Popup>
    );
  }
}

PopUp.propTypes = {
    // the button key word
    button: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    // type of button desired
    type: PropTypes.string,
    // color of the button
    color: PropTypes.string,
    // overlay color
    background: PropTypes.string,
    // props for controled popup
    open: PropTypes.bool
};

PopUp.defaultProps = {
  type: 'primary',
  background: "#62DDEE",
  color: "#FFFFFF",
  open: false,
};


export default PopUp;