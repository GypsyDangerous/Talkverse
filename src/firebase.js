import firebase from "firebase"
import "firebase/auth"


const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DATABASE_URL,
    projectId: "chat-app-8b4e4",
    storageBucket: "chat-app-8b4e4.appspot.com",
    messagingSenderId: "675144009480",
    appId: "1:675144009480:web:c0d9da3a59178abb024ebd",
    measurementId: "G-VK4FYH6J07"
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();

export default firebase