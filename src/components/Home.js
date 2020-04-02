import React from 'react';
import Sidebar from './Sidebar';
import Conversation from './Conversation';
import { Route } from 'react-router';

const Home = props => {
    return (
        <div>
            <Sidebar toggleColorMode={props.toggleColorMode}/>
            <Route><Conversation /></Route>
        </div>
    );
}

export default Home;
