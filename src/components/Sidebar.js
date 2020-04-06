import React, {useEffect, useState, useContext} from 'react';
import "./Sidebar.css"
import Contact from "./Contact"
import firebase from "../firebase"
import { NavLink, Redirect, withRouter } from 'react-router-dom';
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

const SidebarHeader = withRouter(props => {

    const classes = useStyles()

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
                    {/* <img id="profile-img" onClick={() => setStatusExpanded(s => !s)} src={currentUser.profilePicture} className={status} alt="" /> */}
                    <div id="profile-img" className={`${status}`}><Avatar  src={currentUser.profilePicture} onClick={() => setStatusExpanded(s => !s)}  /></div>
                    <div className="user">
                        <p>{currentUser.name}</p>
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


const Sidebar = props => {
    const [contacts, setContacts] = useState([])
    const [userData, setUserData] = useState({})
    const [convsersations, setConversations] = useState([])

    const currentUser = firebase.auth.currentUser

    const getUser = async () => {
        const db = firebase.db
        if (currentUser) {
            db.collection("users").doc(currentUser.uid).onSnapshot(doc => {
                const userdata = { ...doc.data(), id: doc.id }
                setUserData(userdata)
                setContacts(userdata.contacts)
            })
            db.collection("conversations").onSnapshot(snapshot => {
                console.log(snapshot.docs.map(doc => doc.data()).filter(doc => doc.members.includes(firebase.auth.currentUser.uid)))
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

    return (
        <div className="sidepanel">
            <SidebarHeader updateUser={updateUser} currentUser={userData}/>
            <div id="search">
                <label htmlFor=""><i className="fa fa-search" aria-hidden="true"></i></label>
                <input type="text" placeholder="Search contacts..." />
            </div>
            <div id="contacts">
                <ul>
                    {contacts.map((c, i) => (
                        <NavLink key={c} to={"/conversations/"+c.id} activeClassName="active" className="normalize"><Contact contact={c} /></NavLink>
                    ))}
                    
                    
                </ul>
            </div>
            <div id="bottom-bar">
                <button id="addcontact"><i className="fa fa-user-plus fa-fw" aria-hidden="true"></i> <span>Add contact</span></button>
                <button onClick={props.toggleColorMode} id="settings"><i className="fa fa-cog fa-fw" aria-hidden="true"></i> <span>Settings</span></button>
            </div>
        </div>

    );
}

export default Sidebar;
