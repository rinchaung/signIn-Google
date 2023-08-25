require('dotenv').config();
require('./auth');
const express = require('express');
const debug = require('debug')('app:oauth');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const app = express();

// Dir_path
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client')));

// Unauthorized 
function isLoggedIn(req, res, next) {
    req.user? next() : res.sendStatus(401); // Unauthorized
}

// Define routes
app.get('/', (req, res) => {
  res.sendFile('index.html');
});

// Session middleware
app.use(session({
    secret: 'secret is my_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

// Set up session management
app.use(passport.initialize());
app.use(passport.session());

// Initiate Google OAuth2 login
app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

// Google OAuth2 callback
app.get('/auth/google/callback', 
    passport.authenticate( 'google', {
        successRedirect: '/auth/protected',
        failureRedirect: '/auth/google/failure'
    }
));

// Protected page (OR) success page
app.get('/auth/protected', isLoggedIn, (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect('/');
    return;
  }

  // Access authenticated user's profile using req.user
  res.send(`Welcome, ${req.user.displayName}!`);
});

// Fail Route
app.get('/auth/google/failure', (req, res) => {
    res.send(`Sorry, something went wrong!`);
});

// Logout user
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// Debugger logging
app.use(function(err, req, res, next) {
  debug('Error: %O', err);
  debug('Stack trace: %O', err.stack);
  res.status(500).send('Sorry, Something broke!');
});

// Start the server
const port = process.env.PORT || 3001;
const server = app.listen(port,  () => {
  debug('Server listening on port %d', server.address().port);
});

