import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import PopUp from './PopUp.js';
import EmojiPicker from './EmojiPicker.js';
import Tooltip from "reactjs-popup";
import Button from './Button.js';
import './WorkspaceCard.scss';
import API from '../constants.js';

/**
 * The Workspace card is the card used in the Dashboard. It renders
 * a single workspace and allows the user to change the name,
 * emoji, and description.
 */
class WorkspaceCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      emoji: this.props.emoji,
      title: this.props.title,
      description: this.props.description,
      date: this.props.date,

      changeEmoji: this.props.emoji,
      changeTitle: this.props.title,
      changeDescription: this.props.description,

      popup: false,
    }

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  /**
   * Function that sets the state of changeEmoji to the emoji that the user picked.
   * params: emoji - the emoji that the user picked
   *         event - the event of the user clicking
   */
  setEmoji = (emoji, event) => {
    this.setState({ changeEmoji: emoji.native })
  }

    /**
   * Function that opens a model.
   */
  openModal() {
    this.setState({popup: true});
  }

  /**
   * Function that closes a model.
   */
  closeModal() {
    this.setState({popup: false});
  }

  /**
   * Function that sets the state of changeDescription to the description the user typed.
   * params: e - the event of the user typing
   */
  handleDescription(e) {
    this.setState({changeDescription: e.target.value});
  }

    /**
   * Function that sets the state of changeTitle to the title the user typed.
   * params: e - the event of the user typing
   */
  handleTitle(e) {
    this.setState({changeTitle: e.target.value});
  }

  /*
   * Function Actually applies all of the changes that the user made,
   * when the user clicks the 'Save' button.
   */
  saveChanges = () => {

    let data = {"id": this.props.id, "emoji": this.state.changeEmoji,
        "description": this.state.changeDescription, "title": this.state.changeTitle}
      fetch(API + "/dashboard/update", {
          method: "POST",
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(data),
      })
          .then(response=> response.json())
          .then(this.setState({
            emoji: this.state.changeEmoji,
            title: this.state.changeTitle,
            description: this.state.changeDescription}))
          .then(this.closeModal) ;

  }

  render() {

    let button = <FontAwesomeIcon icon={faPen} onClick={this.openModal}/>

    return (

    <div className={`workspace--${this.props.view}`}>
        <div className = "workspace__header">
                <div className="workspace__title">
                        <div className="emoji"> {this.state.emoji}</div>
                        <span onClick={(e) => { this.props.handleNavigateToWorkspace(this.props.id)}}>{this.state.title}</span>

                        <PopUp open={this.state.popup} button={button} type="edit" background="none" color="#868686">
                          <div className="popup__header"> Edit your workspace</div>
                          <div className="workspace__name">
                            <div className="emoji-tooltip">
                              <Tooltip
                                  trigger={open => (
                                    <div className={`emoji--with-emoji-box'}`}> {this.state.changeEmoji} </div>
                                  )}
                                  position="bottom right"
                                  closeOnDocumentClick>

                                  <EmojiPicker setEmoji={this.setEmoji}/>
                                </Tooltip>
                              </div>

                            <label htmlFor="workspace_name"></label>
                            <input type="text" id="workspace_name" value={this.state.changeTitle}
                            onChange= { e => {this.handleTitle(e)}} name="workspace_name" required minLength="4" maxLength="20"></input>
                          </div>

                          <br />
                          <div className="input-text--large">
                              <textarea type="text" id="workspace_name" value={this.state.changeDescription}
                              onChange= { e => {this.handleDescription(e)}} name="workspace_name"></textarea>
                          </div>

                          <br />
                          <Button onClick={this.saveChanges} text="Save" />
                          <Button onClick={(e) => {
                              this.props.handleDeleteWorkspace(this.props.id, this.props.uid);
                              this.closeModal()}} type="danger" text="Delete" />
                      </PopUp>
                </div>

        </div>

        <div className="workspace__description"> {this.state.description} </div>
        <hr />
        <div className="workspace__created"> {this.state.date} </div>
    </div>
    );
  }
}

WorkspaceCard.propTypes = {
    // id of workspace (in db)
  id: PropTypes.string.isRequired,
  // view "grid" or "list" of the workspace
  view: PropTypes.string,
  // emoji of the workspace
  emoji: PropTypes.string,
  // title of the workspace
  title: PropTypes.string,
  // description of the workspace
  description: PropTypes.string,
  // date of the workspace
  date: PropTypes.string,
  // callback to delete workspace
  handleDeleteWorkspace: PropTypes.func,
  //  callback to navigate to a specific workspace
  handleNavigateToWorkspace: PropTypes.func
};

export default WorkspaceCard;
