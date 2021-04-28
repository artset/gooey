import React from 'react';

import Header from '../components/Header.js';
import Gallery from './Gallery.js';
import StylesheetPage from './StylesheetPage.js';

import API from '../constants.js';
import * as auth from '../authentication.js';
import firebase from "../config";



/*
 * This component represents a single Workspace. Every workspace has two components: Gallery and Stylesheets.
 * This component encompasses both of those pages.
 */
class Workspace extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            recentWorkspaces: null,
            uid: "",
            workspaceId: this.props.match.params.workspaceId,
            currentLocation: "gallery" // anytime you navigate to a WS, youll always start in gallery.
        }
    };

    
    /*
     * Grabs userID when the component mounts.
     */
    componentDidMount() {
        firebase.auth().onAuthStateChanged((user) => {
            if (this.state.uid !== user.uid) {
                this.setState({ uid: user.uid })
            }
        });
    }

    /*
     * Updates workspace id when a user navigates to another page.
     * Needed because react-router-dom does not remount a component when rerouting to the same URL pattern.
     */
    componentDidUpdate(prevProps) {
       if (prevProps === null || prevProps.match.params.workspaceId !== this.props.match.params.workspaceId) {
          //this.setState({recentWorkspaces: null}); // this is one solution but its ugly because the page goes white.

          this.getHeaderData(this.props.match.params.workspaceId);
          this.setState({currentLocation: "gallery"});
       }
   }

   /**
    * Function that navigates to a different page.
    * params: destination - the place where the user intends to navigate to
    */
    navigateElsewhere = (destination) => {
        if (destination === "dashboard") {
            this.props.history.push("/dashboard");
        } else {
           this.props.history.push("/workspace/" + destination);
        }
    }

    /**
     * Function that toggles the state of currentLocation.
     * Based on this currentLocation, this component will show two different pages.
     */
    toggleLocation = () => {
        if (this.state.currentLocation === "gallery") {
            this.setState({currentLocation: "stylesheet"});
        } else {
            this.setState({currentLocation: "gallery"});
        }
    }

    /**
     * Function that navigates to the dashboard page.
     */
    goDashboard = () => {
        this.props.history.push("/dashboard");
    }

    /**
     * Function that signs a user out and redirects them to the home page.
     */
    signOut = () => {
        auth.signOut();
        this.props.history.push("/");
    }

    /*
     * Grabs the header data for the workspace (aka, recent workspaces).
     * params: workspaceId - the ID of the current workspace
     */
    getHeaderData(workspaceId) {
        let userUid = this.state.uid;

        fetch(API + "/gallery/getCurrent/" + userUid + "/" + workspaceId, {
            method: "GET",
            headers: { 'Content-Type': 'application/json' },
        })
            .then(response => response.json())
            .then(data => {
                if (data.success && JSON.stringify(data.workspaceData) !== JSON.stringify(this.state.recentWorkspaces)) {
                    this.setState({ recentWorkspaces: data.workspaceData, workspaceId: workspaceId });
                }
            });
    }

    render() {
        if (this.state.uid === "") {
            return (<> </>);
        } else {
            
            if (this.state.recentWorkspaces === null) {
                this.getHeaderData(this.props.match.params.workspaceId);
                return (<> </>);
            }
            else {
                if (this.state.currentLocation === "gallery") {
                    return ( 
                        <div className="workspace__gallery">
                            <Header type="workspace"
                                    rerouteDashboard={this.goDashboard}
                                    toggleLocation={this.toggleLocation}
                                    recentWorkspaces={this.state.recentWorkspaces}
                                    navigateElsewhere={this.navigateElsewhere}
                                    rerouteSignout={this.signOut}
                                    nightModeButton={this.props.nightModeButton}
                                    page="gallery" />

                            <Gallery uid={this.state.uid} workspaceId={this.props.match.params.workspaceId}
                                        />
                        </div>
                    );
                } else {
                    return (
                        <div className="workspace__stylesheet">
                            <Header type="workspace"
                                    
                                    toggleLocation={this.toggleLocation}
                                    recentWorkspaces={this.state.recentWorkspaces}
                                    navigateElsewhere={this.navigateElsewhere}
                                    rerouteSignout={this.signOut}
                                    nightModeButton={this.props.nightModeButton}
                                    page="stylesheet" />

                            <StylesheetPage uid={this.state.uid} workspaceId={this.props.match.params.workspaceId}
                                            />
                        
                        </div>

                    );
                }
            }
        }
    }
}

export default Workspace;