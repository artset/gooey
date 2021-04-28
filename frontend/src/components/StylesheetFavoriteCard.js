import React from 'react';
import PropTypes from 'prop-types';
import './Stylesheet.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
/**
 * This is a single node (body or text) contained in the stylesheet.
 * This is contained in the StylesheetPreview component. On selection, there
 * will be a blue border, and the corresponding drawer will appear.
 */
class StylesheetFavoriteCard extends React.Component {

    constructor(props) {
        super(props);
        this.convertToStylesheet = this.convertToStylesheet.bind(this);

    }

    /**
     * This is a function that helps transforms a favorited card into the data
     * necessary for a stylesheet.
     */
    convertToStylesheet() {
        let data = {};
        data["colors"] = this.props.colors;
        data["title"] = this.props.title;
        data["body"] = this.props.body;
        data["background"] = this.props.background;
        data["name"] = "Untitled"; 

        data["title"]["size"] = "16px";
        data["title"]["style"] = "Regular";
        data["title"]["alignment"] = "left";
        data["title"]["text"] = "Lorem Ipsum";

        data["body"]["size"] = "12px";
        data["body"]["style"] = "Regular";
        data["body"]["alignment"] = "left";
        data["body"]["text"] = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
        this.props.handleCreateStylesheet(data);
    }

    render() {
        return (
            <div className="stylesheet__favorites__card"
                style={{
                    background: this.props.colors[this.props.background],
                    color: this.props.colors[this.props.body.color]
                }}>

                <div className="stylesheet__favorites__card__header"
                    style={{ fontFamily: this.props.title.font }}>
                    {this.props.title.font}
                </div>

                <div className="stylesheet__favorites__card__body"
                    style={{ fontFamily: this.props.body.font }}>
                    {this.props.body.font}.  Lorem ipsum dolor sit amet, consectetur adipiscing elit
                </div>

                <div className="stylesheet__favorites__card__button">
                    <FontAwesomeIcon icon={faCopy} color={this.props.colors[this.props.body.color]} onClick={this.convertToStylesheet} />
                    <FontAwesomeIcon icon={solidHeart} color={this.props.colors[this.props.body.color]} onClick={() => this.props.deleteFavoriteCard(this.props.id)} />
                </div>
            </div>
        );
    }
}

StylesheetFavoriteCard.propTypes = {
    // dictionary of colors that looks like this:
    // colors { hex: [c1, c2], rgb:[c1,c2], labels:[c1,c2]}
    colors: PropTypes.array,
    // info about title
    title: PropTypes.object,
    // info about body
    body: PropTypes.object,
    // background color
    background: PropTypes.number,
    // callback to create stylesheet
    handleCreateStylesheet: PropTypes.func,
};

StylesheetFavoriteCard.defaultProps = {

};

export default StylesheetFavoriteCard;