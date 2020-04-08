import React, { useState, useEffect, useRef } from 'react';
import "./Conversation.css"
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import { deepOrange } from '@material-ui/core/colors';
import firebase from "../firebase"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import  { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {faPaperPlane, faArrowLeft} from "@fortawesome/free-solid-svg-icons"
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';


const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    orange: {
        color: theme.palette.getContrastText(deepOrange[500]),
        backgroundColor: deepOrange[500],
    },
}));

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
    const fileRef = useRef()
    const [files, setFiles] = useState([])

   

    const InputHandler = e => {
        setMessage(e.target.value)
    }

    const sendHandler = async e => {

        e.preventDefault()

        if((!message || message.length === 0) && files.length==0) return

        const sender = (await firebase.db.collection("users").doc(firebase.auth.currentUser.uid).get()).data()

        const newMessage = {
            sender: firebase.auth.currentUser.uid,
            body: message,
            senderImg: sender.profilePicture || "",
            attachments: files,
            mid: [...Array(10)].map(i => (~~(Math.random() * 36)).toString(36)).join('')
        }

        props.conversation.messages.push(newMessage)
        const New = (props.conversation)
        await firebase.db.collection("conversations").doc(props.conversation.uuid).set(New)
        setMessage("")
        setFiles([])
        props.onSend()
    }

    const filePickHandler = async e => {
        const file = e.target.files[0]
        
        if(file){
            // console.log(file)
            const storageRef = firebase.storage.ref();

            // // Create a reference to 'mountains.jpg'
            const fileRef = storageRef.child([...Array(5)].map(_ => (Math.random() * 36 | 0).toString(36)).join``+file.name);

            await fileRef.put(file)


            const url = await fileRef.getDownloadURL()
            setFiles(f => [...f, url])
        }
    }

    return (
        <div class="message-input">
            <form class="wrap" onSubmit={sendHandler}>
                <input type="text" onChange={InputHandler} value={message} placeholder="Write your message..." />
                <input ref={fileRef} onChange={filePickHandler} type="file" style={{display: "none"}}/>
                <div onClick={() => fileRef.current.click()} class="attachment-container"><i class="fa fa-paperclip attachment" aria-hidden="true"></i></div>
                <button type="submit" class="submit"><FontAwesomeIcon icon={faPaperPlane}/><span style={{ display: "none" }}>T</span></button>
            </form>
        </div>
    )
}

const Message = ({message, index, conversation, previous}) => {
    const [anchorEl, setAnchorEl] = useState(null)
    const [Emoji, setEmoji] = useState([])

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleDelete = async () => {
        if(message.sender !== firebase?.auth?.currentUser?.uid)return
        try{
            await firebase.db.collection("conversations").doc(conversation.uuid).set({ ...conversation, messages: conversation.messages.filter(m => m.mid !== message.mid) })
        }catch(err){}
    }
   
    const regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;

    return (
        <li className={message.sender === firebase.auth.currentUser.uid ? "sent" : "replies"} >
            {(previous.sender !== message.sender || index-1 < Infinity) && <div className="senderimg">< Avatar alt={firebase?.auth?.currentUser?.displayName?.toUpperCase()} src={message.senderImg} /> </div>}
            <p style={{
                fontSize: message?.body?.match(regex)?.length == message?.body?.length/2 ? "38px": ""
            }}> 
                {message.body}
                {message.body && <br/>}
                <span style={{fontSize: "16px"}}>{message.attachments && message.attachments.map((file, i) => (
                    <img className="attachment" key={file} src={file} alt={"attachment" + (i + index*2).toString(16)}/>
                ))}
                </span>
            </p>
            <div className="svg-container"><FontAwesomeIcon icon={faEllipsisV} aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick} /></div>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={handleDelete}>Delete</MenuItem>
                <MenuItem onClick={handleClose}>My account</MenuItem>
                <MenuItem onClick={handleClose}>Logout</MenuItem>
            </Menu>
        </li >
    )
}


const Conversation = (props => {
    const [conv, setConv] = useState()
    const [other, setOther] = useState()

    const contentRef = useRef()

    useEffect(() => {
        const id = (props.match.params.id)
        firebase.db.collection("conversations").onSnapshot(snapshot => {
            const me = snapshot.docs.map(doc => doc.data()).filter(doc => doc.id === id)[0]
            setConv(me)
            setOther(me?.members?.filter(id => id !== firebase?.auth?.currentUser?.uid)[0])
        })
    }, [props])
    
    return ( 
    <div  className = "content" >
        {!props.empty && !props.isNew &&
            <>
                <ConversationHeader convInfo={other}/>
                <div ref={contentRef} className="messages">
                    <ul> {conv && conv.messages.map((message, i) => (
                        <Message message={message} previous={conv.messages[Math.max(i-1, 0)]} index={i} conversation={conv}/>
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
            </>
        }
        
        </div>
    );
})


export default Conversation;
