import React from 'react';
import PropTypes from 'prop-types';
import "./Banner.scss";

/**
 * This component is used to render simple notifications and warning messages.
 */
class Banner extends React.Component {

  render() {
    return (
        <div className={`banner banner--${this.props.type}`}>
            {this.props.text}
        </div>
    );
  }
}

Banner.propTypes = {
    text: PropTypes.string,
    type: PropTypes.oneOf(['normal', 'warning', 'error', 'success'])
};

Banner.defaultProps = {
    type: 'primary',
};

export default Banner;