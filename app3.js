const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const config = require('./config');
const { isEmail } = require('validator');
const hbs = require('hbs');

const app = express();
const port = 3000;

// Connect to MongoDB using the configuration
mongoose.connect(`mongodb+srv://${config.username}:${config.password}@sjacksonjavascript.llzbx5b.mongodb.net/${config.database}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Failed to connect to MongoDB:', error));

// Set up flash middleware
app.use(flash());

// Set up body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Set the view engine to hbs
app.set('view engine', 'hbs');

// Register the partials directory
hbs.registerPartials(__dirname + '/views/partials');

// Create a Team schema
const teamSchema = new mongoose.Schema({
  name: String,
  players: [
    {
      name: String,
      position: String,
      salary: Number
    }
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Create a Team model
const Team = mongoose.model('Team', teamSchema);

// Create a User schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

// User Model
const User = mongoose.model('User', userSchema);

// Set up session
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false
}));


// Home
app.get('/', (req, res) => {
  res.render('home');
});

// Register
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      req.flash('error', 'Username already exists');
      return res.redirect('/register');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    await User.create({ username, password: hashedPassword });

    req.flash('success', 'Registration successful');
    res.redirect('/login');
  } catch (error) {
    req.flash('error', 'Registration failed');
    res.redirect('/register');
  }
});

// Login
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });

    // Check the user exists
    if (!user) {
      req.flash('error', 'Invalid username or password');
      return res.redirect('/login');
    }

    // stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      // Authentication successful
      req.session.user = user;
      req.flash('success', 'Login successful');
      res.redirect('/dashboard');
    } else {
      // Invalid password
      req.flash('error', 'Invalid username or password');
      res.redirect('/login');
    }
  } catch (error) {
    req.flash('error', 'Login failed');
    res.redirect('/login');
  }
});

// Dashboard
app.get('/dashboard', async (req, res) => {
  // Check if the user is authenticated
  if (req.session.user) {
    try {
      const teams = await Team.find();
      res.render('dashboard', { user: req.session.user, teams });
    } catch (error) {
      req.flash('error', 'Failed to fetch teams');
      res.redirect('/');
    }
  } else {
    req.flash('error', 'You need to log in first');
    res.redirect('/login');
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Create team 
app.post('/teams', async (req, res) => {
  // Check if the user is authenticated
  if (!req.session.user) {
    req.flash('error', 'You need to log in first');
    return res.redirect('/login');
  }

  const { name } = req.body;
  const team = new Team({ name });

  try {
    await team.save();
    req.flash('success', 'Team created successfully');
    res.redirect('/');
  } catch (error) {
    req.flash('error', 'Failed to create team');
    res.redirect('/');
  }
});

// Add player route
app.post('/teams/:teamId/players', async (req, res) => {
  // Check if the user is authenticated
  if (!req.session.user) {
    req.flash('error', 'You need to log in first');
    return res.redirect('/login');
  }

  const { teamId } = req.params;
  const { name, position } = req.body;

  try {
    const team = await Team.findById(teamId);
    if (!team) {
      req.flash('error', 'Team not found');
      return res.redirect('/');
    }

    team.players.push({ name, position });
    await team.save();

    req.flash('success', 'Player added successfully');
    res.redirect('/');
  } catch (error) {
    req.flash('error', 'Failed to add player');
    res.redirect('/');
  }
});
//update player route
app.post('/teams/:teamId/players/:playerId/update', async (req, res) => {
  const { teamId, playerId } = req.params;
  const { name, position, salary } = req.body;

  try {
    const team = await Team.findById(teamId);
    if (!team) {
      req.flash('error', 'Team not found');
      return res.redirect('/dashboard');
    }

    const player = team.players.id(playerId);
    if (!player) {
      req.flash('error', 'Player not found');
      return res.redirect('/dashboard');
    }

    player.name = name;
    player.position = position;
    player.salary = salary;
    await team.save();

    req.flash('success', 'Player updated successfully');
    res.redirect('/dashboard');
  } catch (error) {
    req.flash('error', 'Failed to update player');
    res.redirect('/dashboard');
  }
});

// Delete player route
app.post('/teams/:teamId/players/:playerId/delete', async (req, res) => {
  // Check if the user is authenticated
  if (!req.session.user) {
    req.flash('error', 'You need to log in first');
    return res.redirect('/login');
  }

  const { teamId, playerId } = req.params;

  try {
    const team = await Team.findById(teamId);
    if (!team) {
      req.flash('error', 'Team not found');
      return res.redirect('/');
    }

    team.players.id(playerId).remove();
    await team.save();

    req.flash('success', 'Player deleted successfully');
    res.redirect('/');
  } catch (error) {
    req.flash('error', 'Failed to delete player');
    res.redirect('/');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
