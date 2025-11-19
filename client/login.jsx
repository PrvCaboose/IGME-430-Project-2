const helper = require('./helper.js');
const React = require('react');
const {createRoot} = require('react-dom/client');

const handleLogin = (e) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;

    if (!username || !pass) {
        helper.handleError('Username or Password is empty!');
        return false;
    }

    helper.sendPost(e.target.action, {username, pass});
    return false;
}

const handleSignup = (e) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;
    const isPremium = e.target.querySelector('#isPremium').checked;

    if (!username || !pass || !pass2) {
        helper.handleError('All fields are required!');
        return false;
    }

    if (pass !== pass2) {
        helper.handleError('Passwords do not match!');
        return false;
    }

    helper.sendPost(e.target.action, {username, pass, pass2, isPremium});
    return false;
}

const handlePassChange = (e) => {
    e.preventDefault();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;

    if (!username || !pass || !pass2) {
        helper.handleError('All fields are required!');
        return false;
    }

    if (pass !== pass2) {
        helper.handleError('Passwords do not match!');
        return false;
    }

    helper.sendPost(e.target.action, {username, pass, pass2});
    return false;
}

const LoginWindow = (props) => {
    return (
        <form id='loginForm'
            name='loginForm'
            onSubmit={handleLogin}
            action="/login"
            method='POST'
            className="mainForm">
                <label htmlFor='username'>Username: </label>
                <input id='user' type='text' name='username' placeholder='username' />
                <label htmlFor="pass">Password</label>
                <input id='pass' type='text' name='pass' placeholder='password'/>
                <input className='formSubmit' type='submit' value="Sign in"/>
            </form>
    );
}

const SignupWindow = (props) => {
    return(
        <form id='signupForm'
            name='signupForm'
            onSubmit={handleSignup}
            action="/signup"
            method='POST'
            className='mainForm'>
                <label htmlFor="username">Username: </label>
                <input id='user' type='text' name='username' placeholder='username'/>
                <label htmlFor="pass">Password: </label>
                <input id='pass' type='text' name='pass' placeholder='password'/>
                <label htmlFor="pass2">Password: </label>
                <input id='pass2' type='text' name='pass2' placeholder='retype password'/>
                <label htmlFor='isPremium'>Premium account? </label>
                <input type="checkbox" id='isPremium' name='isPremium' placeholder='is premium account'/>
                <input className='formSubmit' type='submit' value="Sign in"/>
            </form>
    );
}

const PasswordChangeWindow = (props) => {
    return (
        <form id='passChangeForm'
            name='passChangeForm'
            onSubmit={handlePassChange}
            action='/passChange'
            method='POST'
            className='mainForm'>
                <label htmlFor="username">Username: </label>
                <input id='user' type='text' name='username' placeholder='username'/>
                <label htmlFor="pass">New Password: </label>
                <input id='pass' type='text' name='pass' placeholder='password'/>
                <label htmlFor="pass2">Retype Password: </label>
                <input id='pass2' type='text' name='pass2' placeholder='retype password'/>
                <input className='formSubmit' type='submit' value="Change Password"/>
        </form>
    );
}

const init = () => {
    const loginButton = document.getElementById('loginButton');
    const signupButton = document.getElementById('signupButton');
    const passChangeButton = document.getElementById('passChangeButton');

    const root = createRoot(document.getElementById('content'));

    loginButton.addEventListener('click', (e) => {
        e.preventDefault();
        root.render(<LoginWindow/>);
        return false;
    });

    signupButton.addEventListener('click', (e) => {
        e.preventDefault();
        root.render(<SignupWindow/>);
        return false;
    });

    passChangeButton.addEventListener('click', (e) => {
        e.preventDefault();
        root.render(<PasswordChangeWindow/>);
        return false;
    });

    root.render(<LoginWindow/>);
}

window.onload = init;