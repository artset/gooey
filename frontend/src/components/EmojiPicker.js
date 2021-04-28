import React from 'react';

import { Picker } from 'emoji-mart';
import PropTypes from 'prop-types';
import 'emoji-mart/css/emoji-mart.css'
import './EmojiPicker.scss';

/**
 * Wrapper component for the emoji picker used when creating or editing workspaces.
 */
class EmojiPicker extends React.Component {

  render() {
    const picker_array=['search', 'recent', 'smileys', 'people', 'nature', 'foods', 'activity', 'places', 'objects'];
    
    return (
            <Picker native={true}
                onClick={this.props.setEmoji}
                emojiTooltip={true} 
                theme="auto" 
                emojiSize={16}
                useButton={false}
                include={picker_array}
                style={{ fontFamily: 'Inconsolata'}} 
            />
    );
  }
}

EmojiPicker.propTypes = {
  setEmoji: PropTypes.func,
};


export default EmojiPicker;