import React from 'react';
import { CustomPicker } from 'react-color';
import { Hue, Saturation } from 'react-color/lib/components/common';
import tinycolor from 'tinycolor2';
import './ColorPicker.scss';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import Button from './Button.js';

/**
 * Component that defines a custom Color Picker.
 */
class ColorPicker extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hsl : tinycolor(this.props.hexcode).toHsl(),
            hsv : tinycolor(this.props.hexcode).toHsv(),
            activeColor: this.props.hexcode,
            swatches:  this.props.swatches,
        }
      }

    /**
     * Changes the HSL value and the active color.
     * params: color - the color on the saturation slider
     *         event - the mouse click event
     */
    handleChangeHsl = (color, event) => {
        this.setState({hsl: color});
        this.setState({activeColor: tinycolor(color).toHexString()});
    }

    /**
     * Changes the HSV value and the active color.
     * params: color - the color on the saturation slider
     *         event - the mouse click event
     */
    handleChangeHsv = (color, event) => {
        this.setState({hsv: tinycolor(color).toHsv()});
        this.setState({hsl: tinycolor(color).toHsl()});
        this.setState({activeColor: tinycolor(color).toHexString()});
    }

    /**
     * Changes the HSV, HSL, and active color based on user inputted hex.
     */
    changeColor = (hex) => {
        this.setState({hsl: tinycolor(hex).toHsl()});
        this.setState({hsv: tinycolor(hex).toHsv()});
        this.setState({activeColor: hex});
    }

    /**
     * Function that registers changes in the hex code box that the user can type in.
     * @param {*} e - event that the user is typing.
     */
    handleChangeHex(e) {
        this.setState({activeColor: e.target.value});

        if (tinycolor(e.target.value).isValid()) {
            const hex = e.target.value;
            this.setState({hsl: tinycolor(hex).toHsl()});
            this.setState({hsv: tinycolor(hex).toHsv()});
        } 
    }

    render() {

              const picker = {
                width: "200px",
                boxSizing: 'initial',
                background: '#fff',
                borderRadius: '4px',
                boxShadow: '0 0 0 1px rgba(0,0,0,.15), 0 8px 16px rgba(0,0,0,.15)',
              }

              const saturation = {
                width: '100%',
                paddingBottom: '75%',
                position: 'relative',
                overflow: 'hidden',
              }
              
              const ssaturation= {
                radius: '7px',
                shadow: 'inset 0 0 0 1px rgba(0,0,0,.15), inset 0 0 4px rgba(0,0,0,.25)',
              }
              
              const controls = {
                display: 'flex',
              }

              const hue = {
                position: 'relative',
                height: '13px',
                overflow: 'hidden',
              }

              const hhue = {
                radius: '5px',
                shadow: 'inset 0 0 0 1px rgba(0,0,0,.15), inset 0 0 4px rgba(0,0,0,.25)',
              }

            let deleteButton = "";
            if (this.props.canDeleteColors) {
                deleteButton = 
                    <Button type="danger" onClick={(e) => { this.props.handleDeletePaletteColor(this.props.index) }}>
                        <FontAwesomeIcon icon={faTrash} />
                    </Button>
            }
    
            let saveButton = <Button onClick={(e) => {this.props.updateColorInStylesheet(this.state.activeColor)}} text="save" />
    
            let button = <div className="palette__color__button">
                {saveButton}
                {deleteButton}
                </div>;
                
        return (
            
            <div style={ picker } className="color-picker">
                
              <div style={ saturation }>
                <Saturation
                  style={ ssaturation }
                  hsl={ this.state.hsl }
                  hsv={ this.state.hsv }
                  onChange={ this.handleChangeHsv }
                />
              </div>
              <div style={ controls } className="flexbox-preview">

                        <div className="sliders">
                            <div style={ hue }>
                                    <Hue
                                    style={ hhue }
                                    hsl={ this.state.hsl }
                                    onChange={ this.handleChangeHsl }
                                    />
                            </div>
                        </div>

                    <div className="color-preview-box" style={{backgroundColor: this.state.activeColor}}></div>
                </div>

                <hr />
                
                <div className="picker__options">
                  <div className="hex-input">
                              <label id="hex-label">HEX: </label>
                              <input  id="hex" value={this.state.activeColor} name="hex" onChange= { e => {this.handleChangeHex(e) }}></input>
                  </div>
                  <div className="picker__buttons">
                       {button}
                  </div>
                </div>


        
            </div>
          );
    }
}


ColorPicker.propTypes = {
    // hex color
    hexcode: PropTypes.string,
    // the swatch below the color picker
    swatch: PropTypes.array,
    // callback to handle color change
    handlePaletteColorChange: PropTypes.func,
    // callback to delete a color
    handleDeletePaletteColor: PropTypes.func,
    // boolean determines if we should render the delete button
    canDeleteColors: PropTypes.bool,
    // callback to handle change for palette box
    onChange: PropTypes.func
};



export default CustomPicker(ColorPicker);