import React, {useState, useEffect, useContext} from 'react';
import './App.css';
import {AuthContext} from "./contexts/AuthContext"
import socketIOClient from "socket.io-client"
import firebase from "./firebase"
import { BrowserRouter as Router, Route, Redirect, Switch, Link } from "react-router-dom"
import ProtectedRoute from "./components/ProtectedRoute"
import Home from './components/Home';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';

function App() {

  const [isDark, setIsDark] = useState(false)
  const [endPoint, setEndpoint] = useState("http://localhost:4000/")

  const {setCurrentUser} = useContext(AuthContext)

  const toggleColorMode = () => {
    const not = !isDark
    setIsDark(mode => !mode)
    localStorage.setItem("color mode", not)
  }

  useEffect(() => {
    const mode = localStorage.getItem("color mode")
    setIsDark(mode === "true")
  }, [])

  useEffect(() => {
    const socket = socketIOClient(endPoint)

    

  }, [])

  return (
    <Router>
      
        <div className={`app ${isDark ? "app--dark" : ""}`}>
          <Switch>
            <ProtectedRoute exact path="/" component={() => <Home toggleColorMode={toggleColorMode}/>}/>
            <Route path="/login" component={LoginPage}/>
            <Route path="/register" component={RegisterPage}/>
            <Redirect to="/"/>
          </Switch>
        </div>
    </Router>
  );
}

export default App;
