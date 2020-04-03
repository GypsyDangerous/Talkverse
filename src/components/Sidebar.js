import React, {useEffect, useState, useContext} from 'react';
import "./Sidebar.css"
import {AuthContext} from "../contexts/AuthContext"
import Contact from "./Contact"
import firebase from "../firebase"
import { NavLink } from 'react-router-dom';

const SidebarHeader = props => {

    const {currentUser} = props
    const [status, setStatus] = useState()

    useEffect(() => {
        setStatus(currentUser.status)
    }, [currentUser])

    const [statusExpanded, setStatusExpanded] = useState(false)
    const [headerExpanded, setHeaderExpanded] = useState(false)

    return (
        <div id="profile" className={headerExpanded && "expanded"} >
                <div className="wrap">
                    <img id="profile-img" onClick={() => setStatusExpanded(s => !s)} src={currentUser.profilePicture} className={status} alt="" />
                    <p>{currentUser.name}</p>
                    <i className="fa fa-chevron-down expand-button" onClick={() => setHeaderExpanded(s => !s)} aria-hidden="true"></i>
                    <div id="status-options" className={statusExpanded && "active"}>
                        <ul>
                            {["online", "away", "busy", "offline"].map(sttus => (
                                <li 
                                    onClick={() => props.updateUser({status: sttus})} 
                                    id={`status-${sttus}`} 
                                    className={status == sttus && "active"}
                                    key={sttus}
                                >
                                    <span className="status-circle"></span><p>{sttus}</p>
                            </li>
                            ))}
                        </ul>
                    </div>
                <div id="expanded" className={headerExpanded && "expanded"}> 
                        <label htmlFor="twitter"><i className="fa fa-facebook fa-fw" aria-hidden="true"></i></label>
                        <input name="twitter" type="text" value="mikeross" />
                        <label htmlFor="twitter"><i className="fa fa-twitter fa-fw" aria-hidden="true"></i></label>
                        <input name="twitter" type="text" value="ross81" />
                        <label htmlFor="twitter"><i className="fa fa-instagram fa-fw" aria-hidden="true"></i></label>
                        <input name="twitter" type="text" value="mike.ross" />
                        <button onClick={() => firebase.auth().signOut()}>Logout</button>
                    </div>
                </div>
            </div>
    )
}

const Sidebar = props => {

    const { currentUser } = useContext(AuthContext)

    const [contacts, setContacts] = useState([])
    const [userData, setUserData] = useState({})

    const getUser = async () => {
        const db = firebase.firestore()
        if (currentUser) {
            db.collection("users").doc(currentUser.uid).collection("contacts").onSnapshot(snapshot => {
                const ctcs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
                setContacts(ctcs)
            })
            db.collection("users").doc(currentUser.uid).onSnapshot(doc => {
                const userdata = { ...doc.data(), id: doc.id }
                setUserData(userdata)
            })
        }
    }

    const updateUser = async ({status, twitter, github, instagram}) => {
        const db = firebase.firestore()
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
