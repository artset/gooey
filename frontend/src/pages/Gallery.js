import React from 'react';

import './Gallery.scss';
import GalleryCard from '../components/GalleryCard.js';
import Accordion from '../components/Accordion.js';
import Banner from '../components/Banner.js';
import Loader from '../components/Loader.js'
import { faRecycle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tooltip from "reactjs-popup";
import Popup from "reactjs-popup";
import API from '../constants.js';

/**
 * Component that renders the Gallery of a workspace.
 */
class Gallery extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bodyFont: "any body font",
            headerFont: "any header font",
            search: "",
            data: null, // null
            uid: "",
            recentWorkspaces: null,
            ifLoading: true,
        };
        this.getGalleryCardsJSON();
        this.handleBodyFont = this.handleBodyFont.bind(this);
        this.handleHeaderFont = this.handleHeaderFont.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.generateNewCards = this.generateNewCards.bind(this);
        this.handleFavorite = this.handleFavorite.bind(this);
        this.visuallyHandleFavorite = this.visuallyHandleFavorite.bind(this);
    }

    /**
     * Function that updates displayed gallery cards based on current workspaceId.
     * @param {*} prevProps - the props of the previous Gallery component
     */
    componentDidUpdate(prevProps) {
        if (prevProps === null || prevProps.workspaceId !== this.props.workspaceId) {
            this.getGalleryCardsJSON();
            this.setState({ifLoading: true});
        }
    }

    /**
     * Function that handles updating the "heard" icon of each gallery card.
     * @param {*} id - the id of the gallery vard
     */
    visuallyHandleFavorite(id) {
        let newData = this.state.data;
        let bool = newData[id]["heart"] ? false : true;
        newData[id]["heart"] = bool;
        this.setState({ data: newData });
    }

    /**
     * This function adds all the favorites to a list. It is passed into each gallery card.
     * @param {*} id - the id of the gallery card
     * @param {*} workspaceId - the id of the current workspace
     */
    handleFavorite(id, workspaceId) {
        var cardId = id;
        let data = {
            "cardId": cardId,
        };
        fetch(API + "/gallery/heart/" + workspaceId, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
            .then(response => response.json())
            .then(result => this.visuallyHandleFavorite(id));
    }
    
    /**
     * Function used to delete a gallery card from a workspace.
     * @param {*} id - the id of a gallery card
     * @param {*} workspaceId - the id of the current workspace
     */
    deleteCard(id, workspaceId) {
        let data = {
            "cardId": id,
        };
        fetch(API + "/gallery/delete/" + workspaceId, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
            .then(response => response.json());
    }

    /**
     * Function that changes the state of bodyFont.
     * @param {*} bodyFont - the font of the body
     */
    handleBodyFont(bodyFont) {
        this.setState({ bodyFont: bodyFont });
    }

    /**
     * Function that changes the state of headerFont
     * @param {*} headerFont - the font of the header
     */
    handleHeaderFont = (headerFont) => {
        this.setState({ headerFont: headerFont });
    }

    /**
     * Function that handles the user typing in the search bar.
     * @param {*} e - the event that a user is typing
     */
    handleSearch(e) {
        this.setState({
            search: e.target.value
        });
    }

    /**
     * Function that fetches the user's gallery cards from the database.
     */
    getGalleryCardsJSON() {
        let workspaceId = this.props.workspaceId

        fetch(API + "/gallery/load/" + workspaceId, {
            method: "GET",
            headers: { 'Content-Type': 'application/json' }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success && JSON.stringify(data.galleryCards) !== JSON.stringify(this.state.data)) {
                    this.setState({ data: data.galleryCards, ifLoading: false});
                }
            });
    }


    /**
     * Function that renders the gallery cards.
     */
    renderCards() {

        let colors = ["red", "orange", "yellow", "green", "blue", "grey", "purple", "brown", "black", "white"];
        let fun = ["strawberry", "mango", "lemon", "lime", "fog", "lilac", "purple", "chocolate", "licorice", "snow"];
        if (this.state.data == null || Object.keys(this.state.data).length < 30) {
            return <div className="gallery__loader"><Loader message={true} /></div>;
        } else {
            let cards = this.state.data;
            return (Object.keys(this.state.data).filter(id => {
                let color1 = cards[id].colors.labels[0];
                let color2 = cards[id].colors.labels[1];

                let fun1 = cards[id].colors.fun[0];
                let fun2 = cards[id].colors.fun[1];

                let header = cards[id].title.type;
                let body = cards[id].body.type;

                let favorite = cards[id].heart;


                // check valid body
                let validBody = false;
                if (this.state.bodyFont === "any body font") {
                    validBody = true;
                } else {
                    let bodyFontType = this.state.bodyFont.split(" ")[0];
                    validBody = bodyFontType === body;
                }
                if (!validBody) return false;

                // check valid header
                let validHeader = false;
                if (this.state.headerFont === "any header font") {
                    validHeader = true;
                } else {
                    let headerFontType = this.state.headerFont.split(" ")[0];
                    validHeader = headerFontType === header;
                }
                if (!validHeader) return false;

                // check valid search keyword
                if (this.state.search.length > 1) {
                    if (colors.indexOf(this.state.search) > -1) { // if it is a valid color in search, do the filter
                
                        if (color1 !== this.state.search && color2 !== this.state.search) {
                            return false;
                        } 
                    } else if (fun.indexOf(this.state.search) > -1) {
                        if (fun1 !== this.state.search && fun2 !== this.state.search) {
                            return false;
                        }

                    } else if (this.state.search === "favorite") {
                        if (!favorite) {
                            return false;
                        }
                    }
                }
                
                return true;
                }).map((data) => {
                    return (<GalleryCard
                        workspaceId={this.props.workspaceId}
                        id={data}
                        key={data}
                        data={cards[data]}
                        favoriteHandler={this.handleFavorite}
                        heart={cards[data]["heart"]}
                        deleteHandler={this.deleteCard} />)
                })
            );
        }
    }

    /**
     * Function that causes the color palette to generate new colors, and therefore display new cards.
     */
    generateNewCards() {
        let workspaceId = this.props.workspaceId;
        // in the case that we are not loading our page, we can call the function
        if (this.state.ifLoading === false) {
            this.setState({ifLoading: true})
                    //get the generated cards in json format from the backend
            fetch(API + "/gallery/refresh/" + workspaceId, {
                method: "GET",
                headers: { 'Content-Type': 'application/json' }
            })
                .then(response => response.json())
                .then(result => {
                    if (result.success && JSON.stringify(result.data) !== JSON.stringify(this.state.data)) {
                        this.setState({ data: result.data, ifLoading: false});
                    }
                }
                );
        }
    }

    render() {
        // don't call this function below if you don't want to generate cards from the db!
        let cards ="";
        if (this.state.data === null || this.state.data.length === 0 || cards.length === 0) {
            cards = <Banner type="normal" text="No cards found." />
        }
        cards = this.renderCards();

        let button = <button onClick={this.generateNewCards} className="button button--active"> <FontAwesomeIcon icon={faRecycle} /></button>;

        if (this.state.ifLoading) {
            cards = <div className="gallery__loader"><Loader message={true} /></div>
            button = <button className="button button--inactive"> 
            <FontAwesomeIcon icon={faRecycle} /></button>;
        }

        
        return (
                <div className="content gallery">

                    <div className="gallery__search">

                        <Popup
                            trigger={<input type="text" autoComplete="off" id="search" name="search" placeholder="Search"
                                onChange={e => { this.handleSearch(e) }} />}
                            on="focus"
                            position="bottom left"
                            closeOnDocumentClick
                        >
                            <div class="gallery__search__info">

                                <div class="gallery__search__info__section">
                                    <b>FILTER BY</b>
                                </div>

                                <div class="gallery__search__info__section">
                                    <b>COLORS:</b> red, orange, yellow, green, blue, purple, brown, white, black, grey
                        </div>

                                <div class="gallery__search__info__section">
                                    <b>FUN:</b> strawberry, mango, lemon, lime, blueberry, lilac, chocolate, snow, licorice, fog
                        </div>

                                <div class="gallery__search__info__section">
                                    <b>FAVORITE</b>
                                </div>
                            </div>
                        </Popup>



                        <div className="accordion--gallery">
                            <Accordion id="search--header" title={this.state.headerFont}
                                values={['any header font', 'serif header', 'sans-serif header', 'monospace header']}
                                onClick={this.handleHeaderFont}>
                            </Accordion>
                        </div>


                        <div className="accordion--gallery">
                            <Accordion id="search--body" title={this.state.bodyFont}
                                values={['any body font', 'serif body', 'sans-serif body', 'monospace body']}
                                onClick={this.handleBodyFont}>
                            </Accordion>
                        </div>



                        <Tooltip
                            trigger={button}
                            position="right bottom"
                            on="hover"
                        >
                            <span> Generate new cards!</span>
                        </Tooltip>

                    </div>

                    <div className="gallery__results">
                        {cards}
                    </div>
                </div>
        );
    }

}

export default Gallery;