import React from 'react';
import ReactDOM from 'react-dom';

/**
 * This component wraps the text in the stylesheet component.
 */
class ContentEditable extends React.Component {

    /**
     * Determines if the component should update.
     * @param {*} nextProps - the props from the next update
     */
    shouldComponentUpdate(nextProps) {
        return nextProps.html !== ReactDOM.findDOMNode(this).innerHTML;
    }

    /**
     * Tracks changes in what the user has typed and saved them in the html.
     */
    emitChange = () => {
        var html = ReactDOM.findDOMNode(this).innerHTML;
        if (this.props.onChange && html !== this.lastHtml) {

            this.props.onChange({
                target: {
                    value: html
                }
            });
        }
        this.lastHtml = html;
    }
    
    render() {
        return (
            <div 
            onInput={() => this.emitChange} 
            onBlur={() => this.emitChange}
            contentEditable
            spellcheck="false"
            dangerouslySetInnerHTML={{__html: this.props.html}}>
            </div>

        );
    }
}


export default ContentEditable;