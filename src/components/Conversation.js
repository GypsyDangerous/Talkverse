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
import Picker from 'emoji-picker-react';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import ImageIcon from '@material-ui/icons/Image';
import SendIcon from '@material-ui/icons/Send'
import SendTwoToneIcon from '@material-ui/icons/SendTwoTone';

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
    // const [previews, setPreviews] = useState([])
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
        setOpen(false)
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

    const onEmojiClick = (event, emojiObject) => {
        console.log(emojiObject)
        setMessage(msg => msg + emojiObject.emoji);
    }

    const [open, setOpen] = useState(false)

    return (
        <ClickAwayListener onClickAway={() => setOpen(false)}>
            <div className="message-input">
                {open && <Picker onEmojiClick={onEmojiClick} />}
                <form className="wrap" onSubmit={sendHandler}>
                    <input type="text" onChange={InputHandler} value={message} placeholder="Write your message..." />
                    <label className="attachment-container emoji-picker-button" onClick={() => setOpen(o => !o)}>😀</label>
                    <input onChange={filePickHandler} id="attachment-loader" type="file" style={{display: "none"}}/>
                    <label htmlFor="attachment-loader" className="attachment-container"><ImageIcon/></label>
                    <button type="submit" className="submit"><SendTwoToneIcon/></button>
                </form>
            </div>
        </ClickAwayListener>
    )
}

const Message = ({message, index, conversation, previous, next}) => {
    const [anchorEl, setAnchorEl] = useState(null)
    const [multi, setMulti] = useState(false)
   
    useEffect(() => {
        setMulti((next?.sender !== message.sender))
    }, [previous, message, next])

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleDelete = async () => {
        if(message.sender !== firebase?.auth?.currentUser?.uid)return
        try{
            await firebase.db.collection("conversations").doc(conversation.uuid).collection("messages").doc(message.id).delete()
        }catch(err){console.log(err.message)}
    }

    const regex1 = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
    const regex2 = /(\u00a9|\u00ae | [\u2000 -\u3300] |\ud83c[\ud000 -\udfff]|\ud83d[\ud000 -\udfff]|\ud83e[\ud000 -\udfff])/g
    
    return (
        <li className={message.sender === firebase.auth.currentUser.uid ? "sent" : "replies"} >
            {multi && 
            <div className="senderimg">
                <Avatar alt={message?.sender?.toUpperCase()} src={message.senderImg} /> 
            </div>}
            <p className={multi ? "" : "nth-msg"} style={{ fontSize: message?.body?.match(regex1)?.length === message?.body?.length/2 ? "38px": ""}}> 
                <Linkify componentDecorator={componentDecorator}>{message.body}</Linkify>
                {message?.attachments?.map((file, i) => (
                    <>
                        <ModalImage className="attachment" key={file} large={file} small={file} alt={"attachment" + (i + index*2).toString(16)}/>
                    </>
                ))}
            </p>
            <div className={`svg-container ${multi ? "" : "nth-msg"}`}><FontAwesomeIcon icon={faEllipsisV} aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick} /></div>
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
