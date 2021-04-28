
import React from 'react';
import PropTypes from 'prop-types';
import './Loader.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

/**
 * This component represents the spinner that displays when a page is loading.
 */
class Loader extends React.Component {

  render() {

    let  possibleMessages =  ["Gathering typography...", "Coloring in palettes...", "Sprinkling algorithmic magic...", "Designing your workspace..."];
    let message = "";

    if (this.props.message) {
        let txt = possibleMessages[Math.floor(Math.random() * possibleMessages.length)];
        message = <div className="loader__message">{txt}</div>;
    }
    return (
        <div className="loader"><FontAwesomeIcon 
        icon={faSpinner} 
        color={this.props.color}
        size={this.props.size} spin />

        {message}
        
        </div>

    );
  }
}

Loader.propTypes = {
    // size of the loader
    size: PropTypes.oneOf(['xs', 'sm', 'lg', '2x', '3x', '5x', '7x']),
    // the color of the loader
    color: PropTypes.string,
    // custom message 
    message: PropTypes.bool,
};

Loader.defaultProps = {
    color: "#62DDEE",
    size: "lg",
};
export default Loader;