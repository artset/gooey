import React from 'react';
import PropTypes from 'prop-types';
import StylesheetNode from './StylesheetNode.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import GalleryCardColorInfo from './GalleryCardColorInfo.js';
import Button from './Button.js';
import tinycolor from 'tinycolor2';
import './Stylesheet.scss';
import ReactCardFlip from 'react-card-flip';

/**
 * The stylesheet preview component is the card on the left that 
 * exists on the stylesheet page, containing the title body text.
 * This gives a preview to the user on how their stylesheet looks in action.
 * This is contained in the Stylesheet component.
 */
class StylesheetPreview extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      flipCard: false,
    }

    this.handleDuplicate = this.handleDuplicate.bind(this);
  }

  /**
   * Flips the Stylesheet card.
   */
  handleFlipCard = (e) => {
    e.stopPropagation();
    this.setState({flipCard: !this.state.flipCard,});
  }

  /**
   * Renders each color palette and its information.
   * @param {string} borderColor 
   */
  renderColorInfo(borderColor) {
    return (this.props.colors.map((data, index) => {
      return (<GalleryCardColorInfo key={this.props.data + "" + index} 
        hex ={data}
        borderColor={borderColor}/>) })
    );
  }

  /**
   * Transforms data so it can be made a duplicate.
   */
  handleDuplicate() {
    let data ={};
    data["body"] = this.props.body;
    data["title"] = this.props.title;
    data["colors"] = this.props.colors;
    data["background"] = this.props.background;
    this.props.handleCreateStylesheet(data);
  }

  /**
   * Opens shared stylesheet in a new tab.
   * @param {String} workspaceId 
   * @param {String} stylesheetId 
   */
  openInNewTab(workspaceId, stylesheetId) {
    let url = "/share/" + workspaceId +"/" + stylesheetId;
    var win = window.open(url, '_blank');
    if (win != null) {
      win.focus();
    }
  }

  render() {

    let select = this.props.isSelected["background"] ? "select" : "";

    let colors = {
      title: this.props.colors[this.props.title.color],
      background: this.props.colors[this.props.background],
      body: this.props.colors[this.props.body.color]
    };

    let adjustedColor = 'white';
    if (tinycolor(colors.background).getLuminance() > 0.5) {
      adjustedColor = '#343436';
    }

    let header =  <div className="stylesheet__icon-header">
                      <FontAwesomeIcon style={{color: colors.title}} icon={faInfoCircle} onClick={(e) => this.handleFlipCard(e)} />
                  </div>

    let front =  <div className={`stylesheet__content stylesheet__content--${select}`} style={{background: colors.background}}
                    onClick={(e) => {this.props.handleNodeSelection("background")}}>
                        {header}
                        <StylesheetNode 
                            color={colors.title} 
                            size={this.props.title.size} 
                            font={this.props.title.font}
                            text={this.props.title.text}
                            style={this.props.title.style}
                            alignment={this.props.title.alignment}
                            handleNodeSelection={this.props.handleNodeSelection}
                            handleFontChange={this.props.handleFontChange}
                            id={this.props.id}
                            key={this.props.id.concat(" title")}
                            type="title"
                            isSelected={this.props.isSelected["title"]}/>
                        <StylesheetNode 
                            color={colors.body}
                            size={this.props.body.size} 
                            font={this.props.body.font}
                            text={this.props.body.text}
                            style={this.props.body.style}
                            handleFontChange={this.props.handleFontChange}
                            id={this.props.id}
                            key={this.props.id.concat(" body")}
                            alignment={this.props.body.alignment}
                            type="body"
                            handleNodeSelection={this.props.handleNodeSelection}
                            isSelected={this.props.isSelected["body"]} />
                    </div>


      let back =  <div className={`stylesheet__content stylesheet__content`} id={`preview-${this.props.id}`} style={{background: colors.background}}>
                    {header}
                  <div className="stylesheet__screenshot" style={{background: colors.background}} >
                    <div className="stylesheet__info" style={{background: colors.background, color: adjustedColor}}>
                        <div className="fonts-info" style={{background: colors.background}}>
                            <span style={{fontWeight: 'bold'}}>Fonts</span>
                            <div className="font-label"> 
                              <span style={{textDecoration: 'underline'}}> Header </span> 

                              <div className="font-name-size">
                                <span style={{fontFamily: this.props.title.font, color: colors.title}}> {this.props.title.font} </span>
                                {this.props.title.size}
                              </div>
                            </div>
                          
                            <div className="font-label">
                              <span style={{textDecoration: 'underline'}}> Body </span> 

                              <div className="font-name-size">
                                <span style={{fontFamily: this.props.body.font, color: colors.body}}>  {this.props.body.font} </span>
                                {this.props.body.size}
                              </div>
                            </div>
                        </div>

                      <div className="colors-info">
                        <span style={{fontWeight: 'bold'}}> Colors </span>
                        <div className="color-name-size">
                            {this.renderColorInfo(adjustedColor)}
                        </div>
                      </div>
                      </div>

                      <div className="stylesheet__info__footer">
                        <Button background={colors.title} color={colors.background} onClick={(e) => {this.openInNewTab(this.props.workspaceId, this.props.id);}} text="Share" />
                        <Button background={colors.title} color={colors.background} onClick={this.handleDuplicate} text="Duplicate" />
                        <Button background={colors.title} color={colors.background} onClick={(e) => {this.props.handleDeleteStylesheet(this.props.id)}} text="Delete" />

                      </div>
                    </div>
                </div>
    
    return (
      <ReactCardFlip isFlipped={this.state.flipCard} flipDirection="horizontal">
        {front}
        {back}
      </ReactCardFlip>
    );
  }
}

StylesheetPreview.propTypes = {
    // id
    id: PropTypes.string.isRequired,
    // background color in hex
    background: PropTypes.number,
    // dictionary of title info
    title: PropTypes.object,
    // dictionary of body info
    body: PropTypes.object,
    // callback when you click on node
    handleNodeSelection: PropTypes.func,
    // dictionary indicating if the node is selected
    isSelected: PropTypes.object,
    // colors in the palette
    colors: PropTypes.array,
    // callback to delete stylesheet
    handleDeleteStylesheet: PropTypes.func,
    // callback to create stylesheet
    handleCreateStylesheet: PropTypes.func,
};

StylesheetPreview.defaultProps = {
    titleText: "Lorem Ipsum",
    bodyFontSize: "12px",
    titleFontSize: "14px"
};

export default StylesheetPreview;