import React from 'react';
import PropTypes from 'prop-types';
import Accordion from './Accordion.js';
import StylesheetDrawerPaletteBox from './StylesheetDrawerPaletteBox.js';
import fonts from '../data/font/font_data.json';


/**
 * The stylesheet drawer is used for the user to update their stylesheet
 * with their own customizatins, such as adding more colors, changing
 * fonts, etc.
 * This is contained in the Stylesheet component.
 */
class StylesheetDrawer extends React.Component {
    constructor(props) {
        super(props);
        this.handleFontAccordion = this.handleFontAccordion.bind(this);
        this.handleStyleAccordion = this.handleStyleAccordion.bind(this);
        this.handleSizeAccordion = this.handleSizeAccordion.bind(this);
        this.size= [ "10px", "12px", "14px", "16px", "18px", "24px", "36px"];
        this.fontDict = fonts;
        this.fontNames = Object.keys(this.fontDict);

        // this.state = {
        //     selectedFont: this.props.fontData["font"],
        // }
    }


    // renders the Palette section of the drawer. This is where a user can choose colors to apply to a node.
    renderPaletteBoxes() {
      return (this.props.colors.map((data, index) => {
       let isSelected = index === this.props.selectedColor ? true : false;
        return (
        <div style={{margin: "15px 10px 10px 0px"}} >
          <StylesheetDrawerPaletteBox 
            background={data}
            key={this.props.id + "" + index}
            id={this.props.id + "" + index}
            index={index}
            type={this.props.type}
            handleNodeColorChange={this.props.handleNodeColorChange}
            isSelected={isSelected}
            width="30px"
            height="30px"/>
        </div>
        )}));
    }

    // these are wrapper functions, that get what is clicked
    // in the accordion and passes the proper parameters
    // into the call back functions in the Stylesheet component.
    // Very unfortunate that we cannot refactor them out.
    handleFontAccordion(selectedOption) {
        this.props.handleFontChange(this.props.type, "font", selectedOption);
    }

    handleStyleAccordion(selectedOption) {
        this.props.handleFontChange(this.props.type, "style", selectedOption);
    }

    handleSizeAccordion(selectedOption) {
        this.props.handleFontChange(this.props.type, "size", selectedOption);
    }

    getFontStyles() {
        return this.fontDict[this.props.fontData["font"]]["style"];
    }


    render() {
        // this bit is the text section with the accordions. This will render if it's a title or body node selected.
        let text = "";
        if (this.props.type === "body" || this.props.type === "title") {
            text = 
            <div className="stylesheet__drawer__col">
                    <div className="stylesheet__drawer__col__title">
                        Text
                </div>

                    <div className="stylesheet__drawer__col__settings">
                        <div className="stylesheet__drawer__col__settings__item">
                            <Accordion id="search--header" title={this.props.fontData.font} 
                                values={this.fontNames}
                                onClick={this.handleFontAccordion}
                                ifOpenAbove={true} />
                            <div className="stylesheet__drawer__col__settings__item__caption">
                                Font family
                            </div>
                        </div>

                        <div className="stylesheet__drawer__col__settings__item">
                            <Accordion 
                                id="search--header"
                                title={this.props.fontData.style}
                                values={this.getFontStyles()}
                                onClick={this.handleStyleAccordion}
                                ifOpenAbove={true} />
                            <div className="stylesheet__drawer__col__settings__item__caption">
                                Style
                            </div>
                        </div>

                        <div className="stylesheet__drawer__col__settings__item">
                            <Accordion 
                                id="search--header" 
                                title={this.props.fontData.size}
                                values={this.size}
                                onClick={this.handleSizeAccordion} 
                                size="small"
                                ifOpenAbove={true}/>
                            <div className="stylesheet__drawer__col__settings__item__caption">
                                Size
                            </div>
                        </div>

                    </div>
                </div>;
        }

        return (
            <div className="stylesheet__drawer">

                <div className="stylesheet__drawer__col">
                    <div className="stylesheet__drawer__col__title">
                        Palette
                        <div className="stylesheet__drawer__col__palette">
                            {this.renderPaletteBoxes()}
                        </div>

                    </div>
                </div>

                {text}
            </div>
        );
    }
}


StylesheetDrawer.propTypes = {
    // id of stylesheet. propogates down to all components concerning this stylesheet.
    id: PropTypes.string,
    // list of colors
    colors: PropTypes.array,
    // callback function to apply a change of color to the selected node
    handleNodeColorChange: PropTypes.func,
    // callback function to handle any font changes with the selected node
    handleFontChange: PropTypes.func,
    // the node that the drawer is associated with
    type: PropTypes.oneOf(["body", "title", "background"]),
    // the color that's selected (index)
    selectedColor: PropTypes.number,
    // current font information for the selected node. This includes font size, style, and font family.
    // ex: {color: 2, font: "Quattrocento Sans", size: "12px", alignment: "left", style: "regular"}
    fontData: PropTypes.object,
    

};

export default StylesheetDrawer;