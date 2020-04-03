import React, {useState, createContext, useEffect} from "react"
import firebase from "../firebase"

export const AuthContext = createContext()

export const AuthProvider = props => {

    const [currentUser, setCurrentUser] = useState()

    const handleAuth = async () => {
        await firebase.auth().onAuthStateChanged(user => {
            setCurrentUser(user)
        })
    }

    useEffect(async () => {
        handleAuth()
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

