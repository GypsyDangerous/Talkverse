import React, { useState, useEffect, useRef } from 'react'
import "./Conversation.css"
import Avatar from '@material-ui/core/Avatar'
import firebase from "../firebase"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons"
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import ImageIcon from '@material-ui/icons/Image';
import SendTwoToneIcon from '@material-ui/icons/SendTwoTone';
import MessageTwoToneIcon from '@material-ui/icons/MessageTwoTone';
import Picker from 'emoji-picker-react';

import Message from "./Message"



const ConversationHeader = props => {

    const [recipient, setRecipient] = useState();

    useEffect(() => {
        if(props.convInfo){
            firebase.db.collection("users").doc(props.convInfo).onSnapshot(snapshot => {
                setRecipient(snapshot.data())
            })
        }
    }, [props]);


    return (
        <header className="contact-profile">
            <div className="conversation-header-img"><Avatar src={recipient?.profilePicture} alt={recipient?.name?.toUpperCase()} /></div>
            <p className="display-name">{recipient?.name}</p>
            {/* <div className="social-media">
                <i className="fa fa-facebook" aria-hidden="true"></i>
                <i className="fa fa-twitter" aria-hidden="true"></i>
                <i className="fa fa-instagram" aria-hidden="true"></i>
            </div> */}
        </header>
    )
}

const MessageInput = props => {
    const [message, setMessage] = useState("")
    const [files, setFiles] = useState([])
    const [sending, setSending] = useState(false)

    const InputHandler = e => {
        setMessage(e.target.value)
    }

    const sendHandler = async e => {
        e.preventDefault()
        if(sending)return
        
        if(files.length <= 0){
            if(!message || message.length === 0) {

                return
            }
        }
        setSending(true)
        const sender = (await firebase.db.collection("users").doc(firebase.auth.currentUser.uid).get()).data()

        const newMessage = {
            sender: firebase.auth.currentUser.uid,
            body: message,
            senderImg: sender.profilePicture || "",
            attachments: files,
            mid: [...Array(10)].map(i => (~~(Math.random() * 36)).toString(36)).join(''),
            sentAt: Date.now()
        }

        await firebase.db.collection("conversations").doc(props.conversation.convid).collection("messages").add(newMessage)
        setMessage("")
        setFiles([])
        props.onSend()
        setOpen(false)
        setSending(false)
    }

    const filePickHandler = async e => {
        const file = e.target.files[0]
        if(file){
            const storageRef = firebase.storage.ref();
            const fileRef = storageRef.child([...Array(10)].map(_ => (Math.random() * 36 | 0).toString(36)).join``+file.name);
            await fileRef.put(file)
            const url = await fileRef.getDownloadURL()
            setFiles(f => [...f, url])
        }
    }

    const onEmojiClick = (event, emojiObject) => {
        setMessage(msg => msg + emojiObject.emoji);
    }

    const [open, setOpen] = useState(false)

    return (
        <ClickAwayListener onClickAway={() => setOpen(false)}>
            <div className="message-input">
                {open && <Picker onEmojiClick={onEmojiClick} />}
                <form className="wrap" onSubmit={sendHandler}>
                    <input type="text" onChange={InputHandler} value={message} placeholder="Write your message..." />
                    <Tooltip arrow title="Open Emoji Picker">
                        <span className="attachment-container emoji-picker-button" onClick={() => setOpen(o => !o)}><span role="img" aria-label="emoji picker button">😀</span></span>
                    </Tooltip>
                    <input onChange={filePickHandler} id="attachment-loader" type="file" style={{display: "none"}}/>
                    <Tooltip arrow title="add an image">
                        <label htmlFor="attachment-loader" className="attachment-container"><ImageIcon/></label>
                    </Tooltip>
                    <button type="submit" disabled={message.length <= 0 && files.length <= 0} className="submit"><SendTwoToneIcon/></button>
                </form>
            </div>
        </ClickAwayListener>
    )
}



const Conversation = (props => {
    const [conv, setConv] = useState()
    const [other, setOther] = useState()
    const [messages, setMessages] = useState()
    const [search, setSearch] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [contacts, setContacts] = useState([])

    const contentRef = useRef()

    useEffect(() => {
        const id = (props.match.params.id)
        firebase.db.collection("conversations").onSnapshot(async snapshot => {
            try {
                
                const me = snapshot.docs.map(doc => {return {...doc.data(), convid: doc.id}}).filter(doc => doc.convid === id)[0]
                setConv(me)
                const convs = snapshot.docs.filter(doc => doc.id === me?.convid)[0]
                convs.ref.collection("messages").onSnapshot(msgSnapshot => {
                    const msgs = msgSnapshot.docs.map(doc => {return {...doc.data(), id: doc.id}})
                    setMessages(msgs.sort((a, b) => a.sentAt-b.sentAt))
                })
                setOther(me?.members?.filter(id => id !== firebase?.auth?.currentUser?.uid)[0])
            } catch (err) { }
        })

        if (props.isNew) {
            (async () => {
                firebase.db.collection("conversations").onSnapshot(async snapshot => {
                    const contacts = [].concat.apply([], snapshot.docs.map(doc => doc.data()).filter(doc => doc.members.includes(firebase.auth.currentUser.uid)).map(conv => conv.members))
                    setContacts(!contacts ? [] : contacts.filter(id => id !== firebase.auth.currentUser.uid))
                })
                firebase.db.collection("users").onSnapshot(snapshot => {
                    const users = snapshot.docs.map(doc => doc.data())
                    setSearchResults(users)
                })
            })()
        }
    }, [props])

    const createConv = async uid => {
        const me = firebase?.auth?.currentUser?.uid
        const members = [me, uid]
        const conv = {members}
        await firebase.db.collection("conversations").add(conv)
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
                <>
                    <div className="empty">
                        <MessageTwoToneIcon fontSize="large"/>
                        <h3>Your conversation will appear here</h3>
                        <h4>Find to people to chat with, by clicking 'new chat'</h4>
                    </div>
                </>
            }
        </main>
    );
})


export default Conversation;
