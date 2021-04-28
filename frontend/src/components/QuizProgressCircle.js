import React from 'react';
import PropTypes from 'prop-types';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck as check } from '@fortawesome/free-solid-svg-icons';
import { faQuestion as question } from '@fortawesome/free-solid-svg-icons';
import { faExclamation as exclamation } from '@fortawesome/free-solid-svg-icons';

import './QuizSection.scss';


/**
 * This component is used to show a single color box in the quiz.
 */
class QuizProgressCircle extends React.Component {
  render() {
    let symbol = "";

    if (this.props.section === "intro") {
        symbol =  <FontAwesomeIcon icon={question} />;
    } else if (this.props.section === "submit") {
        symbol =  <FontAwesomeIcon icon={exclamation} />;
    } else if (this.props.status === true ) {
        symbol = <FontAwesomeIcon icon={check} />;
    }

    let selected = this.props.isCurrentPage ? "selected" : ""
    return (
        <div 
        className={`quiz__progress__circle quiz__progress__circle--${this.props.section} quiz__progress__circle--${selected}`}
        onClick={(e) => {window.scrollTo(0, 0);
            this.props.navigatePage(this.props.index)}}
        
        > 
        {symbol}
        </div>
    );
  }
}

QuizProgressCircle.propTypes = {
    // the status of the progress bar
    section: PropTypes.oneOf(["intro", "red", "yellow", "green", "blue", "purple", "neutral", "submit"]),
    // the index of the section (zero indexed)
    index: PropTypes.number,
    // onclick callback function
    onClick: PropTypes.func,
    // status: true if we have visited  this page
    status: PropTypes.bool,
    // boolean indicating if we are on that page
    isCurrentPage: PropTypes.bool
};

export default QuizProgressCircle;