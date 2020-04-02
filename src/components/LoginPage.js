import React from 'react';
import "./Auth.css"


const LoginPage = () => {
    return (
        <form className="box" onSubmit={e => e.preventDefault()}>
            <h1>Login</h1>
            <input className="form-input" type="email" name="email" placeholder="Email"/>
            <input className="form-input" type="password" name="password" placeholder="Password"/>
            <input type="submit" name="submit" value="Login"/>
        </form>
    );
}

export default LoginPage;
