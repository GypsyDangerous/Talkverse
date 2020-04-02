import React from 'react';

const RegisterPage = () => {
    return (
        <form className="box" onSubmit={e => e.preventDefault()}>
            <h1>Register</h1>
            <input type="text" name="email" placeholder="Username" />
            <input type="email" name="email" placeholder="Email" />
            <input type="password" name="password" placeholder="Create Password" />
            <input type="submit" name="submit" value="Register" />
        </form>
    );
}

export default RegisterPage;
