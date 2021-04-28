import firebase from './config.js';

export function signOut(){
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
        return true;
    }).catch(function(error) {
        // An error happened.
        return false;
    });
}