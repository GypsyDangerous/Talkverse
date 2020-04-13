import React, {useState, useEffect} from 'react';
import './App.css';
import firebase from "./firebase"
import { BrowserRouter as Router, Route, Redirect, Switch } from "react-router-dom"
import ProtectedRoute from "./components/ProtectedRoute"
import Home from './components/Home';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Loader from "react-loader"

function App() {

  const [isDark, setIsDark] = useState(false)
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

  return firebaseInit !== false ? (
    <Router>
        <main className={`app ${isDark ? "app--dark" : ""}`}>
          <Switch>
            <ProtectedRoute path="/conversations" component={() => <Home colorMode={isDark} toggleColorMode={toggleColorMode}/>}/>
            <Route path="/login" component={LoginPage}/>
            <Route path="/register" component={RegisterPage}/>
            <Redirect to="/conversations"/>
          </Switch>
        </main>
    </Router>
  ) : <div className={`app ${isDark ? "app--dark" : ""}`}><Loader
    loaded={false}
    lines={15}
    length={0}
    width={15}
    radius={35}
    corners={1}
    rotate={0}
    direction={1}
    color={isDark ? "#fff" : "#000"}
    speed={1}
    trail={60}
    shadow={true}
    hwaccel={true}
    className="spinner"
    zIndex={2e9}
    top="50%"
    left="50%"
    scale={3.0}
    loadedClassName="loadedContent"
  /></div>
}

export default App;
