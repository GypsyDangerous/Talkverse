import React, { useState, useEffect, useRef } from 'react'
import "./Conversation.css"
import Avatar from '@material-ui/core/Avatar'
import firebase from "../firebase"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons"
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import MessageTwoToneIcon from '@material-ui/icons/MessageTwoTone';

import MessageInput from "./MessageInput"
import Message from "./Message"


const ConversationHeader = props => {
    const [recipient, setRecipient] = useState();

    useEffect(() => {
        firebase.db.collection("users").doc(props?.convInfo || " ").onSnapshot(snapshot => {
            setRecipient(snapshot.data())
        })
    }, [props]);

    return (
        <header className="contact-profile">
            <div className="conversation-header-img"><Avatar src={recipient?.profilePicture} alt={recipient?.name?.toUpperCase()} /></div>
            <p className="display-name">{recipient?.name}</p>
        </header>
    )
}

const Conversation = props => {
    const [conv, setConv] = useState()
    const [other, setOther] = useState()
    const [messages, setMessages] = useState()
    const [search, setSearch] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [contacts, setContacts] = useState([])

    const contentRef = useRef()

    useEffect(() => {
        if (props.isNew) {
            firebase.db.collection("conversations").onSnapshot(async snapshot => {
                const contacts = [].concat.apply([], snapshot.docs.map(doc => doc.data()).filter(doc => doc.members.includes(firebase.auth.currentUser.uid)).map(conv => conv.members))
                setContacts(!contacts ? [] : contacts.filter(id => id !== firebase.auth.currentUser.uid))
            })
            firebase.db.collection("users").onSnapshot(snapshot => {
                const users = snapshot.docs.map(doc => doc.data())
                setSearchResults(users)
            })
        }else{
            const id = (props.match.params.id)
            firebase.db.collection("conversations").onSnapshot(async snapshot => {
                try {
                    const mine = await snapshot.query.where(firebase.documentId(), "==", id).get()
                    const minedoc = mine.docs[0]
                    const me = {...minedoc.data(), convid: minedoc.id}


                    setConv(me)
                    const convs = snapshot.docs.filter(doc => doc.id === me?.convid)[0]
                    convs.ref.collection("messages").onSnapshot(async msgSnapshot => {
                        const sorted = await msgSnapshot.query.orderBy("sentAt", "asc")
                        const sortedData = await sorted.get()
                        const sortedMsgs = sortedData.docs.map(doc => { return { ...doc.data(), id: doc.id } })
                        setMessages(sortedMsgs);

                    })
                    setOther(me?.members?.filter(id => id !== firebase?.auth?.currentUser?.uid)[0])
                } catch (err) {
                    console.log(err.message)
                }
            })
        }
    }, [props])

    const createConv = async uid => {
        const me = firebase?.auth?.currentUser?.uid
        const members = [me, uid]
        await firebase.db.collection("conversations").add({ members })
    }
    
    return ( 
        <main className = "content">
            {!props.empty && !props.isNew &&
                <>
                    <ConversationHeader convInfo={other}/>
                    <div ref={contentRef} className="messages">
                        <ul> {messages?.map((message, i) => (
                            <Message message={message} key={i} previous={messages[Math.max(i-1, 0)]} next={messages[i+1]} index={i} conversation={conv}/>
                        ))
                        }
                        </ul>
                    </div >
                    <MessageInput onSend={() => (contentRef.current.scrollTop += 100000000000000 )} conversation={conv} />
                </>
            }
            {props.isNew && 
                <>
                    <header className="contact-profile">
                        <Tooltip arrow title="Back">
                            <IconButton onClick={() => props.history.goBack()} aria-label="back button">
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </IconButton>
                        </Tooltip>  
                        <h6 className="title">New Conversation</h6>
                    </header>
                    <div className="is-new">
                        <div className="contact-search-bar">
                            <label htmlFor="ct-search">Search:</label>
                            <input value={search} onChange={e => setSearch(e.target.value)} dir="auto" type="text" id="ct-search" className="contact-search-box" placeholder="Search for people by username" aria-label="search for new contacts by username or email"/>
                        </div>
                        <div className="contact-search-body">
                            <ul>
                                {!!search && searchResults.filter(r => {
                                    return !contacts.includes(r.uid) && r.uid !== firebase?.auth?.currentUser?.uid && r.name.toLowerCase().includes(search.toLowerCase())
                                }).map(s => (
                                    <div onClick={() => createConv(s.uid)} className="search-result">
                                        <div className={`img-container profile-img ${s.status}`}>
                                            <Avatar src={s.profilePicture}/>
                                        </div>
                                        <span className="colorMode-text">{s.name}</span>
                                    </div>
                                ))}
                            </ul>
                        </div>
                    </div>
                </>
            }
            {props.empty &&
                <div className="empty">
                    <MessageTwoToneIcon fontSize="large"/>
                    <h3>Your conversation will appear here</h3>
                    <h4>Find to people to chat with, by clicking 'new chat'</h4>
                </div>
            }
        </main>
    );
}


export default Conversation;
