import React from 'react';
import "./Conversation.css"
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import { deepOrange } from '@material-ui/core/colors';

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
    return (
        <div className="contact-profile">
            {/* <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" /> */}
            <Avatar src="http://emilcarlsson.se/assets/harveyspcter.png" alt="H" className={`conversation-header-img`}/>
            <p>Harvey Specter</p>
            <div className="social-media">
                <i className="fa fa-facebook" aria-hidden="true"></i>
                <i className="fa fa-twitter" aria-hidden="true"></i>
                <i className="fa fa-instagram" aria-hidden="true"></i>
            </div>
        </div>
    )
}

const MessageInput = props => {
    return (
        <div className="message-input">
            <div className="wrap">
                <input type="text" placeholder="Write your message..." />
                <div className="attachment-container"><i className="fa fa-paperclip attachment" aria-hidden="true"></i></div>
                <button className="submit"><i className="fa fa-paper-plane" aria-hidden="true"></i></button>
            </div>
        </div>
    )
}


const Conversation = props => {
    return (
        <div className="content">
            <ConversationHeader/>
            {!props.empty && <div className="messages">
                <ul>
                    <li className="sent">
                        <img src="http://emilcarlsson.se/assets/mikeross.png" alt="" />
                        <p>How the hell am I supposed to get a jury to believe you when I am not even sure that I do?!</p>
                    </li>
                    <li className="replies">
                        <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
                        <p>When you're backed against the wall, break the god damn thing down.</p>
                    </li>
                    <li className="replies">
                        <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
                        <p>Excuses don't win championships.</p>
                    </li>
                    <li className="sent">
                        <img src="http://emilcarlsson.se/assets/mikeross.png" alt="" />
                        <p>Oh yeah, did Michael Jordan tell you that?</p>
                    </li>
                    <li className="replies">
                        <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
                        <p>No, I told him that.</p>
                    </li>
                    <li className="replies">
                        <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
                        <p>What are your choices when someone puts a gun to your head?</p>
                    </li>
                    <li className="sent">
                        <img src="http://emilcarlsson.se/assets/mikeross.png" alt="" />
                        <p>What are you talking about? You do what they say or they shoot you.</p>
                    </li>
                    <li className="replies">
                        <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
                        <p>Wrong. You take the gun, or you pull out a bigger one. Or, you call their bluff. Or, you do any one of a hundred and forty six other things.</p>
                    </li>
                </ul>
            </div>}
            <div className="message-input">
                <div className="wrap">
                    <input type="text" placeholder="Write your message..." />
                    <i className="fa fa-paperclip attachment" aria-hidden="true"></i>
                    <button className="submit"><i className="fa fa-paper-plane" aria-hidden="true"></i></button>
                </div>
            </div>
        </div>
    );
}

export default Conversation;
