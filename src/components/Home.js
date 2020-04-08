import React from 'react';
import Sidebar from './Sidebar';
import Conversation from './Conversation';
import { Route, Switch, Redirect } from 'react-router';

const Home = props => {
    return (
        <>
            <Sidebar colorMode={props.colorMode} toggleColorMode={props.toggleColorMode}/>
            <Switch>
                <Route path="/conversations/new" render={props => <Conversation isNew {...props} />}/>
                <Route path="/conversations/:id" component={Conversation}/>
                <Route path="/conversations" render={props => <Conversation empty {...props}/>}/>
            </Switch>
        </>
    );
}

export default Home;
