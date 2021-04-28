import React from 'react';
import PropTypes from 'prop-types';
import './NightModeToggler.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

/**
 * This component represents the button to toggle night mode.
 */
class NightModeToggler extends React.Component {

  render() {
    let icon = this.props.ifNightMode ? faMoon : faSun;
    
    return (
        <button type="button" 
            className={`button nightModeToggler`}
            onClick={this.props.onClick}>
            <FontAwesomeIcon icon={icon} />
        </button>
    );
  }

}

NightModeToggler.propTypes = {
    ifNightMode:  PropTypes.bool,
};

NightModeToggler.defaultProps = {
    ifNightMode: false,
};

export default NightModeToggler;