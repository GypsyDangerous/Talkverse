import app from "firebase"
import "firebase/auth"
import "firebase/firebase-firestore"

// helper function for using push notifications, will use later
// const initMessaging = async () => {
//     const messaging = app.messaging();
//     try{
//         await messaging.requestPermission()
//     }catch(err){
//         console.log(err.message)
//     }
// }

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DATABASE_URL,
    projectId: process.env.REACT_APP_PROJECTID,
    storageBucket: process.env.REACT_APP_STORAGEBUCKET,
    messagingSenderId: "675144009480",
    appId: process.env.REACT_APP_APP_ID,
    measurementId: "G-VK4FYH6J07"
};

class Firebase {
    constructor(){
        app.initializeApp(firebaseConfig);
        app.analytics();
        this.auth = app.auth();
        this.db = app.firestore();
        this.app = app
        this.storage = app.storage()
        this.perf = app.performance()
    }

    login(email, password) {
        return this.auth.signInWithEmailAndPassword(email, password)
    }

    async loginWithGoogle() {
        const provider = app.auth.GoogleAuthProvider()
        const result = await this.auth.signInWithPopup(provider)
        const name = result.user.displayName
        this.auth.currentUser.updateProfile({
            displayName: name
        })
        return result
    }
    
    logout(){
        return this.auth.signOut()
    }

    async register(name, email, password){
        await this.auth.createUserWithEmailAndPassword(email, password);
        this.auth.currentUser.updateProfile({
            displayName: name
        })
        return this.auth.currentUser
    }

    isInitialized() {
        return new Promise(resolve => {
            this.auth.onAuthStateChanged(resolve)
        })
    }

    getCurrentUsername(){
        return this.auth.currentUser.displayName
    }
}


export default new Firebase()