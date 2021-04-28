import React from 'react';
import PropTypes from 'prop-types';
import './Stylesheet.scss';

/**
 * This component contains the sidebar of the stylesheet,
 * which is a palette. It takes in a list of colors, and
 * renders these colors.
 */

class StylesheetDrawerPaletteBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        background: this.props.background
    }
    this.handleChange = this.handleChange.bind(this);
  }

  // calls the callback function that makes the palette appear selected
  handleChange () {
    this.props.handleNodeColorChange(this.props.type, this.props.index, "update"); 
  };

  render() {
    let select = this.props.isSelected ? "select" : "";
    return (
        <div 
        onClick={this.handleChange}
        className={`stylesheet__drawer__palette_box stylesheet__drawer__palette_box--${select}`}
        style={{backgroundColor: this.state.background, 
        height: this.props.height,
        width: this.props.width}}> </div>
    );
  }
}

StylesheetDrawerPaletteBox.propTypes = {
    // id of the palette box, which is the workspace id + the index
    id: PropTypes.string,
    // the index, which palette box it is
    index: PropTypes.number,
    // background in hex code
    background: PropTypes.string,
    // height in px
    height: PropTypes.string,
    // width in px
    width: PropTypes.string,
    // callback to handle color change
    handleColorChange: PropTypes.func,
    // boolean for if the box is selected
    isSelected: PropTypes.bool,
    // type of node that it's modifying
    type: PropTypes.oneOf(["body", "title", "background"])

};

StylesheetDrawerPaletteBox.defaultProps = {
    height: '30px',
    width: '30px',
    ifCanToggleColor: false
};

export default StylesheetDrawerPaletteBox;