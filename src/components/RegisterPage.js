import React, { useState } from 'react';
import "./Auth.css"
import firebase from "../firebase"
import { withRouter } from 'react-router';
import { faGoogle } from "@fortawesome/free-brands-svg-icons"
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

const RegisterPage = props => {

    const [email, setEmail] = useState()
    const [password, setPassword] = useState()
    const [userName, setUserName] = useState()
    const [showPassword, setShowPassword] = useState(false)

    const formSubmitHandler = async e => {
        e.preventDefault()
        try {
            const user = await firebase.register(userName, email, password)
            firebase.db.collection("users").doc(user.uid).set({
                name: userName,
                uid: user.uid,
                profilePicture: "",
                status: "online"
            })
            props.history.push("/")
        } catch (err) {
            alert(err)
        }
    }

    const handleGoolgeSignIn = async e => {
        const provider = new firebase.app.auth.GoogleAuthProvider();
        const result = await firebase.auth.signInWithPopup(provider)
        const user = result.user
        firebase.auth.currentUser.updateProfile({
            displayName: user.displayName
        })
        try {
            await firebase.db.collection("users").doc(user.uid).update({
                name: user.displayName,
                uid: user.uid,
            })
        } catch (err) {
            await firebase.db.collection("users").doc(user.uid).set({
                name: user.displayName,
                uid: user.uid,
                profilePicture: user.photoURL,
                status: "online"
            })
        }
        props.history.push("/")
    }

    return (
        <div className="container">
        <div className="row">
            <div className="col-sm-9 col-md-7 col-lg-5 mx-auto">
                <div className="card card-signin my-5">
                    <div className="card-body">
                        <h5 className="card-title text-center">Sign up</h5>
                        <form className="form-signin" onSubmit={formSubmitHandler}>
                            <div className="form-label-group">
                                <input type="text" id="inputUsername" value={userName} onChange={e => setUserName(e.target.value)} className="form-control" placeholder="Email address" required autoFocus />
                                <label htmlFor="inputUsername">Username</label>
                            </div>
                            <div className="form-label-group">
                                <input type="email" id="inputEmail" value={email} onChange={e => setEmail(e.target.value)} className="form-control" placeholder="Email address" required />
                                <label htmlFor="inputEmail">Email address</label>
                            </div>
                            <div className="form-label-group">
                                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} id="inputPassword" className="form-control" placeholder="Password" required />
                                <label htmlFor="inputPassword">Password</label>
                                <input type="checkbox" id="showPassword" checked={showPassword} onChange={e => setShowPassword(e.target.checked)} />
                                <label htmlFor="showPassword" className="show-password" style={{ cursor: "pointer" }}><FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} /></label>
                            </div>
                            <button className="btn btn-lg btn-primary btn-block text-uppercase" type="submit">Sign up</button>
                            <hr className="my-4" />
                        </form>
                        <div className="form-signin">
                            <button onClick={handleGoolgeSignIn} className="btn btn-lg btn-google btn-block text-uppercase" type="submit"><FontAwesomeIcon icon={faGoogle} className="logo mr-2" /> Sign in with Google</button>
                            {/* <button className="btn btn-lg btn-github btn-block text-uppercase" type="submit"><FontAwesomeIcon icon={faGithub} className="logo mr-2" />Sign in with Github</button> */}
                            <div className="form__links">
                                <span>Already have an account? <Link to="/login">Login</Link></span>
                                <Link to="/login">Change Password</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}

export default withRouter(RegisterPage);
