import React from 'react';
import './GalleryCard.scss';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as outlineHeart } from '@fortawesome/free-regular-svg-icons';
import { faHeart as solidHeart, faInfoCircle, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import GalleryCardColorInfo from './GalleryCardColorInfo';
import ReactCardFlip from 'react-card-flip';
import tinycolor from 'tinycolor2';

/**
 * This component renders a single Gallery card.
 */
class GalleryCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        backgroundColor: this.props.data.colors.hex[this.props.data.background],
        textColor: this.props.data.colors.hex[this.props.data.body.color],
        flipCard: false
    };
    this.handleInvertColors = this.handleInvertColors.bind(this);
    this.handleFlipCard = this.handleFlipCard.bind(this);
    this.handleFavorite = this.handleFavorite.bind(this);
    this.deleteCard = this.deleteCard.bind(this);

  }

  /**
   * Inverts the colors on the card.
   * (Background becomes font color, font color becomes background.)
   */
  handleInvertColors() {
    if (!this.state.flipCard){
        let oldBackgroundColor = this.state.backgroundColor;
        this.setState({
            backgroundColor: this.state.textColor,
            textColor: oldBackgroundColor
        })
    }
  }

  /**
   * Flips a card between the front and back.
   */
  handleFlipCard() {
    if (!this.state.flipCard) {
        let adjustedColor = 'white';
        let bgColor = this.props.data.colors.hex[this.props.data.background];
        if (tinycolor(bgColor).getLuminance() > 0.5) {
          adjustedColor = '#343436';
        }
        this.setState({backgroundColor: bgColor, textColor: adjustedColor});

    } else {
        this.setState({
            backgroundColor:  this.props.data.colors.hex[this.props.data.background], 
            textColor: this.props.data.colors.hex[this.props.data.body.color]});
    }
    this.setState({flipCard: !this.state.flipCard,});
  }

  /**
   * Adds the card to the user's favorite collection.
   */
  handleFavorite(){
    this.props.favoriteHandler(this.props.id, this.props.workspaceId);
  }

  /**
   * Deletes a gallery card.
   */
  deleteCard() {
    this.props.deleteHandler(this.props.id, this.props.workspaceId);
  }


  render() {
    let colors = {
        color: this.state.textColor,
        background: this.state.backgroundColor,
    };

    let front = 
        <div className="gallery__card" style={colors}>
            <div className="gallery__card__header">
            <FontAwesomeIcon icon={this.props.heart === true ? solidHeart : outlineHeart } onClick={this.handleFavorite} />
            <FontAwesomeIcon icon={faInfoCircle} onClick={this.handleFlipCard} />
            </div>
            <div className="gallery__card__footer">
                <FontAwesomeIcon icon={faSyncAlt} onClick={this.handleInvertColors} />
            </div>
            <div className="gallery__card__content">
                <div className="gallery__card__title" 
                    style={{fontFamily: this.props.data.title.font}}>
                    {this.props.data.title.font}
                </div>
                <div className="gallery__card__desc" style={{fontFamily: this.props.data.body.font}}>
                    {this.props.data.body.font}
                    <br />
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </div>
            </div>
        </div>;
    
    let back = 
        <div className="gallery__card" style={colors}>
            <div className="gallery__card__header">
            <FontAwesomeIcon icon={this.props.heart === true ? solidHeart : outlineHeart } onClick={this.handleFavorite} />
            <FontAwesomeIcon icon={faInfoCircle} onClick={this.handleFlipCard} />
            </div>

            <div className="gallery__card__content">
                <GalleryCardColorInfo rgb= {this.props.data.colors.rgb[0]} hex ={this.props.data.colors.hex[0]} borderColor={this.state.textColor}/>
                <GalleryCardColorInfo rgb= {this.props.data.colors.rgb[1]} hex ={this.props.data.colors.hex[1]} borderColor={this.state.textColor}/>
            </div>
        </div>;

    return (
            <ReactCardFlip containerStyle={{margin: "20px"}} isFlipped={this.state.flipCard} flipDirection="horizontal">
                {front}
                {back}
            </ReactCardFlip>
    );
  }
}

GalleryCard.propTypes = {
    // data object containing font and color info for the card
    data: PropTypes.object,
    // id of the card
    id: PropTypes.string,
    // boolean representing if the card has been favorited or not
    heart: PropTypes.bool
};

GalleryCard.defaultProps = {
    heart: false
}

export default GalleryCard;