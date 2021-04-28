import React from 'react';

import API from '../constants.js';
import Button from '../components/Button.js';
import Stylesheet from '../components/Stylesheet.js';
import StylesheetFavoriteCard from '../components/StylesheetFavoriteCard.js';
import Loader from '../components/Loader.js';
import { cloneDeep } from "lodash";
import "./StylesheetPage.scss";

/**
 * The Stylesheet page is part of the workspace component and renders
 * all the stylesheets.
 */
class StylesheetPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stylesheets: null,
            favorites: null,
            ifStylesheetLoading: true,
            ifFavoriteLoading: true
        }
        this.getFavorites();
        this.loadStyleSheets();
        this.handleCreateStylesheet = this.handleCreateStylesheet.bind(this);
        this.handleDeleteStylesheet = this.handleDeleteStylesheet.bind(this);
        this.handlePaletteColorChange = this.handlePaletteColorChange.bind(this);
        this.handleDeletePaletteColor = this.handleDeletePaletteColor.bind(this);
        this.handleAddPaletteColor = this.handleAddPaletteColor.bind(this);
        this.handleNodeColorChange = this.handleNodeColorChange.bind(this);
        this.handleFontChange = this.handleFontChange.bind(this);
    }

    /**
     * Handles a change visually when the color palette is changed.
     * id: stylesheet id
     * color: string that indicates the new color
     * index: the index in which the color has changed.
     */
    handlePaletteColorChange(id, color, index) {
        let newData = this.state.stylesheets;
        let newColor = this.state.stylesheets[id].colors;
        newColor[index] = color;
        newData[id]["colors"] = newColor;
        this.setState({ stylesheets: newData });
    }

    /**
     * Visually changes the favorite section so a card gets deleted.
     * Also updates it in the database.
     * id: stylesheet id
     */
    deleteFavoriteCard = (id) => {
        var cardId = id;
        let data = {
            "cardId": cardId,
        };
        fetch(API + "/gallery/heart/" + this.props.workspaceId, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
            .then(response => response.json())
            .then(result => {
                let newFavorites = this.state.favorites;
                delete newFavorites[id];
                this.setState({favorites: newFavorites});
            });
    }

    /**
     * Deletes a palette color from the stylesheet.
     * id: stylesheet id
     * index: the palette color that's being deleted
     */
    handleDeletePaletteColor(id, index) {
        let allStylesheets = this.state.stylesheets;

        let data = allStylesheets[id];

        if (data["background"] >= index && index !== 0) {
            data["background"] -= 1;
        }

        if (data["title"]["color"] >= index && index !== 0) {
            data["title"]["color"] = data["title"]["color"] - 1;
        }
        if (data["body"]["color"] >= index && index !== 0) {
            data["body"]["color"] = data["body"]["color"] - 1;
        }
        data["colors"].splice(index, 1);
        this.setState(
            { stylesheets: allStylesheets }
        );
    }

    /**
     * Adds a palette color from the stylesheet.
     * The default color will be grey.
     * id: stylesheet id
     */
    handleAddPaletteColor(id) {
        let allStylesheets = this.state.stylesheets;
        let data = allStylesheets[id];
        if (data.colors.length <= 4) {
            let newColors = data.colors;
            newColors.push("#CCCCCC");
            data.colors = newColors;
            this.setState({stylesheets: allStylesheets});
            let index = newColors.length - 1;

            let dbData = {'id': id, 'color': "#CCCCCC", 'index': index};

            fetch(API + "/stylesheets/addPaletteColor/" + this.props.workspaceId, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dbData),
            })
                .then(response => response.json())
            }
    }
    
    /**
     * Changes the color of a node from the styleshet.
     * id: styleshet id
     * node: one of type: background, title, body
     * index: the color index that the node is now being mapped to 
     */
    handleNodeColorChange(id, node, index) {
        let allStylesheets = this.state.stylesheets;

        if (node === "background") {
            allStylesheets[id]["background"] = index;
        } else {
            allStylesheets[id][node]["color"] = index
        }
        this.setState({stylesheets: allStylesheets});
    }

    /**
     * handles a new font change
     * id: stylesheet id
     * node: the type (title, body)
     * type: type of change (size, font style, font family)
     * newInfo: the new information (ex. 12px, bold, Inconsolata)
     */
    handleFontChange(id, node, type, newInfo) {
        let allStylesheets = this.state.stylesheets;
        let data = allStylesheets[id];
        data[node][type] = newInfo;
        this.setState({stylesheets: allStylesheets});
    }

    /**
     * Gets the favorites to render at the top of the card.
     */
    getFavorites() {
        this.setState({ifFavoriteLoading: true});
        var workspaceId = this.props.workspaceId
        fetch(API + "/stylesheets/loadFavorites/" + workspaceId , {
            method: "GET",
            headers: {'Content-Type': 'application/json'}
        })
            .then(response=> response.json())
            .then(data =>
            {
                if (data.success && JSON.stringify(data.favorites) !== JSON.stringify(this.state.favorites)) {
                    this.setState({ifFavoriteLoading: false, favorites : data.favorites});
                }
            });
    }

    /**
     * Renders the favorited cards.
     */
    renderFavorites() {
        if (this.state.favorites !== null) {
            let numFavorites = Object.keys(this.state.favorites).length;
            let max = numFavorites > 30 ? 30 : numFavorites;
            if (numFavorites > 0) {
                return (Object.keys(this.state.favorites).slice(0, max).map((key) => {
                        return (<StylesheetFavoriteCard
                            colors={this.state.favorites[key].colors.hex}
                            title={this.state.favorites[key].title}
                            body={this.state.favorites[key].body}
                            key={key}
                            id={key}
                            deleteFavoriteCard={this.deleteFavoriteCard}
                            background={this.state.favorites[key].background}
                            handleCreateStylesheet={this.handleCreateStylesheet} />)
                    })
                );
            }
        } 
        return <div className="stylesheet__favorites__txt">No favorites yet.</div>;
    
    }

    /**
     * Loads the stylesheets from the database.
     */
    loadStyleSheets() {
        let workspaceId = this.props.workspaceId
        fetch(API + "/stylesheets/load/" + workspaceId, {
            method: "GET",
            headers: { 'Content-Type': 'application/json' }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success && JSON.stringify(data.stylesheets) !== JSON.stringify(this.state.stylesheets)) {
                    this.setState({ stylesheets: data.stylesheets, ifStylesheetLoading: false });
                }
            });
    }

    /**
     * Renders the stylesheets by time created.
     */
    sortStylesheets = (a, b) => {
        let a_date = Date.parse(this.state.stylesheets[a].date);
        let b_date = Date.parse(this.state.stylesheets[b].date);
   
        return b_date - a_date;
    }

    /**
     * Renders the stylesheet from the database.
     */
    renderStyleSheets() {
        if (this.state.stylesheets !== null) {
            if (Object.keys(this.state.stylesheets).length > 0) {
                return (Object.keys(this.state.stylesheets).sort(this.sortStylesheets).map((key) => {
                        return (<Stylesheet
                            data={this.state.stylesheets[key]}
                            key={key}
                            id={key}
                            handleFontChange={this.handleFontChange}
                            handlePaletteColorChange={this.handlePaletteColorChange}
                            handleDeletePaletteColor={this.handleDeletePaletteColor}
                            handleAddPaletteColor={this.handleAddPaletteColor}
                            handleNodeColorChange={this.handleNodeColorChange}
                            workspaceId={this.props.workspaceId}
                            handleCreateStylesheet={this.handleCreateStylesheet}
                            handleShareStylesheet={this.props.goShare}
                            handleDeleteStylesheet={this.handleDeleteStylesheet}/>)
                    })
                );
            }
        }
        return "No stylesheets. Make one!";
    }

    /**
     * Handles deletion of stylesheet from state and database.
     * id: stylesheet id 
     */
    handleDeleteStylesheet(id) {
        let newData = this.state.stylesheets;
        delete newData[id];
        this.setState({stylesheets: newData});
        let data = {'id': id};
        fetch(API + "/stylesheets/delete/" + this.props.workspaceId, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
            .then(response => response.json());
    }

    /**
     * Handles creation of stylesheet to db and visually
     * newStylesheetData: the data of the stylesheet, this is used if 
     * this function is called from the favorites card, or from duplicate.
     */
    handleCreateStylesheet(newStylesheetData) {
        let date = new Date().toLocaleString();
        let stylesheetData = null;

        if (newStylesheetData === null) {
            stylesheetData = {
                "background": 0,
                "body":
                {
                    "color": 1,
                    "font": "Inconsolata",
                    "size": "12px",
                    "alignment": "left",
                    "style": "Regular",
                    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                },
                "title":
                {
                    "color": 1,
                    "font": "Inconsolata",
                    "size": "16px",
                    "alignment": "left",
                    "style": "Regular",
                    "text": "Lorem Ipsum"
                },
                "colors": ["#CCCCCC", "#888888"],
                "name": "Untitled",
            }

        } else {
            stylesheetData = cloneDeep(newStylesheetData);
        }
        stylesheetData['date'] = date;
        stylesheetData['name'] = 'Untitled';

        fetch(API + "/stylesheets/add/" + this.props.workspaceId, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stylesheetData),
        })
            .then(response => response.json())
            .then(result => { if (result.success){
                let newState = this.state.stylesheets;
                newState[result.id] = stylesheetData;
                this.setState({ stylesheets: newState });
                }}
            );
    }


    render() {
            let favorites = this.renderFavorites();

            let stylesheets = this.renderStyleSheets();

            if (this.state.ifStylesheetLoading) {
                stylesheets = <div class="stylesheet__content__loader"><Loader message={true} /></div>
            }
            if (this.state.ifFavoriteLoading) {
                favorites = <div class="stylesheet__favorites__loader"><Loader message={true} /></div>
            }

            return (
                <div className="stylesheet">
                    <div className="stylesheet__header">
                        <Button onClick={(e) => {this.handleCreateStylesheet(null)}} text="Create new stylesheet" />
                    </div>

                    <div className="stylesheet__favorites">
                        <div className="stylesheet__favorites__title">Favorites</div>


                        <div className="stylesheet__favorites__container">
                            {favorites}
                        </div>
                    </div>

                    <div className="content">
                        {stylesheets}
                    </div>
                </div>
            );
    }
}

export default StylesheetPage;