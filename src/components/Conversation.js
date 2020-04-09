import React, { useState, useEffect, useRef } from 'react'
import "./Conversation.css"
import Avatar from '@material-ui/core/Avatar'
import firebase from "../firebase"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import {faPaperPlane, faArrowLeft} from "@fortawesome/free-solid-svg-icons"
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import ModalImage from "react-modal-image"
import Linkify from 'react-linkify';
import punycode from "punycode";

const componentDecorator = (href, text, key) => (
    <a href={href} key={key} target="_blank" rel="noopener noreferrer">
        {punycode.toASCII(text)}
    </a>
);

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
        <div className="contact-profile">
            <div className="conversation-header-img"><Avatar src={recipient?.profilePicture} alt={recipient?.name?.toUpperCase()} /></div>
            <p className="display-name">{recipient?.name}</p>
            <div className="social-media">
                <i className="fa fa-facebook" aria-hidden="true"></i>
                <i className="fa fa-twitter" aria-hidden="true"></i>
                <i className="fa fa-instagram" aria-hidden="true"></i>
            </div>
        </div>
    )
}

const MessageInput = props => {
    const [message, setMessage] = useState("")
    const [previews, setPreviews] = useState([])
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
        
        await firebase.db.collection("conversations").doc(props.conversation.uuid).collection("messages").add(newMessage)
        setMessage("")
        setFiles([])
        props.onSend()
        setSending(false)
    }

    const filePickHandler = async e => {
        const file = e.target.files[0]
        if(file){
            const storageRef = firebase.storage.ref();
            const fileRef = storageRef.child([...Array(5)].map(_ => (Math.random() * 36 | 0).toString(36)).join``+file.name);
            await fileRef.put(file)
            const url = await fileRef.getDownloadURL()
            setFiles(f => [...f, url])
        }
    }

    return (
        <div className="message-input">
            <form className="wrap" onSubmit={sendHandler}>
                <input type="text" onChange={InputHandler} value={message} placeholder="Write your message..." />
                <input onChange={filePickHandler} id="attachment-loader" type="file" style={{display: "none"}}/>
                <label htmlFor="attachment-loader" className="attachment-container"><span style={{ display: "none" }}>T</span><i className="fa fa-paperclip attachment" aria-hidden="true"></i></label>
                <button type="submit" className="submit"><FontAwesomeIcon icon={faPaperPlane}/><span style={{ display: "none" }}>T</span></button>
            </form>
        </div>
    )
}

const Message = ({message, index, conversation, previous}) => {
    const [anchorEl, setAnchorEl] = useState(null)
   
    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleDelete = async () => {
        if(message.sender !== firebase?.auth?.currentUser?.uid)return
        try{
            console.log("hi")
            await firebase.db.collection("conversations").doc(conversation.uuid).collection("messages").doc(message.id).delete()
        }catch(err){console.log(err.message)}
    }

    const regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;

    return (
        <li className={message.sender === firebase.auth.currentUser.uid ? "sent" : "replies"} >
            {(previous.sender !== message.sender || index-1 < Infinity) && 
            <div className="senderimg">
                <Avatar alt={message?.sender?.toUpperCase()} src={message.senderImg} /> 
            </div>}
            <p style={{fontSize: message?.body?.match(regex)?.length === message?.body?.length/2 ? "38px": ""}}> 
                <Linkify componentDecorator={componentDecorator}>{message.body}</Linkify>
                {message?.attachments?.map((file, i) => (
                    <>
                        <ModalImage className="attachment" key={file} large={file} small={file} alt={"attachment" + (i + index*2).toString(16)}/>
                    </>
                ))}
            </p>
            <div className="svg-container"><FontAwesomeIcon icon={faEllipsisV} aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick} /></div>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={() => {handleDelete();handleClose()}}>Delete</MenuItem>
                <MenuItem onClick={handleClose}>My account</MenuItem>
                <MenuItem onClick={handleClose}>Logout</MenuItem>
            </Menu>
        </li >
    )
}


const Conversation = (props => {
    const [conv, setConv] = useState()
    const [other, setOther] = useState()
    const [messages, setMessages] = useState()

    const contentRef = useRef()

    useEffect(() => {
        const id = (props.match.params.id)
        
        firebase.db.collection("conversations").onSnapshot(async snapshot => {
            try {
            const me = snapshot.docs.map(doc => {return {...doc.data(), convid: doc.id}}).filter(doc => doc.id === id)[0]
            setConv(me)
            const convs = snapshot.docs.filter(doc => doc.id === me?.convid)[0]
            convs.ref.collection("messages").onSnapshot(msgSnapshot => {
                const msgs = msgSnapshot.docs.map(doc => {return {...doc.data(), id: doc.id}})
                setMessages(msgs.sort((a, b) => a.sentAt-b.sentAt))
            })
            setOther(me?.members?.filter(id => id !== firebase?.auth?.currentUser?.uid)[0])
            } catch (err) { }
        })
        
    }, [props])
    
    return ( 
    <div  className = "content" >
        {!props.empty && !props.isNew &&
            <>
                <ConversationHeader convInfo={other}/>
                <div ref={contentRef} className="messages">
                    <ul> {messages?.map((message, i) => (
                        <Message message={message} key={i} previous={messages[Math.max(i-1, 0)]} index={i} conversation={conv}/>
                    ))
                    }
                    </ul>
                </div >
                <MessageInput onSend={() => (contentRef.current.scrollTop += 100000000000000 )} conversation={conv} />
            </>
        }
        {props.isNew && 
            <>
                <div className="contact-profile">
                    <Tooltip arrow title="Back">
                        <IconButton onClick={() => props.history.goBack()} aria-label="back button">
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </IconButton>
                    </Tooltip>  
                    <h6 className="title">New Conversation</h6>
                </div>
                <div className="is-new">
                    <div className="contact-search">
                        <label htmlFor="ct-search">Search:</label>
                        <input dir="auto" type="text" id="ct-search" className="contact-search-box" placeholder="Search for people by username or email" aria-label="search for new contacts by username or email"/>
                    </div>
                </div>
            </>
        }
        </div>
    );
})


export default Conversation;
