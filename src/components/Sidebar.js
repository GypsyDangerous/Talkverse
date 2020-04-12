import React, {useEffect, useState} from 'react';
import "./Sidebar.css"
import Contact from "./Contact"
import firebase from "../firebase"
import {withRouter, Link } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import AddCircleTwoToneIcon from '@material-ui/icons/AddCircleTwoTone'
import SettingsTwoToneIcon from '@material-ui/icons/SettingsTwoTone'
import ImageUpload from "./ImageUpload"

const SidebarHeader = withRouter(props => {
    const {currentUser} = props
    const [status, setStatus] = useState()

    useEffect(() => {
        setStatus(currentUser.status)
    }, [currentUser])

    const [statusExpanded, setStatusExpanded] = useState(false)
    const [headerExpanded, setHeaderExpanded] = useState(false)

    return (
        <div id="profile" className={headerExpanded ? "expanded" : ""} >
                <div className="wrap">
                    <ClickAwayListener onClickAway={() => setStatusExpanded(false)}>
                    <div className={`profile-img ${status}`}><Avatar alt={currentUser?.name?.toUpperCase()} src={currentUser.profilePicture} onClick={() => setStatusExpanded(s => !s)}  /></div>
                    </ClickAwayListener>
                    <div className="user">
                        <p className="display-name">{currentUser.name}</p>
                    <i className="fa fa-chevron-down expand-button" onClick={() => setHeaderExpanded(s => !s)} aria-hidden="true"></i>
                    </div>
                    <div id="status-options" className={statusExpanded ? "active" : ""}>
                        <ul>
                            {["online", "away", "busy", "offline"].map(sttus => (
                                <li 
                                    onClick={() => props.updateUser({status: sttus})} 
                                    id={`status-${sttus}`} 
                                    className={status === sttus ? "active" : ""}
                                    key={sttus}
                                >
                                    <span className="status-circle"></span><p>{sttus}</p>
                            </li>
                            ))}
                        </ul>
                    </div>
                <div id="expanded" className={headerExpanded ? "expanded" : ""}> 
                        <ImageUpload className="profile-preview" value={currentUser.profilePicture} center/>
                </div>
            </div>
        </div>
    )
})


const Sidebar = withRouter(props => {
    const [contacts, setContacts] = useState([])
    const [userData, setUserData] = useState({})

    const currentUser = firebase.auth.currentUser

    const getUser = async () => {
        const db = firebase.db
        if (currentUser) {
            db.collection("users").doc(currentUser.uid).onSnapshot(doc => {
                const userdata = { ...doc.data(), id: doc.id }
                setUserData(userdata)
            })
            db.collection("conversations").onSnapshot(snapshot => {
                const contacts = [].concat.apply([], snapshot.docs.map(doc => doc.data()).filter(doc => doc.members.includes(firebase.auth.currentUser.uid)).map(conv => conv.members))
                setContacts(!contacts ? [] : contacts.filter(id => id !== firebase.auth.currentUser.uid))
            })
        }
    }

    const updateUser = async ({status, twitter, github, instagram}) => {
        const db = firebase.db
        if(status){
            db.collection("users").doc(currentUser.uid).update({
                status: status
            })
        }
    }

    useEffect(() => {
        getUser() // eslint-disable-next-line
    }, [])

    const handleClick = (e) => {
        setAnchorEl(e.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const [anchorEl, setAnchorEl] = useState(null);

    return (
        <nav className="sidepanel">
            <SidebarHeader updateUser={updateUser} currentUser={userData}/>
            <div id="search">
                <label htmlFor="contact-search"><i className="fa fa-search" aria-hidden="true"></i><span style={{ opacity: 0 }}>This sentence is invisible</span></label>
                <input id="contact-search" type="text" placeholder="Search contacts..." />
            </div>
            <div id="contacts">
                <ul>
                    {contacts && contacts.map((c, i) => (
                        <Contact key={c} contact={c} />
                    ))}
                </ul>
            </div>
            <footer id="bottom-bar">
                <Link to="/conversations/new" id="addcontact" className="bottom-button">
                    <span className="footer-button-span">
                        <AddCircleTwoToneIcon/>
                    <span className="footertip"> New Chat</span>
                </span></Link>
                <button className="bottom-button" aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
                    <span className="footer-button-span">
                        <SettingsTwoToneIcon/> 
                        <span className="footertip">Settings</span>
                    </span>
                </button>
                <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    <MenuItem onClick={handleClose}>Profile</MenuItem>
                    <MenuItem onClick={handleClose}>My account</MenuItem>
                    <MenuItem onClick={props.toggleColorMode}>Toggle Dark/Light Mode</MenuItem>
                    <MenuItem onClick={async () => {await firebase.logout(); props.history.push("/")}}>Logout</MenuItem>
                </Menu>
            </footer>
        </nav>

    );
})

export default Sidebar;
