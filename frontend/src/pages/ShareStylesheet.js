import React from "react";
import './ShareStylesheet.scss';
import Header from '../components/Header.js';
import Loader from '../components/Loader.js';

//extract out to lower component
import ImmutableStylesheet from '../components/ImmutableStylesheet.js';
import API from "../constants";

/**
<<<<<<< HEAD
 * The shared stylesheet page is the immutale stylesheet that 
 * anyoen can view.
=======
 * Component that renders a share page.
>>>>>>> 2f207ef2d74158c5fb80ab871edbd3ca2aac7421
 */
class ShareStylesheet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data : null,
            isLoading: true
        };
    }

    /**
     * Function that navigates to the dashboard.
     */
    goDashboard = () => {
        this.props.history.push("/dashboard");
    }

    /**
<<<<<<< HEAD
     * Makes sure that the data does load when the component mounts.
=======
     * Function that fetches the stylesheet data from the database.
>>>>>>> 2f207ef2d74158c5fb80ab871edbd3ca2aac7421
     */
    componentDidMount() {
        let workspaceId = this.props.match.params.workspaceId;
        let stylesheetId = this.props.match.params.stylesheetId;
        fetch(API + "/stylesheets/get/" + workspaceId + "/" + stylesheetId, {
            method: "GET",
        }).then (response => response.json())
            .then(data => {
                if (JSON.stringify(data.data) !== JSON.stringify(this.state.data)) {
                    this.setState({data:data.data, isLoading: false})
                }
            });
    }

    /**
<<<<<<< HEAD
     * Renders a mutable stylesheet.
=======
     * Function that renders the stylesheet data through the ImmutableStylesheet component.
>>>>>>> 2f207ef2d74158c5fb80ab871edbd3ca2aac7421
     */
    renderStylesheet() {
        let stylesheet = this.state.data;
        return (Object.keys(stylesheet).map((key) => {
                return (
                    <ImmutableStylesheet key={key}
                                            colors={stylesheet[key]['colors']}
                                            body = {stylesheet[key]['body']}
                                            title = {stylesheet[key]['title']}
                                            background={stylesheet[key]['colors'][stylesheet[key]['background']]}
                    />
                )
            })
        );
    }


    render() {
        if (this.state.isLoading === true) {
            return (
                <div className = "share-stylesheet">
                    <Header text="home" type="generic" />

                    <Loader message={true} />
                </div>
            );
        }
        else {
            return (
                <div className = "share-stylesheet">
                    <Header text="home" type="generic"  rerouteDashboard={this.goDashboard}/>
                    {this.renderStylesheet()}
                </div>
            );
        }
    }
}

export default ShareStylesheet;
