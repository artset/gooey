import React from 'react';

import QuizProgressCircle from './QuizProgressCircle.js';
import PropTypes from 'prop-types';

import './QuizSection.scss';

/**
 * This component is used in the header of the quiz to show where the user is at.
 */
class QuizProgressBar extends React.Component {

  renderProgress(){
    return (this.props.sections.map((data, index) => {
        return (<QuizProgressCircle 
            key={index}
            index={index} 
            section={data} 
            navigatePage={this.props.navigatePage}
            status={this.props.visitedPageStatus[index]}
            isCurrentPage={this.props.currentPage === index}
            />) })
      );
  }


  render() {
    return (
        <div className="quiz__progress">
            {this.renderProgress()}
        </div>
    );
  }
}


QuizProgressBar.propTypes = {
    // the callback function to navigate the page.
    navigatePage: PropTypes.func,
    // an array of booleans, true if the page has been visited
    visitedPageStatus: PropTypes.array,
    // an array that indicates the sections
    sections: PropTypes.array,
    // current page that the quiz is on
    currentPage: PropTypes.number

};

export default QuizProgressBar;