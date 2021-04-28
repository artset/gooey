import React from 'react';
import PropTypes from 'prop-types';
import "./QuizSection"
/**
 * This component is used on the sidebar of the quiz, to render a single color if it's been shown.
 */
class QuizColorBox extends React.Component {

  render() {
    return (
        <div className = "quiz__colorbox" style={{backgroundColor: this.props.color}} 
             onClick={() => this.props.removeColorFromSelected(this.props.color)}/>
    );
  }
}

QuizColorBox.propTypes = {
  // color of the QuizColorBox
  color: PropTypes.string,
  // function to remove
  removeColorFromSelected: PropTypes.func
};


QuizColorBox.defaultProps = {
  removeColorFromSelected: () => {}
}

export default QuizColorBox;