import React from 'react';
import PropTypes from 'prop-types';
import './Header.scss';
import Accordion from './Accordion.js';
import Button from './Button.js';
import QuizProgressBar from './QuizProgressBar';

/**
 * Component that defines a Header, which is user on nearly all pages of the application.
 */
class Header extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            emoji: this.props.recentWorkspaces.current.emoji,
            name: this.props.recentWorkspaces.current.title
        }
    };

    /**
     * Changes the accordion title of the header in the case that this is a workspace header.
     * params: newEmoji - the emoji representing the new workspace
     *         newName - the name representing the new workspace
     */
    changeHeaderTitle = (newEmoji, newName) => {
        this.setState({
            emoji: newEmoji,
            name: newName
        })
    }

    /**
     * Renders an underline under Gallery or Stylesheet depending on where the user is in the workspace.
     */
    renderGalleryOrStylesheet() {
        if (this.props.page === "gallery") {
            return (<div className="header-route__options">
                <div className="header-gallery--focus">GALLERY</div>
                <div className="header-stylesheet" onClick={this.props.toggleLocation}>STYLESHEETS</div>
            </div>);
        } else {
            return (<div className="header-route__options">
                <div className="header-gallery" onClick={this.props.toggleLocation}>GALLERY</div>
                <div className="header-stylesheet--focus">STYLESHEETS</div>
            </div>);
        }

    }

    render() {
        // DASHBOARD HEADER
        if (this.props.type === 'dashboard') {
            return (
                <div className="header">
                    <div className="header__content">
                        <div className="logo"> gooey </div>
                        <div className="settings">
                        {this.props.nightModeButton}
                        <Button text="sign out" onClick={this.props.rerouteSignout} />
                        </div>
                    </div>
                </div>
            );
        }
        // QUIZ HEADER
        else if (this.props.type === 'quiz') {
            return (
                <div className="header">
                    <div className="header__content header__content--quiz">
                        <div className="choose-color">Color Quiz  </div>
                        <div className="header__quiz__progress-bar">
                            <QuizProgressBar
                                navigatePage={this.props.navigatePage}
                                visitedPageStatus={this.props.visitedPageStatus}
                                sections={this.props.quizSections}
                                currentPage={this.props.quizCurrentPage}
                            />
                        </div>

                        <div className="header__quiz__next">
                            {this.props.nightModeButton}
                            <Button onClick={this.props.quizNext} text="Next" />

                        </div>

                    </div>
                </div>
            );
        }
        // WORKSPACE HEADER
        else if (this.props.type === 'workspace') {
            return (
                <div className="header">
                    <div className="header__content">
                        <div className="header-workspace">
                            <Accordion type="navigation"
                                size="large"
                                changeHeaderTitle={this.changeHeaderTitle}
                                title={this.state.emoji.concat(" ").concat(this.state.name)}
                                recentWorkspaces={this.props.recentWorkspaces}
                                navigateElsewhere={this.props.navigateElsewhere} />

                            {this.renderGalleryOrStylesheet()}
                        </div>

                        <div className="settings">
                            {this.props.nightModeButton}
                             
                            <Button text="sign out" onClick={this.props.rerouteSignout} />
                        </div>
                    </div>
                </div>
            );
        }
        else {
            // GENERIC HEADER FOR PAGES LIKE HOME, LOGIN.
            return (
                <div className="header">
                    <div className="header__content">
                        <div className="logo" onClick={this.props.rerouteDashboard}> gooey </div>

                        <div className="settings">
                            {this.props.nightModeButton}
                        </div>
                    </div>
                </div>
            );
        }

    }
}

Header.propTypes = {
    type: PropTypes.oneOf(['quiz', 'dashboard', 'workspace', 'generic']),
    text: PropTypes.string,

    // callback function to sign out 
    signOut: PropTypes.func,

    // FOR QUIZ PAGE
    // callback function to navigate to a certain section of quiz based on index
    navigatePage: PropTypes.func,
    // array of BOOLEAN values indicating what sections have been visited
    visitedPageStatus: PropTypes.array,
    // array of STRING values enumerating what quiz sections exist.
    quizSections: PropTypes.array,
    // integer representing the current page
    quizCurrentPage: PropTypes.number,
    // callback function that moves to the next page
    quizNext: PropTypes.func,

    // FOR GALLERY AND STYLESHEET PAGE
    // callback function to navigate to stylesheet page
    rerouteStylesheet: PropTypes.func,
    // callback function to navigate to gallery page
    rerouteGallery: PropTypes.func,
    // callback function to navigate to the dashboard page
    rerouteDashboard: PropTypes.func,
    // callback function to nign out
    rerouteSignout: PropTypes.func,
    // name of the current workspace you are in
    workspaceName: PropTypes.string,
};

Header.defaultProps = {
    rerouteSignout: () => { },
    recentWorkspaces: {"current": {"emoji": "", "title": ""}}
};

export default Header;