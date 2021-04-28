import React from 'react';
import './Quiz.scss';
import Header from '../components/Header.js';
import Button from '../components/Button.js';
import QuizColorBox from '../components/QuizColorBox.js';
import QuizSection from '../components/QuizSection.js';
import Banner from '../components/Banner.js';

import blue from '../data/quiz/blue.json';
import green from '../data/quiz/green.json';
import neutral from '../data/quiz/neutral.json';
import purple from '../data/quiz/purple.json';
import red from '../data/quiz/red.json';
import yellow from '../data/quiz/yellow.json';

import API from '../constants.js';

/**
 * This is the quiz page, which launches when a user wants to create a new workspace.
 */
class Quiz extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentPage: 0,
            selectedColors: [],
            fullCapacity: false,
            visitedPageStatus: [true, false, false, false, false, false, false, false],
            error: "",
            ifLoading: false
        }
        this.maxCapacity = 50;
        this.quizSections = ["intro", "red", "yellow", "green", "blue", "purple", "neutral", "submit"];
        this.quizData = [null, red, yellow, green, blue, purple, neutral, null];
        this.addColorToSelected = this.addColorToSelected.bind(this);
        this.removeColorFromSelected = this.removeColorFromSelected.bind(this);
        this.nextPage = this.nextPage.bind(this);
        this.navigatePage = this.navigatePage.bind(this);
        this.submitQuiz = this.submitQuiz.bind(this);
        this.clearSelection = this.clearSelection.bind(this);
        this.redirectToGallery(this.props.location.data.workspace_id);
    }

    /**
     * Redirects to gallery after quiz ends.
     */
    redirectToGallery = (workspaceId) => {
        fetch(API + "/dashboard/checkQuiz/" + workspaceId, {
            method: "GET"
        })
            .then(response=> response.json())
            .then(result => {
                if (result.success) {
                    this.goGallery(workspaceId);
                }
            });

    }
    // navigates to gallery
    goGallery = (workspaceid) => {
        this.props.history.push("/workspace/" + workspaceid);
    }


    // submits the quiz to the database
    submitQuiz() {
        // this.goGallery(this.props.location.data.workspace_id);
        this.setState({ifLoading: true})
        if (this.state.selectedColors.length < 10) {
            this.setState({
                error: <Banner type="error" text="Please select at least 10 colors before submitting the quiz!" />
            })
        } else {
            let data = {"workspaceid": this.props.location.data.workspace_id, "colors": this.state.selectedColors};
            fetch(API + "/quiz/result", {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data),
            })
                .then(response=> response.json())
                .then(result => {
                    if (result.success) {
                        this.setState({ifLoading: false})
                        this.goGallery(this.props.location.data.workspace_id);
                    } else {
                        console.log("error!");
                    }
                    }
                );

        }
    }

    // renders the sidebar of current colors
    renderCurrentColors() {
        var rows = [];
        for (var i = 0; i < this.state.selectedColors.length; i++) {
            rows.push(<QuizColorBox key={this.state.selectedColors[i]} color={this.state.selectedColors[i]} 
                        removeColorFromSelected={this.removeColorFromSelected}/>);
        }
        for (var j = 0; j < (this.maxCapacity - this.state.selectedColors.length); j++) {
            rows.push(<QuizColorBox color={"#868686"} />); // this might fuck things up
        }
        return rows;
    }


    // adds colors to the sidebar
    addColorToSelected(color) {
        if (this.state.selectedColors.length < this.maxCapacity) {
            const updatedSelection = this.state.selectedColors.concat(color);
            this.setState({
                selectedColors: updatedSelection,
            });
        }

        if (this.state.selectedColors.length === this.maxCapacity) {
            this.setState({
                fullCapacity: true
            });
        }
    }

    // removes colors from sidebar
    removeColorFromSelected = (color) => {
        const index = this.state.selectedColors.indexOf(color);
        if (index > -1) {
            var updatedSelection = [...this.state.selectedColors]; // make a separate copy of the array
            updatedSelection.splice(index, 1);

            this.setState({
                selectedColors: updatedSelection,
                fullCapacity: false
            });
        }
    }

    // navigates to the next page
    nextPage() {
        let nextPage = this.state.currentPage + 1;
        if (nextPage < this.quizSections.length) {
            this.navigatePage(nextPage)
        }
    }

    // navigate to any page, given the index
    navigatePage(index) {
        this.setState({ currentPage: index });
        let oldVisitedPageStatus = this.state.visitedPageStatus;
        oldVisitedPageStatus[index] = true;
        this.setState({ visitedPageStatus: oldVisitedPageStatus })
    }

    // clears selected colors
    clearSelection() {
        this.setState({ selectedColors: [] });
    }


    render() {
        return (
            <div>
                <Header text="gallery"
                    type="quiz"
                    quizSections={this.quizSections}
                    visitedPageStatus={this.state.visitedPageStatus}
                    quizNext={this.nextPage}
                    quizCurrentPage={this.state.currentPage}
                    nightModeButton={this.props.nightModeButton}
                    navigatePage={this.navigatePage} />

                <div className="content">
                    <div className="quiz__sidebar">
                        <div className="quiz__sidebar__header">
                            My colors
                        </div>

                        <div className="quiz__sidebar__box-container">
                            {this.renderCurrentColors()}

                            <div className="quiz__sidebar__button">
                                <Button onClick={this.clearSelection} text="Clear" />
                            </div>
                        </div>

                        <div className="quiz__sidebar__message">
                        Made a mistake? Don't worry, click on any of the colors to 
                        remove them.
                        </div>
                        
                    </div>

                    <div className="quiz__page">
                        <QuizSection
                            section={this.quizSections[this.state.currentPage]}
                            colorData={this.quizData[this.state.currentPage]}
                            addColorToSelected={this.addColorToSelected}
                            removeColorFromSelected={this.removeColorFromSelected}
                            nextPage={this.nextPage}
                            submitQuiz={this.submitQuiz}
                            selectedColors={this.state.selectedColors}
                            ifLoading={this.state.ifLoading}
                            error={this.state.error} />
                    </div>
                </div>
            </div>
        );
    }
}

export default Quiz;