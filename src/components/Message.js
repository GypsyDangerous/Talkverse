import React, {useState, useEffect} from 'react';
import firebase from "../firebase"
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ModalImage from "react-modal-image"
import Linkify from 'react-linkify';
import punycode from "punycode";
import Avatar from '@material-ui/core/Avatar'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { CopyToClipboard } from 'react-copy-to-clipboard';

const componentDecorator = (href, text, key) => (
    <a href={href} key={key} target="_blank" rel="noopener noreferrer">
        {punycode.toASCII(text)}
    </a>
);

const Message = ({ message, index, conversation, previous, next }) => {
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
        if (message.sender !== firebase?.auth?.currentUser?.uid) {
            return
        }
        try {
            await firebase.db.collection("conversations").doc(conversation.convid).collection("messages").doc(message.id).delete()
            const messages = await firebase.db.collection("conversations").doc(conversation.convid).collection("messages").orderBy("sentAt","desc").get()
            const msgs = messages.docs.map(doc => { return { ...doc.data(), id: doc.id } })
            await firebase.db.collection("conversations").doc(conversation.convid).update({
                newest: msgs[0]
            })
        } catch (err) { console.log(err.message) }
    }

    const regex1 = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
    // const regex2 = /(\u00a9|\u00ae | [\u2000 -\u3300] |\ud83c[\ud000 -\udfff]|\ud83d[\ud000 -\udfff]|\ud83e[\ud000 -\udfff])/g

    return (
        <li className={message.sender === firebase.auth.currentUser.uid ? "sent" : "replies"} >
            {multi &&
                <div className="senderimg">
                    <Avatar alt={message?.sender?.toUpperCase()} src={message.senderImg} />
                </div>}
            <pre className={multi ? "" : "nth-msg"} style={{ fontSize: message?.body?.match(regex1)?.length === message?.body?.length / 2 ? "38px" : "" }}>
                <Linkify componentDecorator={componentDecorator}>{message.body}</Linkify>
                {message?.attachments?.map((file, i) => (
                    <ModalImage className={message?.body ? "text-img attachment" : "attachment"} key={i} large={file} small={file} alt={"attachment" + (i + index * 2).toString(16)} />
                ))}
            </pre>
            <div className={`svg-container ${multi ? "" : "nth-msg"}`}><FontAwesomeIcon icon={faEllipsisV} aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick} /></div>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={() => { handleDelete(); handleClose() }}>Delete</MenuItem>
                <MenuItem onClick={handleClose}>
                    <CopyToClipboard text={message?.body}>
                        <span>Copy Text</span>
                    </CopyToClipboard>
                </MenuItem>
            </Menu>
        </li >
    )
}
export default Message;
