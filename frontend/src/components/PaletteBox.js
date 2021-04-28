import React from 'react';
import PropTypes from 'prop-types';
import './PaletteBox.scss';
import Tooltip from "reactjs-popup";
import ColorPicker from './ColorPicker';

/**
 * This component represents a single color on the palette slider.
 */
class PaletteBox extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            background: this.props.background
        }
        this.handleChange = this.handleChange.bind(this);
        this.updateColorInStylesheet = this.updateColorInStylesheet.bind(this);
    }


    /**
     * Updates the PaletteBox color to the new color chosen by user.
     * @param {*} color - the new color the user has selected
     * @param {*} event - the event of the user clicking the color
     */
    handleChange(color, event) {
        this.setState({ background: color });
    };

    /**
     * Updates the color in the stylesheet if the user happens to change a color that is 
     * displayed on the stylesheet.
     * @param {*} color - the color that the user has changed the PaletteBox to.
     */
    updateColorInStylesheet(color) {
        this.props.handlePaletteColorChange(color, this.props.index);
    }

    render() {
        return (
            <div className="palette__color">
                <Tooltip
                    key={this.props.id}
                    trigger={open => (
                        <div className="palette__box"
                            style={{ backgroundColor: this.state.background }} />
                    )}
                    on="hover"
                    mouseEnterDelay={1000}
                    mouseLeaveDelay={800}
                    position="right top"
                    closeOnDocumentClick>

                    <ColorPicker 
                     index={this.props.index}
                     hexcode={this.state.background}
                     onChange={this.handleChange}
                     canDeleteColors={this.props.canDeleteColors}
                     handleDeletePaletteColor={this.props.handleDeletePaletteColor}
                     handlePaletteColorChange={this.props.handlePaletteColorChange} 
                     updateColorInStylesheet = {this.updateColorInStylesheet}/>
                </Tooltip>
            </div>

        );
    }
}

PaletteBox.propTypes = {
    // id of the palette box, which is the workspace id + color?
    id: PropTypes.string,
    // the index, which palette box it is
    index: PropTypes.number,
    // background in hex code
    background: PropTypes.string,
    // callback to handle color change
    handlePaletteColorChange: PropTypes.func,
    // callback to delete a color
    handleDeletePaletteColor: PropTypes.func,
    // boolean determines if we should render the delete button
    canDeleteColors: PropTypes.bool,
};

export default PaletteBox;