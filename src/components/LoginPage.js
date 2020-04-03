import React, {useState, useEffect} from 'react';
import "./Auth.css"
import firebase from "../firebase"
import { withRouter } from 'react-router';
import { faGoogle, faGithub } from "@fortawesome/free-brands-svg-icons"
import { faEye, faEyeSlash, faUsers } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, Redirect } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';


const LoginPage = props => {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState()
    const [remember, setRemember] = useState(false)

    const {currentUser} = useContext(AuthContext)

    if (currentUser) {
        return <Redirect to="/" />
    } 

    const formSubmitHandler = async e => {
        e.preventDefault()
        try{
            if (remember) {
                await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            } else {
                await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE)
            }
            await firebase.auth().signInWithEmailAndPassword(email, password)
            props.history.push("/")
        }catch(err){

        }
    }

    const handleGoolgeSignIn = async e => {
        if (remember) {
            await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        } else {
            await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE)
        }
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebase.auth().signInWithPopup(provider)
        const user = result.user
        try{
            await firebase.firestore().collection("users").doc(user.uid).update({
                name: user.displayName,
                uid: user.uid,
                profilePicture: user.photoURL
            })
        }catch(err){
            await firebase.firestore().collection("users").doc(user.uid).set({
                name: user.displayName,
                uid: user.uid,
                profilePicture: user.photoURL
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
                            <h5 className="card-title text-center">Sign In</h5>
                            <form className="form-signin" onSubmit={formSubmitHandler}>
                                <div className="form-label-group">
                                    <input type="email" id="inputEmail" value={email} onChange={e => setEmail(e.target.value)} className="form-control" placeholder="Email address" required autofocus />
                                    <label htmlFor="inputEmail">Email address</label>
                                </div>
                                <div className="form-label-group">
                                    <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} id="inputPassword" className="form-control" placeholder="Password" required />
                                    <label htmlFor="inputPassword">Password</label>
                                    <input type="checkbox" id="showPassword" checked={showPassword} onChange={e => setShowPassword(e.target.checked)} />
                                    <label htmlFor="showPassword" className="show-password" style={{ cursor: "pointer" }}><FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} /></label>
                                </div>
                                <div className="custom-control custom-checkbox mb-3">
                                    <input type="checkbox" className="custom-control-input" id="customCheck1" checked={remember} onChange={e => setRemember(e.target.checked)} />
                                    <label className="custom-control-label" htmlFor="customCheck1">Remember Me</label>
                                </div>
                                <button className="btn btn-lg btn-primary btn-block text-uppercase" type="submit">Sign in</button>
                                <hr className="my-4" />
                            </form>
                            <div className="form-signin">
                                <button onClick={handleGoolgeSignIn} className="btn btn-lg btn-google btn-block text-uppercase" type="submit"><FontAwesomeIcon icon={faGoogle} className="logo mr-2" /> Sign in with Google</button>
                                <button className="btn btn-lg btn-github btn-block text-uppercase" type="submit"><FontAwesomeIcon icon={faGithub} className="logo mr-2" />Sign in with Github</button>
                                <div className="form__links">
                                    <span>Need an account? <Link to="/auth/register">Register</Link></span>
                                    <Link to="/auth/register">Change Password</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withRouter(LoginPage);
