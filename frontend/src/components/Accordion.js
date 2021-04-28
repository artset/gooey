import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './Accordion.scss';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'

/**
 *  This component is used to make drop downs, such as the dashboard drop down, or filtering drop downs.
 */
class Accordion extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ifShow: false,
        }
        this.onClick = this.onClick.bind(this);
    }

    /**
     * Defines a mouse event listener on the component.
     */
    componentWillMount() {
        document.addEventListener('mousedown', this.handleClick, false);
    }

    /**
     * Removes the mouse event listener when the component unmounts.
     */
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClick, false);
    }

    /**
     * Function that tests whether a user's click falls within the node ref.
     */
    handleClick = (e) => {
        if (this.node.contains(e.target)){
            return;
        }
        this.handleClickOutside();
    }

    /**
     * Closes the accordion if the user clicks outside the node ref.
     */
    handleClickOutside() {
        this.setState({ifShow: false});
    }

    /**
     * Function that makes it so that when you click on the accordion, it will open.
     * When you click on the accordion again, it will close.
     */
    onClick() {
        this.setState(prevState => ({
            ifShow: !prevState.ifShow
        }));
    }

    /**
     * Closes the accordion in the case that it is a standard accordion.
     */
    closeAccordion = (data) => {
        this.setState(prevState => ({
            ifShow: !prevState.ifShow
        }));
        if (this.props.onClick !== null) {
            this.props.onClick(data);
        }
    }

    /**
     * Renders accordion items based on the props "values." This is a standard accordion that contains
     * static, unchanging options.
     */
    renderAccordionItems() {
        return (this.props.values.map((data, index) => {
            return (
                <div key={index} onClick={() => this.closeAccordion(data)} className={`accordion__item`}>
                    {data}
                </div>) })
          );
    }

    /**
     * Reroutes to the specified page and closes the accordion in the case that this is a navigable 
     * accordion.
     */
    closeNavigationAccordion = (reroute, emoji, name) => {
        this.setState(prevState => ({
            ifShow: !prevState.ifShow
        }));

        if (reroute !== "dashboard"){
            this.props.changeHeaderTitle(emoji, name);
        }
        this.props.navigateElsewhere(reroute);
    }

    /**
     * Renders the items in the case that this is a navigable accordion.
     */
    renderNavigationAccordionItems() {
        var html = [];
        html.push (<div onClick={() => this.closeNavigationAccordion("dashboard", null, null)} className={`accordion__item`}>
                                Dashboard
                    </div>);
        html.push(<hr/>);
        html.push(<div className="recent-workspaces"> MOST RECENT </div>);

        
        for (var i = 0; i < this.props.recentWorkspaces.recent.length; i++) {
            let workspaceId = this.props.recentWorkspaces.recent[i].workspaceID;
            let emoji = this.props.recentWorkspaces.recent[i].emoji;
            let name = this.props.recentWorkspaces.recent[i].title;
            html.push(<div key={i} onClick={() => this.closeNavigationAccordion(workspaceId, emoji, name)} className={`accordion__item`}>
            {this.props.recentWorkspaces.recent[i].emoji} {this.props.recentWorkspaces.recent[i].title}
        </div>)
        }

        return html;
    }


    render() {

        let flip = "horizontal";
        let style = {};

        if (this.state.ifShow) {
            flip = "vertical";
        } else {
            style = { display: 'none' };
        }

       if (this.props.type === "navigation") {
            return (
                <div className={`accordion--navigation accordion--${this.props.size}`} ref={node => this.node = node}>
                    <div className={`accordion__header${this.state.ifShow ? "--expanded" : ""}`} onClick={this.onClick}> 
                        <div className="accordion__title">{this.props.title}</div>
                        <FontAwesomeIcon className = "caret" icon={faAngleDown} flip={flip} color="grey" />
                    </div>

                    <div className={`accordion__children accordion__children--${this.props.size} accordion__children--navigation`} style={style}>
                        {this.renderNavigationAccordionItems()}
                    </div>
                </div>
            );
       } 
       else {
           let openAbove = this.props.ifOpenAbove ? "above" : "";
           let ifShow = this.state.ifShow ? "expanded" : "";
            return (
                <div className={`accordion--regular accordion--${this.props.size}`} ref={node => this.node = node}>
                    <div className={`accordion__header--${ifShow} accordion__header--${ifShow}--${openAbove} accordion__header`} onClick={this.onClick}> 
                        <div className="accordion__title">{this.props.title}</div>
                        <FontAwesomeIcon className = "caret" icon={faAngleDown} flip={flip} color="grey" />
                    </div>

                    <div className={`accordion__children accordion__children--regular 
                    accordion__children--${this.props.size}
                    accordion__children--regular--${openAbove}`} style={style}>
                        {this.renderAccordionItems()}
                    </div>
                </div>
            );
        }
    }
}


Accordion.propTypes = {
    // callback method to do an action on click of an accordion item. takes in a single parameter,
    // the text of the item that was selected
    onClick: PropTypes.func,
    // navigation is for the dashboard and regular is ordinary accordion
    type: PropTypes.oneOf(['navigation', 'regular']),
    // title for the accordion
    title: PropTypes.string,
    // a list of options for the accordion content
    values: PropTypes.array,
    // callback to navigate
    rerouteDashboard: PropTypes.func,
    // boolean to indicate if accordion opens up
    ifOpenAbove: PropTypes.bool,
    // determines the size of the accordion
    size: PropTypes.oneOf(['small', 'medium', 'large'])

};

Accordion.defaultProps = {
    ifOpenAbove: false,
    type: 'regular',
    size: 'medium',
    onClick: () => {},

}
export default Accordion;