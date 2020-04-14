import React, { useEffect, useState } from 'react';
import firebase from "../firebase"
import { NavLink } from 'react-router-dom';
import { Avatar } from '@material-ui/core';

const Contact = props => {
    const [contact, setContact] = useState()
    const [conversation, setConversation] = useState()
    const recent = props.recent

    const getContact = async () => {
        const id = props.contact
        const db = firebase.db
        db.collection("users").doc(id).onSnapshot(snapshot => {
            setContact(snapshot.data())
        })
    }

    const getConversation = async () => {
        firebase.db.collection("conversations").onSnapshot(snapshot => {
            const thisConv = snapshot.docs.map(doc => {return {...doc.data(), convid: doc.id}}).filter(conv => conv.members.includes(props.contact) && conv.members.includes(firebase.auth.currentUser.uid))[0]
            setConversation(thisConv)
        })
    }

    useEffect(() => {
        getContact()
        getConversation() // eslint-disable-next-line
    }, [props])

    return (
        <NavLink to={"/conversations/" + conversation?.convid} activeClassName="active" className="normalize">
            <li className="contact">
                {contact && <div className="wrap">
                    <span className={`contact-status ${contact.status}`}></span>
                    <div className="img-container">
                        <Avatar src={contact.profilePicture} alt={contact.name + " Profile Picture"} />
                    </div>
                    <div style={{display: "inline-block"}} className="meta">
                        <p className="display-name name">{contact.name}</p>
                        {recent && <p className="preview">
                            {recent?.sender === firebase?.auth?.currentUser?.uid && <span>You: </span>} 
                            {recent?.attachments?.length === 0 ? recent?.body : "Picture"}
                        </p>}
                    </div>
                </div>}
            </li> 
        </NavLink>
    );
}

export default Contact;
