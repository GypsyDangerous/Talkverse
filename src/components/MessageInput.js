import React, { useState} from 'react'
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import ImageIcon from '@material-ui/icons/Image';
import SendTwoToneIcon from '@material-ui/icons/SendTwoTone';
import Picker from 'emoji-picker-react';
import firebase from "../firebase"
import Tooltip from '@material-ui/core/Tooltip'
import { useCallback } from 'react';

const MessageInput = props => {
    const [message, setMessage] = useState("")
    const [files, setFiles] = useState([])
    const [previews, setPreviews] = useState()
    const [sending, setSending] = useState(false)
    const [open, setOpen] = useState(false)

    const InputHandler = useCallback(e => {
        setMessage(e.target.value)
    }, [setMessage])

    const sendHandler = useCallback(async e => {
        e.preventDefault()
        if (sending) return
        if (files.length <= 0) {
            if (!message || message.length === 0) {

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
            mid: [...Array(10)].map(i => (Math.random() * 36 | 0).toString(36)).join(''),
            sentAt: Date.now()
        }
        setMessage("")
        setFiles([])
        setOpen(false)
        
        setSending(false)
        await firebase.db.collection("conversations").doc(props.conversation.convid).collection("messages").add(newMessage)
        await firebase.db.collection("conversations").doc(props.conversation.convid).update({
            newest: newMessage
        })
        props.onSend()
    },[files, message, props, sending])

    const filePickHandler = useCallback(async e => {
        const file = e.target.files[0]
        if (file) {
            console.log(file.type)
            const storageRef = firebase.storage.ref();
            const fileRef = storageRef.child([...Array(10)].map(_ => (Math.random() * 36 | 0).toString(36)).join`` + file.name);
            await fileRef.put(file)
            const url = await fileRef.getDownloadURL()
            setFiles(f => [...f, {url, type:file.type}])
        }
    },[])

    const onEmojiClick = useCallback((event, emojiObject) => {
        setMessage(msg => msg + emojiObject.emoji);
    }, [])

    const disableEnter = useCallback(e => {
        if (e.keyCode === 13 && !e.shiftKey)
        {
            sendHandler(e)
        }
    }, [sendHandler])


    const toggleOpen = useCallback(() => setOpen(e => !e), [])

    const closeHandler = useCallback(() => setOpen(false), [])

    return (
        <ClickAwayListener onClickAway={closeHandler}>
            <div className="message-input">
                {open && <Picker onEmojiClick={onEmojiClick} />}
                <form className="wrap" onSubmit={sendHandler}>
                    <textarea onKeyDown={disableEnter} dir="auto" rows="1" className="input" autoFocus type="text" onChange={InputHandler} value={message} placeholder="Write your message..." />
                    <Tooltip arrow title="Open Emoji Picker">
                        <span className="attachment-container emoji-picker-button" onClick={toggleOpen}><span role="img" aria-label="emoji picker button">😀</span></span>
                    </Tooltip>
                    <input onChange={filePickHandler} id="attachment-loader" type="file" style={{ display: "none" }} />
                    <Tooltip arrow title="add an image">
                        <label htmlFor="attachment-loader" className="attachment-container"><ImageIcon /></label>
                    </Tooltip>
                    <button type="submit" disabled={message.length <= 0 && files.length <= 0} className="submit"><SendTwoToneIcon /></button>
                </form>
            </div>
        </ClickAwayListener>
    )
}

export default MessageInput