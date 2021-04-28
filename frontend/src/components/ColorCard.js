import React from 'react';
import PropTypes from 'prop-types';
import './ColorCard.scss';

/**
 * This component is a single card used in the quiz.
 */
class ColorCard extends React.Component {
  constructor(props) {
    super(props);

    this.toggleClicked = this.toggleClicked.bind(this);
  }

  /**
   * Function that toggles if the card is selected or not.
   * params: color - the color being selected
   */
  toggleClicked = (color) => {
    if (!this.props.isSelected && this.props.fullCapacity !== true) {
        this.props.addSelection(color);
    } else {
        this.props.removeSelection(color);
    }
  }

  render() {
    return (
        // TODO: use tinycolor2 to make text light and dark rather than on hover lmao
        <div className = {`color color--${this.props.isSelected ? 'clicked' : ''}`} onClick={() => this.toggleClicked(this.props.color)}  style={{backgroundColor: this.props.color}}>
            <div className="colorInfo">
                <div className = "colorName"> {this.props.name} </div>
                <div className = "hexcode"> {this.props.color} </div>
            </div>
        </div>
    );
  }
}


ColorCard.propTypes = {
    // hex color code for the color
    color: PropTypes.string,
    // name of the color
    name: PropTypes.string,
    // boolean indicating if it's selected
    isSelected: PropTypes.bool,
    // callback function when capacity is full
    fullCapacity: PropTypes.func,
    // call back function to add color to selected
    addSelection: PropTypes.func,
    // callback function remove a color
    removeSelection: PropTypes.func
}

export default ColorCard;