import React from 'react';

const Message = props => {
    return (
        <li className={props.received ? "replies" : "sent"}>
            <img src={props.imageLink} alt="" />
            <p>{props.message}</p>
        </li>
    );
}

export default Message;
