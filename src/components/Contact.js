import React, { useEffect, useState } from 'react';
import firebase from "../firebase"

const Contact = props => {
    // console.log(props)
    const [contact, setContact] = useState()
    const [conversation, setConversation] = useState()
    const [recent, setRecent] = useState()

    const getContact = async () => {
        const id = props.contact.userid
        const db = firebase.firestore()
        const user = await db.collection("users").doc(id).get()
        setContact(user.data())
        
    }

    useEffect(() => {
        getContact()
    }, [])

    useEffect(() => {
        setConversation(props.contact.conversation)
    }, [props])

    useEffect(() => {
        if(conversation)
        setRecent(conversation[conversation.length-1])
    }, [conversation])

    return (
        <li className="contact">
            {contact && <div className="wrap">
                <span className={`contact-status ${contact.status}`}></span>
                <img src={contact.profilePicture} alt="" />
                <div className="meta">
                    <p className="name">{contact.name}</p>
                    <p className="preview">{recent.sent && <span>You:</span>} {recent.body}</p>
                </div>
            </div>}
        </li> 
    );
}

export default Contact;
