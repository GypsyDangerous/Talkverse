import React, {useEffect, useState, useContext} from 'react';
import "./Sidebar.css"
import Contact from "./Contact"
import firebase from "../firebase"
import { NavLink, Redirect, withRouter, Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import { deepOrange } from '@material-ui/core/colors';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';

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
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(2, 4, 3),
        width: "50%",
        height: "80%",
        borderRadius: "1rem",
        outline: "none"
    },
}));

const SidebarHeader = withRouter(props => {

    const classes = useStyles()

    const {currentUser} = props
    const [status, setStatus] = useState()

    useEffect(() => {
        setStatus(currentUser.status)
    }, [currentUser])

    const [statusExpanded, setStatusExpanded] = useState(false)
    const [headerExpanded, setHeaderExpanded] = useState(false)

    // const hex = "🔥".codePointAt().toString(16)
    // console.log(hex)

    return (
        
        <div id="profile" className={headerExpanded ? "expanded" : ""} >
                <div className="wrap">
                {/* <img src={process.env.PUBLIC_URL + `/128/${hex}.png`}/> */}
                    <ClickAwayListener onClickAway={() => setStatusExpanded(false)}>
                        <div id="profile-img" className={`${status}`}><Avatar alt={currentUser?.name?.toUpperCase()} src={currentUser.profilePicture} onClick={() => setStatusExpanded(s => !s)}  /></div>
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
                                    className={status == sttus ? "active" : ""}
                                    key={sttus}
                                >
                                    <span className="status-circle"></span><p>{sttus}</p>
                            </li>
                            ))}
                        </ul>
                    </div>
                <div id="expanded" className={headerExpanded ? "expanded" : ""}> 
                        <label htmlFor="twitter"><i className="fa fa-facebook fa-fw" aria-hidden="true"></i></label>
                        <input name="twitter" type="text" value="mikeross" />
                        <label htmlFor="twitter"><i className="fa fa-twitter fa-fw" aria-hidden="true"></i></label>
                        <input name="twitter" type="text" value="ross81" />
                        <label htmlFor="twitter"><i className="fa fa-instagram fa-fw" aria-hidden="true"></i></label>
                        <input name="twitter" type="text" value="mike.ross" />
                        <button onClick={async () => firebase.logout().then(() => props.history.push("/login"))}>Logout</button>
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
                // setContacts(userdata.contacts)
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
        getUser()
    }, [])

    const handleClick = (e) => {
        setAnchorEl(e.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const [anchorEl, setAnchorEl] = useState(null);

    const classes = useStyles()

    return (
        <header className="sidepanel">
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
            <div id="bottom-bar">
                <Link to="/conversations/new" id="addcontact"><i className="fa fa-user-plus fa-fw" aria-hidden="true"></i><span className="footertip"> New Chat</span></Link>
                <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
                    <i className="fa fa-cog fa-fw" aria-hidden="true"></i> <span className="footertip">Settings</span>
                </Button>
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
            </div>
        </header>

    );
})

export default Sidebar;
