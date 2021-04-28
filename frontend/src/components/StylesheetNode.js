import React from 'react';
import PropTypes from 'prop-types';
import './Stylesheet.scss';
import ContentEditable from './ContentEditable.js';

/**
 * This is a single node (body or text) contained in the stylesheet.
 * This is contained in the StylesheetPreview component. On selection, there
 * will be a blue border, and the corresponding drawer will appear.
 */
class StylesheetNode extends React.Component {
    getFontWeight() {
        if (this.props.style === "bold" || this.props.style === "bold italic") {
            return "bold";
        }
    }

    getFontStyle() {
        if (this.props.style === "italic" || this.props.style === "bold italic") {
            return "italic";
        }
    }

    render() {

        let selection = this.props.isSelected ? "select" : "";
        return (
            <div
                className={`stylesheet__content__node 
            stylesheet__content__node--${this.props.type}
            stylesheet__content__node--${selection}`}
                style={
                    {
                        color: this.props.color,
                        fontStyle: this.getFontStyle(),
                        fontWeight: this.getFontWeight(),
                        fontSize: this.props.size,
                        fontFamily: this.props.font,
                        textAlign: this.props.alignment,
                    }}
                onClick={(e) => { e.stopPropagation(); this.props.handleNodeSelection(this.props.type) }}
                onChange={(e) => { this.onTextChange(e) }}
                >
                <ContentEditable spellcheck="false" html={this.props.text} onChange={(e) => this.props.handleFontChange(this.props.type, "text", e.target.value)} />
            </div>
        );
    }
}

StylesheetNode.propTypes = {
    // color in hex
    color: PropTypes.string,
    // font size
    size: PropTypes.string,
    // font family
    font: PropTypes.string,
    // font style
    style: PropTypes.string,
    // callback when you click on node
    handleNodeSelection: PropTypes.func,
    // indicates if the node is silected
    isSelected: PropTypes.bool,
    // type  is a string indicating what kind of node it is
    type: PropTypes.oneOf(["body", "title"]),
    // alignment
    alignment: PropTypes.oneOf(["left", "center", "right"]),
    // id
    id: PropTypes.string.isRequired,
    // TEXT displayed on the node
    text: PropTypes.string
};

StylesheetNode.defaultProps = {
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    style: "Regular",
    alignment: "left",
};

export default StylesheetNode;