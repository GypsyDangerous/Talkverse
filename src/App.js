import React, {useState, useEffect, useContext} from 'react';
import './App.css';
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
  const [firebaseInit, setFirebaseInit] = useState(false);

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
    (async () => {
      const result = await firebase.isInitialized();
      setFirebaseInit(result)
    })()
  })

  // useEffect(() => {
  //   const socket = socketIOClient(endPoint)


  // }, [])

  return firebaseInit !== false ? (
    <Router>
        <div className={`app ${isDark ? "app--dark" : ""}`}>
          <Switch>
            <ProtectedRoute path="/conversations" component={() => <Home toggleColorMode={toggleColorMode}/>}/>
            <Route path="/login" component={LoginPage}/>
            <Route path="/register" component={RegisterPage}/>
            <Redirect to="/conversations"/>
          </Switch>
        </div>
    </Router>
  ) : <div id="loader">Loading</div>
}

export default App;
