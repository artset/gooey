import React from 'react';
import PropTypes from 'prop-types';
import './QuizSection.scss';
import ColorCard from './ColorCard.js';
import Button from './Button.js';
import Loader from './Loader.js';

/**
 * This is a single subpage of the quiz.
 */

class QuizSection extends React.Component {

  /**
   * This renders each of the colors in a sectino of the color quiz.
   */
  renderColors(){
    return (this.props.colorData.map((data) => {
        let key = data.name + data.hex;
        let isSelected = this.props.selectedColors.indexOf(data.hex) > -1 ? true : false;
        return (<ColorCard
            key={key} 
            color={data.hex}
            name={data.name}
            isSelected={isSelected}
            fullCapacity={this.props.fullCapacity}
            addSelection={this.props.addColorToSelected}
            removeSelection={this.props.removeColorFromSelected}/>) })
      );
  }

  render() {

    let content="";

    let loader = "";
    if (this.props.ifLoading) {
        loader = <Loader message={false} />;
    };

    if (this.props.section === "intro"){
        content = 
        <div className="quiz__text">
            Welcome to the color quiz!
            <ul>
                <li> Select at least 10 colors that represent the vibe of your project.</li>
                <li> You do not have to choose a color in every category. </li>
                <li> The more colors you choose, the smarter our recommendations will be! </li> 
            </ul>

            <center><Button text="start" onClick={this.props.nextPage}/></center>
        </div>;
    } else if (this.props.section === "submit") {
        content =  
        <div className="quiz__text">
            You've reached the end of the quiz! <br />
            Feel free to go back and add more colors, or submit if you're ready.
            <br />
    
            {this.props.error}
        
            <center><Button text="finish" onClick={this.props.submitQuiz}/></center>

            <br /> <br/>
            {loader}
        </div>;
    } else {
        content = this.renderColors();
    }

    return (
        <div className = "colors">
            {content}
        </div>
    );
  }
}


QuizSection.propTypes = {
    // callback function to add colors
    addColorToSelected:  PropTypes.func,
    // calback function to remove colors
    removeColorFromSelected: PropTypes.func, 
    // full color capacity
    fullCapacity: PropTypes.number,
    // color data passed through
    colorData: PropTypes.array,
    // what the quiz section should look like
    section: PropTypes.oneOf(["intro", "red", "yellow", "green", "blue", "purple", "neutral", "submit"]),
    // the callback function that allows the user to navigate to the next page
    nextPage: PropTypes.func,
    // callback function that lets the user submit their quiz
    submitQuiz: PropTypes.func,
    // a list of all selected colors
    selectedColors: PropTypes.array
};

export default QuizSection;