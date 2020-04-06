import React, { useEffect, useState } from 'react';
import firebase from "../firebase"

const Contact = props => {
    // console.log(props)
    const [contact, setContact] = useState()
    const [conversation, setConversation] = useState()
    const [recent, setRecent] = useState()

    console.log(props)

    const getContact = async () => {
        const id = props.contact
        const db = firebase.db
        db.collection("users").doc(id).onSnapshot(snapshot => {
            setContact(snapshot.data())
        })

    }

    const getConversation = async () => {
        firebase.db.collection("conversations").onSnapshot(snapshot => {
            const thisConv = snapshot.docs.map(doc => doc.data()).filter(conv => conv.members.includes(props.contact) && conv.members.includes(firebase.auth.currentUser.uid))
            setConversation(thisConv[0])
        })
    }

    useEffect(() => {
        getContact()
        getConversation()
    }, [])

    useEffect(() => {
        if(conversation){
            setRecent(conversation.messages[conversation.messages.length - 1])
        }
    }, [conversation])

    return (
        <li className="contact">
            {contact && <div className="wrap">
                <span className={`contact-status ${contact.status}`}></span>
                <img src={contact.profilePicture} alt="" />
                <div className="meta">
                    <p className="name">{contact.name}</p>
                    <p className="preview">{recent.sender === firebase.auth.currentUser.uid && <span>You:</span>} {recent.body}</p>
                </div>
            </div>}
        </li> 
    );
}

export default Contact;
