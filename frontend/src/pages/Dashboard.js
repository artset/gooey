import React from 'react';
import '../pages/Dashboard.scss';

import API from '../constants.js';
import Header from '../components/Header.js';
import WorkspaceCard from '../components/WorkspaceCard.js';
import Button from '../components/Button.js';
import Loader from '../components/Loader.js';
import PopUp from '../components/PopUp.js';
import Banner from '../components/Banner.js';
import Tooltip from "reactjs-popup";
import Accordion from '../components/Accordion.js';
import EmojiPicker from '../components/EmojiPicker.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTh as gridview } from '@fortawesome/free-solid-svg-icons';
import { faList as listview } from '@fortawesome/free-solid-svg-icons';

import firebase from "../config";

/*
 * Component that renders a user's dashboard page and their available workspaces.
 */
class Dashboard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            view: "grid",
            emoji: "😀",
            sort: "sort by",
            workspaces: null,
            user: null,
            uid: "",
            // title:"",
            description: "",
            createWorkspaceError: "",
        };
        this.signOut = this.signOut.bind(this);
        this.handleNavigateToWorkspace = this.handleNavigateToWorkspace.bind(this);
        this.handleDeleteWorkspace = this.handleDeleteWorkspace.bind(this);
    }

    /* Get user ID on component mount. */
    componentDidMount() {
        firebase.auth().onAuthStateChanged((user) => {
            this.setState({user: user});
            if (user !== null) {
                this.setState({uid:user.uid})
            } else { //if user is every not signed in, shouldn't be able to access dashboard.
                this.goLogOut();
            }
        });
    }

    /*
     * Function that moves to the gallery page.
     * params: workspaceid
     */
    goGallery = (workspaceid) => {
        this.props.history.push("/workspace/" + workspaceid);
    }

    /*
     * Function that logs a user out.
     */
    goLogOut = () => {
        this.props.history.push("/");
    }

    /*
     * Function that moves to the quiz page.
     * params: workspaceid
     */
    goQuiz = (workspaceid) => {
        this.props.history.push({
            pathname: '/quiz/' + workspaceid,
            data: { "workspace_id": workspaceid } // your data array of objects
        })
    }

    /*
     * Function that makes a request to the backend to create a new workspace with the 
     * info that the user has specified.
     */
    createWorkspace() {
        var emoji = this.state.emoji;
        var title = this.state.title;
        var description = this.state.description;
        var uid = this.state.uid;
        let data = { "uid": uid, "title": title, "description": description, "emoji": emoji };
        fetch(API + "/dashboard/create", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
            .then(response => response.json())
            .then(result => this.handleErrorCreateWorkspace(result.success, result.workspaceid));
    }

    /*
     * Function that handles error when creating a workspace.
     * params: success - the success code returned by the backend
     *         workspaceID - the current workspace's id
     */
    handleErrorCreateWorkspace(success, workspaceID) {
        if (!success) {
            let errorBanner = <Banner type="error" text="Invalid workspace title. Pick a different one!" />
            if (this.state === null || this.state.title.length < 3) {
                errorBanner = <Banner type="error" text="Workspace title must have at least 3 characters." />
            }
            this.setState({
                error: errorBanner
            })
        } else {
            this.goQuiz(workspaceID);
        }
    }

    /*
     * Function that makes a request to the backend to delete a workspace.
     * params: uid - the user's id
     *         workspaceID - the current workspace's id
     */
    handleDeleteWorkspace(workspaceId, uid) {
        // todo: delete workspace in frontend (backend is handled)
        let data = { "uid": uid, "workspaceId": workspaceId };

        let newWorkspaces = [...this.state.workspaces]

        for (let i = 0; i < newWorkspaces.length; i++) {
            if (newWorkspaces[i]['id'] === workspaceId) {
                newWorkspaces.splice(i, 1);
            }
        }
        this.setState({workspaces: newWorkspaces});
        fetch(API + "/dashboard/delete", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
            .then(response => response.json())
            .then(result => {

            });
    }

    /*
     * Function that defines different methods of sorting.
     * params: a - first item
     *         b - second item
     * 
     * returns: one of the following, based on component state
     *              - alphabetical distance between a and b
     *              - date difference between a and b
     *              - 0 (no sort applied)
     */
    sortItems = (a, b) => {
        if (this.state.sort === "alphabet") {
            return a.title.localeCompare(b.title, 'en', { sensitivity: 'base' });
        }
        else if (this.state.sort === "last updated") {
            let a_date = Date.parse(a.date.replace(".", ""));
            let b_date = Date.parse(b.date.replace(".", ""));
            return b_date - a_date;
        }
        else {
            return 0; // no sort
        }
    }

    /*
     * Function that navigates to a workspace if the user has already completed a quiz.
     * params: workspaceID - the current workspace's id
     */
    handleNavigateToWorkspace(workspaceId) {
        fetch(API + "/dashboard/checkQuiz/" + workspaceId, {
            method: "GET"
        })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    this.goGallery(workspaceId)
                } else {
                    this.goQuiz(workspaceId);
                }
            });

    }

    /*
     * Function that renders a workspace using a Workspace card component.
     */
    renderWorkspaces() {
        if (this.state.workspaces === null || this.state.ifLoading === true) {
            this.getWorkspacesJSON();
            return <div class="workspace__loader"><Loader message={true} /></div>
        } else {
            if (this.state.workspaces.length === 0) {
                return <Banner text="No workspaces created. Make one! :)" />
            }
            return (this.state.workspaces.sort(this.sortItems).map((data) => {
                return (<WorkspaceCard 
                    key={data.title}
                    uid={data.uid}
                    id={data.id}
                    emoji={data.emoji}
                    date={data.date}
                    title={data.title}
                    description={data.description}
                    view={this.state.view}
                    handleNavigateToWorkspace={this.handleNavigateToWorkspace}
                    handleDeleteWorkspace={this.handleDeleteWorkspace} />)
            })
            );
        }
    }

    /*
     * Function that fetches a user's workspaces in JSON format.
     */
    getWorkspacesJSON() {
        var uid = this.state.uid;

        fetch(API + "/dashboard/load/" + uid, {
            method: "GET",
            headers: { 'Content-Type': 'application/json' }
        })
            .then(response => response.json())
            .then(data => {

                if (JSON.stringify(data.workspaces) !== JSON.stringify(this.state.workspaces)) {
                    this.setState({ workspaces: data.workspaces, isLoading: false})
                }
            });
    }

    /*
     * Function that toggle's state of view between "grid" and "list".
     * params: selectedView - the view selected. One of "grid" or "list"
     */
    toggleView = (selectedView) => {
        if (this.state.view !== selectedView) {
            this.setState({ view: selectedView });
        }
    }

    /*
     * Function that sets the emoji the user has selected.
     * params: emoji - the emoji the user has selected.
     */
    setEmoji = (emoji, event) => {
        this.setState({ emoji: emoji.native })
    }

    /*
     * Function that changes the state of sortMethod.
     * params: sortMethod - the intended sort method. 
     *                      one of "alphabetically", "last updated"
     */
    changeSortMethod = (sortMethod) => {
        this.setState({ sort: sortMethod });
    }

    /*
     * Function that signs a user out and redirects them to the home page.
     */
    signOut() {
        firebase.auth().signOut().then((result) => {
            this.setState({ user: null });
            this.goLogOut();
        });
    }

    /*
     * Function that updates title based on what user types.
     * params: e - the event that the user is typing
     */
    handleTitle(e) {
        this.setState({ title: e.target.value });
    }

    /*
     * Function that updates description based on what user types.
     * params: e - the event that the user is typing
     */
    handleDescription(e) {
        this.setState({ description: e.target.value });
    }

    render() {
        return (
            <div>
                <Header text="home" type="dashboard" nightModeButton={this.props.nightModeButton} rerouteSignout={this.signOut} />

                <div className="content">
                    <div className="dashboard-top">

                        <PopUp button="Create New Workspace">
                            <div className="popup__header"> Create new workspace</div>

                            <div className="workspace__name">
                                <div className="emoji-tooltip">
                                    <Tooltip
                                        trigger={open => (
                                            <div className={`emoji--${this.state.emoji === "" ? 'without-emoji-box' : 'with-emoji-box'}`}> {this.state.emoji} </div>
                                        )}
                                        position="bottom right"
                                        closeOnDocumentClick>

                                        <EmojiPicker setEmoji={this.setEmoji} />
                                    </Tooltip>
                                </div>
                                
                                <label htmlFor="workspace_name"></label>
                                <input type="text" id="workspace_name" placeholder="My Epic Workspace" name="workspace_name" required minLength="3" maxLength="20"
                                    onChange={e => { this.handleTitle(e) }}></input>
                                    {this.state.error}
                            </div>

                            <br />
                            <div className="input-text--large">
                                <textarea type="text" id="workspace_name" placeholder="Add an epic description!" name="workspace_name"
                                    onChange={e => { this.handleDescription(e) }}></textarea>
                            </div>

                            <br />
                            <Button onClick={() => { this.createWorkspace() }} text="Create" />
                        </PopUp>



                        <div className="workspace__sort-options">
                            <Accordion title={this.state.sort}
                                values={['alphabet', 'last updated']}
                                onClick={this.changeSortMethod}>
                            </Accordion>

                            <div className="view">
                                <div className={`grid ${this.state.view === "grid" ? 'selected-view' : ''}`}>
                                    <FontAwesomeIcon icon={gridview} onClick={() => this.toggleView("grid")} />
                                </div>
                                <div className={`list ${this.state.view === "list" ? 'selected-view' : ''}`}>
                                    <FontAwesomeIcon icon={listview} onClick={() => this.toggleView("list")} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr />
                    <div className={`workspace__${this.state.view === "grid" ? 'grid' : 'list'}`}>
                        <div className="header--list">
                            <div className="list__headings">
                                <div className="list__name"> Name </div>
                                <div className="list__date"> Last updated </div>
                            </div>
                            <hr />
                        </div>

                        {this.renderWorkspaces()}
                    </div>
                </div>

            </div>
        );
    }
}

export default Dashboard;