const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const mongoose = require('mongoose');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('./models/User');
const config = require('./config');
const authRoutes = require('./routes/authRoutes');
const teamRoutes = require('./routes/teams');
const playerRoutes = require('./routes/players');
const dashboardRoutes = require('./routes/dashboardRoutes');
const app = express();
const port = 3000;

const GITHUB_CLIENT_ID = 'Iv1.54cd81750548ab94';
const GITHUB_SECRET_KEY = 'c2b4cc5f4bd4c5f0d69dd363ee65e91da2659f3c';
//const CALLBACK_URL = 'localhost:3000/auth/github/callback';  
const CALLBACK_URL = 'https://myfantasyhockeyapp2.azurewebsites.net/auth/github/callback';

// Connect to MongoDB
mongoose.connect(`mongodb+srv://${config.username}:${config.password}@sjacksonjavascript.llzbx5b.mongodb.net/${config.database}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Failed to connect to MongoDB:', error));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_SECRET_KEY,
  callbackURL: CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback', passport.authenticate('github', {
  failureRedirect: '/login',
  successRedirect: '/dashboard'
}));

app.use(flash());

app.set('view engine', 'hbs');
app.use(express.static('public'));

app.use(authRoutes);
app.use(teamRoutes);
app.use(playerRoutes);
app.use(dashboardRoutes);

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

app.get('/publicview', async (req, res) => {
  try {
    const users = await User.find({});
    res.render('publicview', { users });
  } catch (error) {
    req.flash('error', 'Failed to fetch users');
    res.redirect('/');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});