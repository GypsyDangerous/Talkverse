import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import {AuthProvider} from "./contexts/AuthContext"

ReactDOM.render(<AuthProvider><App /></AuthProvider>, document.getElementById('root'));

