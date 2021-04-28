import React from "react";
import '../pages/ShareStylesheet.scss';

import tinycolor from 'tinycolor2';
import GalleryCardColorInfo from './GalleryCardColorInfo.js';
import PaletteSlider from './PaletteSlider.js';
import {CopyToClipboard} from 'react-copy-to-clipboard';

/**
 * Component representing an immutable stylesheet that can be shared with others.
 */
class ImmutableStylesheet extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            copyTooltip: "none",
        };

        this.handleCopyURL = this.handleCopyURL.bind(this);
      }

    /**
     * Copies URL to user's clipboard.
     */
    handleCopyURL = () => {
        this.setState({copyTooltip: "block"});

        setTimeout(function(){
            this.setState({copyTooltip: "none"});
        }.bind(this), 1000);
    }

    /**
     * Renders color boxes with color information of the stylesheet.
     * @param {*} borderColor - the desired border color for the gallery boxes
     */
    renderColorInfo(borderColor) {
        return (this.props.colors.map((data, index) => {
          return (<GalleryCardColorInfo key={data}
                    hex ={data}
                    borderColor={borderColor}/>) })
        );
    }

    /**
     * Gets the font weight of the body font.
     */
    getBodyFontWeight() {
        if (this.props.body.style === "bold" || this.props.body.style === "bold italic") {
            return "bold";
        }
    }

    /**
     * Gets the font style of the body font.
     */
    getBodyFontStyle() {
        if (this.props.body.style === "italic" || this.props.body.style === "bold italic") {
            return "italic";
        }
    }

    /**
     * Gets the font weight of the header font.
     */
    getHeaderFontWeight() {
        if (this.props.title.style === "bold" || this.props.title.style === "bold italic") {
            return "bold";
        }
    }

    /**
     * Gets the font style of the header font.
     */
    getHeaderFontStyle() {
        if (this.props.title.style === "italic" || this.props.title.style === "bold italic") {
            return "italic";
        }
    }

    render() {
        // logic to adjust color from light to dark depending on background of stylesheet.
        let backgroundColor = this.props.background;
        let adjustedColor = 'white';
        if (tinycolor(backgroundColor).getLuminance() > 0.5) {
            adjustedColor = '#343436';
        }

        let colors = {
            title: this.props.colors[this.props.title.color],
            background: this.props.colors[this.props.background],
            body: this.props.colors[this.props.body.color]
          };

        return (
            <div className="immutable-stylesheet-container">
                <div className="immutable-stylesheet">
                    <div className="immutable-stylesheet__palette">
                    <PaletteSlider colors={this.props.colors} />
                    </div>

                    <div className="immutable-stylesheet__preview" style={{background: backgroundColor}}>

                            <div className ="immutable-stylesheet__preview__left">
                                    <div className ="immutable-stylesheet__preview__color-info" style={{color: adjustedColor}}>
                                        {this.renderColorInfo(adjustedColor)}
                                    </div>

                                    <div className="immutable-stylesheet__preview__font-info" style={{color: adjustedColor}}>
                                        <div className="font-label">
                                                <span  style={{textDecoration: 'underline', marginBottom: "10px"}}> Header </span>

                                                <div className="font-name-size">
                                                    <span style={{fontFamily: this.props.title.font, color: colors.title}}> {this.props.title.font} </span>
                                                    {this.props.title.size}
                                                </div>
                                        </div>

                                        <div className="font-label">
                                                <span  style={{textDecoration: 'underline', marginBottom: "10px"}}> Body </span>

                                                <div className="font-name-size">
                                                    <span style={{fontFamily: this.props.body.font, color: colors.body}}>  {this.props.body.font} </span>
                                                    {this.props.body.size}
                                                </div>
                                        </div>
                                    </div>
                            </div>

                            <div className ="immutable-stylesheet__preview__right">
                                    <div className="immutable-stylesheet__preview__text-info">
                                        <div className="immutable-stylesheet__preview__text-info__header" style={{fontStyle: this.getHeaderFontStyle(), fontWeight: this.getHeaderFontWeight(), fontFamily: this.props.title.font, fontSize: this.props.title.size, color: colors.title}}>
                                            {this.props.title.text}
                                        </div>

                                        <div className="immutable-stylesheet__preview__text-info__body"style={{fontStyle: this.getBodyFontStyle(), fontWeight: this.getBodyFontWeight(), fontFamily: this.props.body.font, fontSize: this.props.body.size, color: colors.body}}>
                                            {this.props.body.text}
                                        </div>
                                    </div>
                            </div>
                    </div>
                </div>
                <CopyToClipboard text={window.location.href} onCopy={() => this.handleCopyURL()}>
                    <div>
                        <button>copy url</button>
                        <div className="copy-tooltip" style={{display: this.state.copyTooltip}}> Copied!</div>
                    </div>

                </CopyToClipboard>

            </div>



        );
    }
}

export default ImmutableStylesheet;
