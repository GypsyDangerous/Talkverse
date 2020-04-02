import React from 'react';

const Contact = props => {

    const {contact} = props
    const {conversation} = contact
    const recent = conversation[conversation.length-1]

    return (
        <li class="contact">
            <div class="wrap">
                <span class={`contact-status ${contact.status}`}></span>
                <img src={contact.profilePicture} alt="" />
                <div class="meta">
                    <p class="name">{contact.name}</p>
                    <p class="preview">{recent.sent && <span>You:</span>} {recent.body}</p>
                </div>
            </div>
        </li> 
    );
}

export default Contact;
