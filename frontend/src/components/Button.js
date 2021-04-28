import React from 'react';
import PropTypes from 'prop-types';
import './Button.scss';

/**
 * This component represents the standard button used throughout our application.
 */
class Button extends React.Component {

  render() {
    let active = this.props.disabled ? "inactive" : "";
    return (
        <button type="button" 
            className={`button button--${this.props.type} button--${this.props.size} button--${active}`} 
            style={{background: this.props.background, color: this.props.color}}
            onClick={this.props.onClick}
            >
            {this.props.text} {this.props.children}</button>
    );
  }
}

Button.propTypes = {
    onClick:  PropTypes.func,
    text: PropTypes.string,
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    type: PropTypes.oneOf(['primary', 'danger', 'edit']),
    background: PropTypes.string,
    disabled: PropTypes.bool
};

Button.defaultProps = {
    type: 'primary',
    size: 'medium',
    background: "#62DDEE",
    color: "#FFFFFF",
    disabled: false,
};
export default Button;