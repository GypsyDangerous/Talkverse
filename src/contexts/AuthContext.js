import React, {useState, createContext, useEffect} from "react"
import firebase from "../firebase"

export const AuthContext = createContext()

export const AuthProvider = props => {

    const [currentUser, setCurrentUser] = useState()

    useEffect(() => {
        firebase.auth().onAuthStateChanged(user => {
            setCurrentUser(user)
        })
    }, [])

    return (
        <AuthContext.Provider
            value={
                {
                    currentUser,
                    setCurrentUser
                }   
            }
        >
            {props.children}
        </AuthContext.Provider>
    )
}

