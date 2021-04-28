import React from 'react';
import PaletteBox from './PaletteBox.js';
import PropTypes from 'prop-types';
import PanelGroup  from './PanelGroupModule/PanelGroup.js';

import './PaletteSlider.scss';


/**
* This component renders the palette slider found on the left of each stylesheet. 
* Contained within the Stylesheet component.
*/
class PaletteSlider extends React.Component {

  /**
   * Function that renders the palette without any changes made by the user. All colors
   * will be given equal space on the slider.
   */
  renderInitialPalette() {
    return (this.props.colors.map((data, index) => {
      return (<PaletteBox 
        background={data} 
        key={this.props.id + "" + data}
        index={index}
        deleteColor={this.props.deleteColor}
        handleDeletePaletteColor={this.props.handleDeletePaletteColor}
        canDeleteColors={this.props.canDeleteColors}
        handlePaletteColorChange={this.props.handlePaletteColorChange}
        />)})
    );
  }

  render() {
    let panelWidth = [];
    let singleWidth = 264 / this.props.colors.length; // proportioning the slider to be even across all colors
    for (let i = 0; i < this.props.colors.length; i++) {
        panelWidth.push(singleWidth);
    }

    return (
        <div className="panel-group">
            <PanelGroup direction="column" panelWidths={panelWidth} borderColor={this.props.colors} key={this.props.id}>
                {this.renderInitialPalette()}
            </PanelGroup>
        </div>
    );
  }
}

PaletteSlider.propTypes = {
    // an array of colors as hex strings
    colors: PropTypes.array.isRequired,
    // callback to change colors on a palette
    handlePaletteColorChange: PropTypes.func,
    // calback to delete a color
    handleDeletePaletteColor: PropTypes.func,
    // determines if we can delete color, then render the delete button
    canDeleteColors: PropTypes.bool,
};


export default PaletteSlider;
