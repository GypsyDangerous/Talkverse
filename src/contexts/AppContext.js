import React, {useState, useEffect, createContext, useMemo} from 'react'
import firebase from "../firebase"


export const AppContext = createContext({})

export const AppContextProvider = props => {

    const [contactList, setContactList] = useState([])
    const [userData, setUserData] = useState({})
    const [firebaseInit, setFirebaseInit] = useState(false)

    useEffect(() => {
        (async () => {
            const result = await firebase.isInitialized();
            setFirebaseInit(result)
        })()
    }, [])

    useEffect(() => {
        if(firebaseInit !== false){
            alert("hi")
            const unsub = firebase.db.collection("users").doc(firebase.auth.currentUser.uid).onSnapshot(doc => {
                const userdata = { ...doc.data(), id: doc.id }
                setUserData(userdata)
            })
            return unsub
        }
    },[firebaseInit])

    useEffect(() => {
        const unsub = firebase.db.collection("conversations").onSnapshot(async snapshot => {
            const contacts = [].concat.apply([], snapshot.docs.map(doc => doc.data()).filter(doc => doc.members.includes(firebase.auth.currentUser.uid)).map(conv => { return { members: conv.members, newest: conv.newest } }))
            let final = []
            for (const contact of contacts.sort((b, a) => a.newest?.sentAt - b.newest?.sentAt)) {
                const id = contact.members.filter(id => id !== firebase.auth.currentUser.uid)[0]
                const newest = contact.newest
                final.push({ id, newest })
            }
            setContactList(final)
        })
        return unsub
    },[])

    const providerValue = useMemo(() => ({
        contactList,
        setContactList,
        userData,
        setUserData
    }),[contactList, setContactList, userData, setUserData])

    return (
        <AppContext.Provider
            value={
                providerValue
            }
        >
            {props.children}
        </AppContext.Provider>
    );
}

