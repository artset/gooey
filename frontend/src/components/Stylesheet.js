import React from 'react';
import PropTypes from 'prop-types';
import StylesheetPreview from './StylesheetPreview.js';
import StylesheetDrawer from './StylesheetDrawer.js';
import PaletteSlider from './PaletteSlider.js';
import Button from './Button.js';
import PopUp from './PopUp.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import './Stylesheet.scss';
import API from '../constants.js'
/**
 * The stylesheet component is the card that exists in the
 * stylesheet page. It contains a palette, the preview section, where
 * the user can toggle options such as color and text, and a drawer
 * that pops up when a user clicks on a text node.
 */
class Stylesheet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: this.props.data.name,
            changeName: this.props.data.name,
            title: this.props.data.title,
            body: this.props.data.body,
            isSelected: {
                "body": false, "title": false, "background": false
            },
            popup: false,
        };
        this.handlePaletteColorChange = this.handlePaletteColorChange.bind(this);
        this.handleDeletePaletteColor = this.handleDeletePaletteColor.bind(this);
        this.handleNodeColorChange = this.handleNodeColorChange.bind(this);
        this.handleNodeSelection = this.handleNodeSelection.bind(this);
        this.handleFontChange = this.handleFontChange.bind(this);
        this.handleClick = this.handleClick.bind(this);

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    // begins a listener for if the user clicks on a text node
    componentWillMount() {
        document.addEventListener('mouseup', this.handleClick, false);
    }

    componentWillUnmount() {
        document.removeEventListener('mouseup', this.handleClick, false);
    }

    // these methods are to control the modal to change the name of the stylesheet.
    openModal() {
        this.setState({ popup: true });

    }

    closeModal() {
        this.setState({ popup: false });
    }

    /**
     * the following two functions handle changing a stylesheet name.
    */
     handleNameChange = (e) => {
        this.setState({ changeName: e.target.value });
    }

    /**
     * Calls database to change stylesheet name.
    */
    saveChanges = () => {
        this.setState({ name: this.state.changeName });
        let data = {'id': this.props.id, 'name': this.state.changeName};
        fetch(API + "/stylesheets/updateName/" + this.props.workspaceId, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
            .then(response => response.json());
        this.closeModal();
    }

    /**
     * This handles click when nodes are selected, and unselects them when the outside is clicked
    */
   handleClick = (e) => {
        if (!this.node.contains(e.target)) {
            this.setState({ isSelected: { "body": false, "title": false } });
        }
    }


    /**
     *  Opens the proper drawer for the node selected
     *  node: either a title, body, or background
     */
    handleNodeSelection(node) {
        let selected = this.state.isSelected;
        if (node === "title") {
            selected["title"] = selected["title"] ? false : true;
            selected["body"] = false;
            selected["background"] = false;
        } else if (node === "body") {
            selected["body"] = selected["body"] ? false : true;
            selected["title"] = false;
            selected["background"] = false;
        } else {
            selected["background"] = selected["background"] ? false : true;
            selected["title"] = false;
            selected["body"] = false;
        }
        this.setState({ isSelected: selected });
    }

    /**
     * updates the color of a node, depending on which node it is
    */
    handleNodeColorChange(node, index) {
        let data = {'id': this.props.id, 'node': node, 'index': index};
        fetch(API +"/stylesheets/updateNodeColor/" + this.props.workspaceId, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
            .then(response => response.json())
            .then(result => this.props.handleNodeColorChange(this.props.id, node, index)
            );
    }

    /**
     * Updates palette change.
    */
    handlePaletteColorChange(color, index) {
        let data = {'id': this.props.id, 'color': color, 'index': index};
        fetch(API + "/stylesheets/updatePalette/" + this.props.workspaceId, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
            .then(response => response.json())
            .then(result => this.props.handlePaletteColorChange(this.props.id, color, index)
            );
    }

    /**
     * Updates palete deletion.
    */
    handleDeletePaletteColor(index) {
        let delete_data = {'id': this.props.id, 'index': index};
        fetch(API + "/stylesheets/deletePaletteColor/" + this.props.workspaceId, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(delete_data),
        })
            .then(response => response.json())
            .then(result => this.props.handleDeletePaletteColor(this.props.id, index));

    }

    /**
     * handles a new font change
     * id: stylesheet id
     * node: the type (title, body)
     * type: type of change (size, font style, font family)
     * newInfo: the new information (ex. 12px, bold, Inconsolata)
     */
    handleFontChange(node, type, newInfo) {
        let data = {'id': this.props.id, 'node': node, 'type': type, 'update': newInfo};
        fetch(API + "/stylesheets/updateFont/" + this.props.workspaceId, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
            .then(response => response.json())
            .then(result => this.props.handleFontChange(this.props.id, node, type, newInfo)
            );
    }

    render() {
        // variables for determining which drawer will appear.
        let drawer = "";
        let type = "";
        let selectedColor = "";
        let fontData = "";
        let showDrawer = false;

        if (this.state.isSelected["body"]) {
            type = "body";
            fontData = this.props.data.body;
            selectedColor = this.props.data.body.color;
            showDrawer = true;
        } else if (this.state.isSelected["title"]) {
            type = "title";
            fontData = this.props.data.title;
            selectedColor = this.props.data.title.color;
            showDrawer = true;
        } else if (this.state.isSelected["background"]) {
            type = "background";
            selectedColor = this.props.data.background;
            showDrawer = true;
        }

        if (showDrawer) {
            let drawerID = this.props.id + type;
            drawer = <StylesheetDrawer
                colors={this.props.data.colors}
                type={type}
                selectedColor={selectedColor}
                id={drawerID}
                key={drawerID}
                fontData={fontData}
                handleNodeColorChange={this.handleNodeColorChange}
                handleFontChange={this.handleFontChange} />;
        }

        let canDeleteColors = this.props.data.colors.length >= 3 ? true : false;

        let ifActive = this.props.data.colors.length <= 4 ? true : false;
        return (
            <div className={`stylesheet__card`} id={`stylesheet-${this.props.id}`} ref={node => this.node = node} key={this.props.id}>
                <PaletteSlider
                    colors={this.props.data.colors}
                    id={this.props.id}
                    key={this.props.id}
                    canDeleteColors={canDeleteColors}
                    handlePaletteColorChange={this.handlePaletteColorChange}
                    handleDeletePaletteColor={this.handleDeletePaletteColor} />
                <StylesheetPreview
                    background={this.props.data.background}
                    title={this.props.data.title}
                    body={this.props.data.body}
                    colors={this.props.data.colors}
                    isSelected={this.state.isSelected}
                    handleNodeSelection={this.handleNodeSelection}
                    handleFontChange={this.handleFontChange}
                    id={this.props.id}
                    workspaceId={this.props.workspaceId}
                    handleDeleteStylesheet={this.props.handleDeleteStylesheet}
                    handleCreateStylesheet={this.props.handleCreateStylesheet}
                />
                {drawer}
                <div className="stylesheet__bottom">
                    <Button
                        size="large"
                        onClick={e=> {this.props.handleAddPaletteColor(this.props.id)}}
                        background="#cccccc"
                        color="#000000"
                        disabled={!ifActive}
                        text="+" />

                    <div className="stylesheet__title">
                        {this.state.name}
                        <PopUp button={<FontAwesomeIcon onClick={this.openModal} icon={faPen} style={{ fontSize: '13px' }} />} type="edit" background="none" color="#a4a4a4" open={this.state.popup}>
                            <div className="popup__header"> Change the name of your stylesheet </div>

                            <label htmlFor="workspace_name"></label>
                            <input type="text" id="workspace_name" value={this.state.changeName}
                                onChange={e => { this.handleNameChange(e) }} name="stylesheet_name" required minLength="4" maxLength="20"></input>
                            <Button onClick={this.saveChanges} text="Save" />
                        </PopUp>
                    </div>

                </div>
            </div>
        );
    }
}


Stylesheet.propTypes = {
    // data that packages all the colors, fonts, etc. from the database
    data: PropTypes.object,
    // Stylesheet ID, also the key of the database.
    id: PropTypes.string,
    // callback to delete a stylesheet
    handleDeleteStylesheet: PropTypes.func,
    // callback to create a stylesheet
    handleCreateStylesheet: PropTypes.func,
    // title of stylesheet
    name: PropTypes.string,
    // handler to share a styleshs
    handleShareStylesheet: PropTypes.func,
};

Stylesheet.defaultProps = {
    name: "Untitled"
}

export default Stylesheet;
