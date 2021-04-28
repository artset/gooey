import React from 'react';
import PropTypes from 'prop-types';
import './GalleryCard.scss';
import {CopyToClipboard} from 'react-copy-to-clipboard';

/**
 * This component is used on the back of the GalleryCard and Stylesheet.
 * It takes in a color and a hex, and renders a color box with the rgb and hexcode information
 * beside it.
 */
class GalleryCardColorInfo extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
        hexDisplay: "none",
        rgbDisplay: "none"
    };
  }

  /**
   * Displays the copied message for hex codes briefly.
   */
  displayHex = () => {
    this.setState({hexDisplay: "block"});

    setTimeout(function(){
      this.setState({hexDisplay: "none"});
    }.bind(this), 1000);
  }

  /**
   * Displays the copied message for rgb codes briefly.
   */
  displayRgb = () => {
    this.setState({rgbDisplay: "block"});

    setTimeout(function(){
      this.setState({rgbDisplay: "none"});
    }.bind(this), 1000);
  }

  render() {
    return (
        <div className="gallery__card__color-info">
            <div className="gallery__card__color-box" style={{background: this.props.hex, borderColor: this.props.borderColor}} />
                <div className="gallery__card__color-text">
                    <CopyToClipboard text={this.props.hex} onCopy={() => this.displayHex()}>
                        <div className="copy-color">
                          <span> {this.props.hex}  </span>
                          <div className="copy-tooltip" style={{display: this.state.hexDisplay}}> Copied!</div>
                        </div>
                    </CopyToClipboard>

                    <CopyToClipboard text={this.props.rgb} onCopy={() => this.displayRgb()}>
                        <div className="copy-color">
                          <span> {this.props.rgb} </span>
                          <div className="copy-tooltip" style={{display: this.state.rgbDisplay}}> Copied!</div>
                        </div>
                    </CopyToClipboard>
                    
                </div>
        </div>
    );
  }
}

GalleryCardColorInfo.propTypes = {
  // Hexcode color of the box
  hex: PropTypes.string,
  // RGB color of the box
  rgb: PropTypes.string,
  //border color
  borderColor: PropTypes.string
};


GalleryCardColorInfo.defaultProps = {
  borderColor: 'white'
};


export default GalleryCardColorInfo;