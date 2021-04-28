import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

// Config removed for security ;)
let config = {
    apiKey: "filler",
}

const firebaseApp = firebase.initializeApp(config);

export default firebaseApp;